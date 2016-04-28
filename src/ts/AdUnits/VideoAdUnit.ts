import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { FinishState } from 'Constants/FinishState';
import { VideoEventHandlers} from 'EventHandlers/VideoEventHandlers';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Double } from 'Utilities/Double';
import { SessionManager } from 'Managers/SessionManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Vast } from 'Models/Vast';

export class VideoAdUnit extends AbstractAdUnit {

    private _overlay: Overlay;
    private _endScreen: EndScreen;
    private _videoPosition: number;
    private _videoActive: boolean;
    private _watches: number;

    private _onResumeObserver;
    private _onPauseObserver;
    private _onDestroyObserver;

    private _onPreparedObserver;
    private _onProgressObserver;
    private _onPlayObserver;
    private _onCompletedObserver;

    constructor(nativeBridge: NativeBridge, session: SessionManager, placement: Placement, campaign: Campaign, vast: Vast) {
        super(nativeBridge, session, placement, campaign, vast);

        this._onResumeObserver = this._nativeBridge.AdUnit.onResume.subscribe(this.onResume.bind(this));
        this._onPauseObserver = this._nativeBridge.AdUnit.onPause.subscribe(this.onPause.bind(this));
        this._onDestroyObserver = this._nativeBridge.AdUnit.onDestroy.subscribe(this.onDestroy.bind(this));

        this._videoPosition = 0;
        this._videoActive = true;
        this._watches = 0;

        this.prepareVideoPlayer();
        this.prepareOverlay();
        if (campaign) {
            this.prepareEndScreen();
        }
    }

    public show(orientation: ScreenOrientation, keyEvents: any[]): Promise<void> {
        this._showing = true;
        this.setVideoActive(true);
        return this._nativeBridge.AdUnit.open(['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE);
    }

    public hide(): Promise<void> {
        if(this.isVideoActive()) {
            this._nativeBridge.VideoPlayer.stop();
        }

        this.getOverlay().container().parentElement.removeChild(this.getOverlay().container());
        if (this.getEndScreen()) {
            this.getEndScreen().container().parentElement.removeChild(this.getEndScreen().container());
        }
        this.unsetReferences();

        this._nativeBridge.AdUnit.onResume.unsubscribe(this._onResumeObserver);
        this._nativeBridge.AdUnit.onPause.unsubscribe(this._onPauseObserver);
        this._nativeBridge.AdUnit.onDestroy.unsubscribe(this._onDestroyObserver);

        this._nativeBridge.VideoPlayer.onPrepared.unsubscribe(this._onPreparedObserver);
        this._nativeBridge.VideoPlayer.onProgress.unsubscribe(this._onProgressObserver);
        this._nativeBridge.VideoPlayer.onPlay.unsubscribe(this._onPlayObserver);
        this._nativeBridge.VideoPlayer.onCompleted.unsubscribe(this._onCompletedObserver);

        this._nativeBridge.Listener.sendFinishEvent(this.getPlacement().getId(), this.getFinishState());
        return this._nativeBridge.AdUnit.close().then(() => {
            this._showing = false;
            this.onClose.trigger();
        });
    }

    public isShowing(): boolean {
        return this._showing;
    }

    public getWatches(): number {
        return this._watches;
    }

    public getVideoPosition(): number {
        return this._videoPosition;
    }

    public setVideoPosition(position: number): void {
        this._videoPosition = position;
    }

    public isVideoActive(): boolean {
        return this._videoActive;
    }

    public setVideoActive(active: boolean): void {
        this._videoActive = active;
    }

    public setWatches(watches: number): void {
        this._watches = watches;
    }

    public getOverlay(): Overlay {
        return this._overlay;
    }

    public getEndScreen(): EndScreen {
        return this._endScreen;
    }

    public newWatch() {
        this._watches += 1;
    }

    public unsetReferences() {
        this._endScreen = null;
        this._overlay = null;
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onResume(): void {
        if(this._showing && this.isVideoActive()) {
            if (this.getCampaign()) {
                this._nativeBridge.VideoPlayer.prepare(this.getCampaign().getVideoUrl(), new Double(this.getPlacement().muteVideo() ? 0.0 : 1.0));
            } else if (this.getVast()) {
                this._nativeBridge.VideoPlayer.prepare(this.getVast().getVideoUrl(), new Double(this.getPlacement().muteVideo() ? 0.0 : 1.0));
            }
        }
    }

    private onPause(finishing: boolean): void {
        if(finishing && this._showing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    private onDestroy(finishing: boolean): void {
        if(this._showing && finishing) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }

    /*
     PRIVATES
     */
    private prepareVideoPlayer() {
        this._onPreparedObserver = this._nativeBridge.VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(this._nativeBridge, this, duration, width, height));
        this._onProgressObserver = this._nativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(this._nativeBridge, this, position));
        this._onPlayObserver = this._nativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(this._nativeBridge, this));
        this._onCompletedObserver = this._nativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(this._nativeBridge, this, url));
    }

    private prepareOverlay() {
        let overlay = new Overlay(this._placement.muteVideo());

        overlay.render();
        document.body.appendChild(overlay.container());
        overlay.onSkip.subscribe(() => OverlayEventHandlers.onSkip(this._nativeBridge, this));
        overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(this._nativeBridge, this, muted));

        if(!this._placement.allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(this._placement.allowSkipInSeconds());
        }

        this._overlay = overlay;
    }

    private prepareEndScreen() {
        let endScreen = new EndScreen(this.getCampaign(), this.getVast());

        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onReplay.subscribe(() => EndScreenEventHandlers.onReplay(this._nativeBridge, this));
        endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownload(this._nativeBridge, this));
        endScreen.onClose.subscribe(() => this.hide());

        this._endScreen = endScreen;
    }
}
