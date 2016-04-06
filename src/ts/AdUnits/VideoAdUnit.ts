import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AdUnitApi } from 'Native/Api/AdUnit';
import { ListenerApi} from 'Native/Api/Listener';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { VideoPlayerApi } from 'Native/Api/VideoPlayer';
import { FinishState } from 'Constants/FinishState';
import { VideoEventHandlers} from 'EventHandlers/VideoEventHandlers';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Double } from 'Utilities/Double';

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

    constructor(placement: Placement, campaign: Campaign) {
        super(placement, campaign);

        AdUnitApi.onResume.subscribe(this.onResume.bind(this));
        AdUnitApi.onPause.subscribe(this.onPause.bind(this));
        AdUnitApi.onDestroy.subscribe(this.onDestroy.bind(this));

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
        return AdUnitApi.open(['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE);
    }

    public hide(): Promise<void> {
        if(this.isVideoActive()) {
            VideoPlayerApi.stop();
        }

        this.getOverlay().container().parentElement.removeChild(this.getOverlay().container());
        this.getEndScreen().container().parentElement.removeChild(this.getEndScreen().container());
        this.unsetReferences();

        VideoPlayerApi.onPrepared.unsubscribe(this._onPreparedObserver);
        VideoPlayerApi.onProgress.unsubscribe(this._onProgressObserver);
        VideoPlayerApi.onPlay.unsubscribe(this._onPlayObserver);
        VideoPlayerApi.onCompleted.unsubscribe(this._onCompletedObserver);

        ListenerApi.sendFinishEvent(this.getPlacement().getId(), this.getFinishState());
        return AdUnitApi.close().then(() => {
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
            VideoPlayerApi.prepare(this.getCampaign().getVideoUrl(), new Double(this.getPlacement().muteVideo() ? 0.0 : 1.0));
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
        this._onPreparedObserver = VideoPlayerApi.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(this, duration, width, height));
        this._onProgressObserver = VideoPlayerApi.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(this, position));
        this._onPlayObserver = VideoPlayerApi.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(this));
        this._onCompletedObserver = VideoPlayerApi.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(this, url));
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
