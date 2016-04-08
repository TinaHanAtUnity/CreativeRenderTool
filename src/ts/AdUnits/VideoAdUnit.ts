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

export class VideoAdUnit extends AbstractAdUnit {

    private _overlay: Overlay;
    private _endScreen: EndScreen;
    private _videoPosition: number;
    private _videoActive: boolean;
    private _watches: number;

    private _onPreparedObserver;
    private _onProgressObserver;
    private _onPlayObserver;
    private _onCompletedObserver;

    constructor(session: SessionManager, placement: Placement, campaign: Campaign) {
        super(session, placement, campaign);

        NativeBridge.AdUnit.onResume.subscribe(this.onResume.bind(this));
        NativeBridge.AdUnit.onPause.subscribe(this.onPause.bind(this));
        NativeBridge.AdUnit.onDestroy.subscribe(this.onDestroy.bind(this));

        this._videoPosition = 0;
        this._videoActive = true;
        this._watches = 0;

        this.prepareVideoPlayer();
        this.prepareOverlay();
        this.prepareEndScreen();
    }

    public show(orientation: ScreenOrientation, keyEvents: any[]): Promise<void> {
        this._showing = true;
        this.setVideoActive(true);
        return NativeBridge.AdUnit.open(['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE);
    }

    public hide(): Promise<void> {
        if(this.isVideoActive()) {
            NativeBridge.VideoPlayer.stop();
        }

        this.getOverlay().container().parentElement.removeChild(this.getOverlay().container());
        this.getEndScreen().container().parentElement.removeChild(this.getEndScreen().container());
        this.unsetReferences();

        NativeBridge.VideoPlayer.onPrepared.unsubscribe(this._onPreparedObserver);
        NativeBridge.VideoPlayer.onProgress.unsubscribe(this._onProgressObserver);
        NativeBridge.VideoPlayer.onPlay.unsubscribe(this._onPlayObserver);
        NativeBridge.VideoPlayer.onCompleted.unsubscribe(this._onCompletedObserver);

        NativeBridge.Listener.sendFinishEvent(this.getPlacement().getId(), this.getFinishState());
        return NativeBridge.AdUnit.close().then(() => {
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
            NativeBridge.VideoPlayer.prepare(this.getCampaign().getVideoUrl(), new Double(this.getPlacement().muteVideo() ? 0.0 : 1.0));
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
        this._onPreparedObserver = NativeBridge.VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(this, duration, width, height));
        this._onProgressObserver = NativeBridge.VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(this, position));
        this._onPlayObserver = NativeBridge.VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(this));
        this._onCompletedObserver = NativeBridge.VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(this, url));
    }

    private prepareOverlay() {
        let overlay = new Overlay(this._placement.muteVideo());

        overlay.render();
        document.body.appendChild(overlay.container());
        overlay.onSkip.subscribe(() => OverlayEventHandlers.onSkip(this));
        overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(this, muted));

        if(!this._placement.allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(this._placement.allowSkipInSeconds());
        }

        this._overlay = overlay;
    }

    private prepareEndScreen() {
        let endScreen = new EndScreen(this.getCampaign());

        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.onReplay.subscribe(() => EndScreenEventHandlers.onReplay(this));
        endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownload(this));
        endScreen.onClose.subscribe(() => this.hide());

        this._endScreen = endScreen;
    }
}
