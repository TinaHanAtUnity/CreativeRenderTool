import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { KeyCode } from 'Constants/Android/KeyCode';
import { BatchInvocation } from 'Native/BatchInvocation';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { AdUnit } from 'Native/Api/AdUnit';
import { Listener } from 'Native/Api/Listener';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { VideoPlayer } from 'Native/Api/VideoPlayer';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { VideoEventHandlers} from 'EventHandlers/VideoEventHandlers';
import { OverlayEventHandlers } from 'EventHandlers/OverlayEventHandlers';
import { EndScreenEventHandlers } from 'EventHandlers/EndScreenEventHandlers';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export class VideoAdUnit extends AbstractAdUnit {

    private _overlay: Overlay;
    private _endScreen: EndScreen;
    private _videoPosition: number;
    private _videoActive: boolean;
    private _watches: number;

    constructor(placement: Placement, campaign: Campaign) {
        super(placement, campaign);

        AdUnit.onResume.subscribe(this.onResume.bind(this));
        AdUnit.onPause.subscribe(this.onPause.bind(this));
        AdUnit.onDestroy.subscribe(this.onDestroy.bind(this));

        this._videoPosition = 0;
        this._videoActive = true;
        this._watches = 0;

        this.prepareVideoPlayer();
        this.prepareOverlay();
        this.prepareEndScreen();
    }

    public start(orientation: ScreenOrientation, keyEvents: any[]): Promise<void> {
        this._showing = true;
        this.setVideoActive(true);
        return AdUnit.open(['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE);
    }

    public hide(): void {
        if(this.isVideoActive()) {
            VideoPlayer.stop();
        }

        this.getOverlay().container().parentElement.removeChild(this.getOverlay().container());
        this.getEndScreen().container().parentElement.removeChild(this.getEndScreen().container());
        this.unsetReferences();


        AdUnit.close();
        Listener.sendFinishEvent(this.getPlacement().getId(), this.getFinishState());
        this._showing = false;
    }

    public isShowing(): boolean {
        return this._showing;
    }

    public getWatches(): number {
        return this._watches;
    }

    public create(placement: Placement, requestedOrientation: ScreenOrientation) {
        if(this.isShowing()) {
            // finish event is not sent here to avoid confusing simple state machines
            this.showError(false, placement.getId(), 'Can\'t open new ad unit while ad unit is already active');
            return;
        }

        let campaign: Campaign = placement.getCampaign();
        if(!campaign) {
            this.showError(true, placement.getId(), 'Campaign not found');
            return;
        }

        let orientation: ScreenOrientation = requestedOrientation;
        if(!placement.useDeviceOrientationForVideo()) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];
        if(placement.disableBackButton()) {
            keyEvents = [KeyCode.BACK];
        }

        this.start(orientation, keyEvents);
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
     ERROR HANDLING HELPER METHODS
     */

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        let batch: BatchInvocation = new BatchInvocation(NativeBridge.getInstance());
        batch.queue('Sdk', 'logError', ['Show invocation failed: ' + errorMsg]);
        batch.queue('Listener', 'sendErrorEvent', [UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg]);
        if(sendFinish) {
            batch.queue('Listener', 'sendFinishEvent', [placementId, FinishState[FinishState.ERROR]]);
        }
        NativeBridge.getInstance().invokeBatch(batch);
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onResume(): void {
        if(this._showing) {
            // this.trigger('resumeadunit', this._adUnit);
        }
    }

    private onPause(finishing: boolean): void {
        if(finishing && this._showing) {
            this.setFinishState(FinishState.SKIPPED);
            // this.trigger('close', this._adUnit);
        }
    }

    private onDestroy(finishing: boolean): void {
        if(this._showing && finishing) {
            this.setFinishState(FinishState.SKIPPED);
            // this.trigger('close', this._adUnit);
        }
    }

    /*
     AD UNIT EVENT HANDLERS
     */

    /*private onAdUnitResume(adUnit: VideoAdUnit): void {
        if(adUnit.isVideoActive()) {
            VideoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        }
    }*/

    /*
     PRIVATES
     */
    private prepareVideoPlayer() {
        VideoPlayer.onPrepared.subscribe((duration, width, height) => VideoEventHandlers.onVideoPrepared(this, duration, width, height));
        VideoPlayer.onProgress.subscribe((position) => VideoEventHandlers.onVideoProgress(this, position));
        VideoPlayer.onPlay.subscribe(() => VideoEventHandlers.onVideoStart(this));
        VideoPlayer.onCompleted.subscribe((url) => VideoEventHandlers.onVideoCompleted(this, url));
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
        // endScreen.onDownload.subscribe(() => EndScreenEventHandlers.onDownload(this));

        this._endScreen = endScreen;
    }
}
