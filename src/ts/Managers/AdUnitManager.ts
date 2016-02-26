import { NativeBridge } from 'NativeBridge';
import { FinishState } from 'Models/AdUnit';
import { VideoAdUnit } from 'Models/VideoAdUnit';
import { Observable } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { AdUnit } from 'Models/AdUnit';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { NativeVideoPlayer } from 'Video/NativeVideoPlayer';
import { Overlay } from 'Views/Overlay';
import { BatchInvocation, UnityAdsError } from 'NativeBridge';
import { KeyCode } from 'Constants/Android/KeyCode';
import { Double } from 'Utilities/Double';
import { StorageManager, StorageType } from 'StorageManager';
import { SessionManager } from 'SessionManager';

// currently this class is hardcoded for video ads, this should be refactored for generic support for different ad units TODO
export class AdUnitManager extends Observable {
    private _nativeBridge: NativeBridge;
    private _adUnit: VideoAdUnit;
    private _showing: boolean = false;
    private _sessionManager: SessionManager;
    private _storageManager: StorageManager;

    constructor(nativeBridge: NativeBridge, sessionManager: SessionManager, storageManager: StorageManager) {
        super();
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe('ADUNIT_ON_RESUME', this.onResume.bind(this));
        this._nativeBridge.subscribe('ADUNIT_ON_PAUSE', this.onPause.bind(this));
        this._nativeBridge.subscribe('ADUNIT_ON_DESTROY', this.onDestroy.bind(this));
        this._sessionManager = sessionManager;
        this._storageManager = storageManager;
    }

    public start(adUnit: VideoAdUnit, orientation: ScreenOrientation, keyEvents: any[]): Promise<any[]> {
        this._showing = true;
        this._adUnit = adUnit;
        this._adUnit.setVideoActive(true);

        return this._nativeBridge.invoke('AdUnit', 'open', [['videoplayer', 'webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE]);
    }

    public hide(): void {
        if(this._adUnit.isVideoActive()) {
            this._adUnit.getVideoPlayer().stop();
            this._adUnit.getVideoPlayer().reset();
        }

        this.unsubscribe();
        this._adUnit.getVideoPlayer().unsubscribe();
        this._adUnit.getOverlay().container().parentElement.removeChild(this._adUnit.getOverlay().container());
        this._adUnit.getEndScreen().container().parentElement.removeChild(this._adUnit.getEndScreen().container());
        this._adUnit.unsetReferences();


        this._nativeBridge.invoke('AdUnit', 'close', []);
        this._nativeBridge.invoke('Listener', 'sendFinishEvent', [this._adUnit.getPlacement().getId(), FinishState[this._adUnit.getFinishState()]]);
        this._showing = false;
        this._adUnit = null;
    }

    public setFinishState(finishState: FinishState): void {
        this._adUnit.setFinishState(finishState);
    }

    public isShowing(): boolean {
        return this._showing;
    }

    public getWatches(): number {
        return this._adUnit.getWatches();
    }

    public create(placement: Placement, requestedOrientation: ScreenOrientation): AdUnit {
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

        let videoPlayer = new NativeVideoPlayer(this._nativeBridge);
        let overlay = new Overlay(placement.muteVideo());

        let adUnit: VideoAdUnit = new VideoAdUnit(placement, campaign, videoPlayer, overlay, this._sessionManager, this._storageManager);

        videoPlayer.subscribe('prepared', this.onVideoPrepared.bind(this, adUnit));
        videoPlayer.subscribe('progress', this.onVideoProgress.bind(this, adUnit));
        videoPlayer.subscribe('start', this.onVideoStart.bind(this, adUnit));
        videoPlayer.subscribe('completed', this.onVideoCompleted.bind(this, adUnit));

        overlay.render();
        document.body.appendChild(overlay.container());
        overlay.subscribe('skip', this.onSkip.bind(this, adUnit));
        overlay.subscribe('mute', this.onMute.bind(this, adUnit));

        let endScreen = adUnit.getEndScreen();
        endScreen.render();
        endScreen.hide();
        document.body.appendChild(endScreen.container());
        endScreen.subscribe('replay', this.onReplay.bind(this));
        endScreen.subscribe('download', this.onDownload.bind(this));

        let orientation: ScreenOrientation = requestedOrientation;
        if(!placement.useDeviceOrientationForVideo()) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];
        if(placement.disableBackButton()) {
            keyEvents = [KeyCode.BACK];
        }

        if(!placement.allowSkip()) {
            overlay.setSkipEnabled(false);
        } else {
            overlay.setSkipEnabled(true);
            overlay.setSkipDuration(placement.allowSkipInSeconds());
        }

        this.start(adUnit, orientation, keyEvents);
        this.subscribe('resumeadunit', this.onAdUnitResume.bind(this));

        return adUnit;
    }

    /*
     ERROR HANDLING HELPER METHODS
     */

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        let batch: BatchInvocation = new BatchInvocation(this._nativeBridge);
        batch.queue('Sdk', 'logError', ['Show invocation failed: ' + errorMsg]);
        batch.queue('Listener', 'sendErrorEvent', [UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg]);
        if(sendFinish) {
            batch.queue('Listener', 'sendFinishEvent', [placementId, FinishState[FinishState.ERROR]]);
        }
        this._nativeBridge.invokeBatch(batch);
    }

    /*
     ANDROID ACTIVITY LIFECYCLE EVENTS
     */

    private onResume(): void {
        if(this._showing) {
            this.trigger('resumeadunit', this._adUnit);
        }
    }

    private onPause(finishing: boolean): void {
        if(finishing && this._showing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit);
        }
    }

    private onDestroy(finishing: boolean): void {
        if(this._showing && finishing) {
            this._adUnit.setFinishState(FinishState.SKIPPED);
            this.trigger('close', this._adUnit);
        }
    }


    /*
     AD UNIT EVENT HANDLERS
     */

    private onAdUnitResume(adUnit: VideoAdUnit): void {
        if(adUnit.isVideoActive()) {
            adUnit.getVideoPlayer().prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        }
    }

    /*
     VIDEO EVENT HANDLERS
     */

    private onVideoPrepared(adUnit: VideoAdUnit, duration: number, width: number, height: number): void {
        let videoPlayer = adUnit.getVideoPlayer();
        adUnit.getOverlay().setVideoDuration(duration);
        videoPlayer.setVolume(new Double(adUnit.getOverlay().isMuted() ? 0.0 : 1.0)).then(() => {
            if(adUnit.getVideoPosition() > 0) {
                videoPlayer.seekTo(adUnit.getVideoPosition()).then(() => {
                    videoPlayer.play();
                });
            } else {
                videoPlayer.play();
            }
        });
    }

    private onVideoProgress(adUnit: VideoAdUnit, position: number): void {
        if(position > 0) {
            adUnit.setVideoPosition(position);
        }
        adUnit.getOverlay().setVideoProgress(position);
    }

    private onVideoStart(adUnit: VideoAdUnit): void {
        adUnit.getSessionManager().sendStart(adUnit);

        if(adUnit.getWatches() === 0) {
            // send start callback only for first watch, never for rewatches
            this._nativeBridge.invoke('Listener', 'sendStartEvent', [adUnit.getPlacement().getId()]);
        }

        adUnit.newWatch();
    }

    private onVideoCompleted(adUnit: VideoAdUnit, url: string): void {
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.COMPLETED);
        adUnit.getSessionManager().sendView(adUnit);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        adUnit.getOverlay().hide();
        adUnit.getEndScreen().show();
        adUnit.getStorageManager().get<boolean>(StorageType.PUBLIC, 'integration_test.value').then(integrationTest => {
            if(integrationTest) {
                this._nativeBridge.rawInvoke('com.unity3d.ads.test.integration', 'IntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
            }
        });
    }

    /*
     OVERLAY EVENT HANDLERS
     */

    private onSkip(adUnit: VideoAdUnit): void {
        adUnit.getVideoPlayer().pause();
        adUnit.setVideoActive(false);
        adUnit.setFinishState(FinishState.SKIPPED);
        adUnit.getSessionManager().sendSkip(adUnit);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        adUnit.getOverlay().hide();
        adUnit.getEndScreen().show();
    }

    private onMute(adUnit: VideoAdUnit, muted: boolean): void {
        adUnit.getVideoPlayer().setVolume(new Double(muted ? 0.0 : 1.0));
    }

    /*
     ENDSCREEN EVENT HANDLERS
     */

    private onReplay(adUnit: VideoAdUnit): void {
        adUnit.setVideoActive(true);
        adUnit.setVideoPosition(0);
        adUnit.getOverlay().setSkipEnabled(true);
        adUnit.getOverlay().setSkipDuration(0);
        adUnit.getEndScreen().hide();
        adUnit.getOverlay().show();
        this._nativeBridge.invoke('AdUnit', 'setViews', [['videoplayer', 'webview']]).then(() => {
            adUnit.getVideoPlayer().prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        });
    }

    private onDownload(adUnit: AdUnit): void {
        adUnit.getSessionManager().sendClick(adUnit);
        this._nativeBridge.invoke('Listener', 'sendClickEvent', [adUnit.getPlacement().getId()]);
        this._nativeBridge.invoke('Intent', 'launch', [{
            'action': 'android.intent.action.VIEW',
            'uri': 'market://details?id=' + adUnit.getCampaign().getAppStoreId()
        }]);
    }

}