import { NativeBridge, INativeCallback, CallbackStatus, BatchInvocation, UnityAdsError } from 'NativeBridge';

import { EndScreen } from 'Views/EndScreen';
import { Overlay } from 'Views/Overlay';

import { VideoPlayer } from 'Video/VideoPlayer';
import { NativeVideoPlayer } from 'Video/NativeVideoPlayer';

import { DeviceInfo } from 'Models/DeviceInfo';

import { ConfigManager } from 'Managers/ConfigManager';
import { CampaignManager } from 'Managers/CampaignManager';

import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';

import { Campaign } from 'Models/Campaign';

import { CacheManager } from 'Managers/CacheManager';
import { Placement, PlacementState } from 'Models/Placement';
import { Request } from 'Utilities/Request';
import { Double } from 'Utilities/Double';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';
import { AdUnitManager } from 'Managers/AdUnitManager';
import { AdUnit, FinishState } from 'Models/AdUnit';
import { VideoAdUnit } from 'Models/VideoAdUnit';
import { StorageManager, StorageType } from 'Managers/StorageManager';
import { ConnectivityManager } from 'Managers/ConnectivityManager';
import { Diagnostics } from 'Utilities/Diagnostics';

export class WebView {

    private _nativeBridge: NativeBridge;

    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;

    private _request: Request;

    private _configManager: ConfigManager;
    private _campaignManager: CampaignManager;

    private _videoPlayer: VideoPlayer;

    private _endScreen: EndScreen;
    private _overlay: Overlay;

    private _cacheManager: CacheManager;

    private _storageManager: StorageManager;
    private _sessionManager: SessionManager;

    private _adUnitManager: AdUnitManager;

    private _connectivityManager: ConnectivityManager;

    private _initializedAt: number;
    private _mustReinitialize: boolean = false;
    private _configJsonCheckedAt: number;

    constructor(nativeBridge: NativeBridge) {
        if(window && window.addEventListener) {
            window.addEventListener('error', this.onError.bind(this), false);
        }

        this._nativeBridge = nativeBridge;

        this._deviceInfo = new DeviceInfo();

        this._cacheManager = new CacheManager(nativeBridge);
        this._request = new Request(nativeBridge);

        this._adUnitManager = new AdUnitManager(nativeBridge);

        this._storageManager = new StorageManager(nativeBridge);

        this._connectivityManager = new ConnectivityManager(nativeBridge);
    }

    public initialize(): Promise<void> {
        return this._nativeBridge.invoke('Sdk', 'loadComplete').then((data) => {
            this._clientInfo = new ClientInfo(data);
            return this._deviceInfo.fetch(this._nativeBridge);
        }).then(() => {
            this._configManager = new ConfigManager(this._request, this._clientInfo);
            return this._configManager.fetch();
        }).then(() => {
            this._sessionManager = new SessionManager(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo);
            return this._sessionManager.create();
        }).then(() => {
            this._campaignManager = new CampaignManager(this._request, this._clientInfo, this._deviceInfo);
            this._campaignManager.subscribe('campaign', this.onCampaign.bind(this));

            let defaultPlacement = this._configManager.getDefaultPlacement();
            this._nativeBridge.invoke('Placement', 'setDefaultPlacement', [defaultPlacement.getId()]);

            let placements: Object = this._configManager.getPlacements();
            for(let placementId in placements) {
                if(placements.hasOwnProperty(placementId)) {
                    let placement: Placement = placements[placementId];
                    this._nativeBridge.invoke('Placement', 'setPlacementState', [placement.getId(), PlacementState[PlacementState.NOT_AVAILABLE]]);
                    this._campaignManager.request(placements[placementId]);
                }
            }

            this._initializedAt = this._configJsonCheckedAt = Date.now();
            this._connectivityManager.setListeningStatus(true);
            this._connectivityManager.subscribe('connected', this.onConnected.bind(this));

            return this._nativeBridge.invoke('Sdk', 'initComplete');
        }).catch(error => {
            console.log(error);
        });
    }

    public setFinishState(state: FinishState): void {
        this._adUnitManager.setFinishState(state);
    }

    /*
     PUBLIC API EVENT HANDLERS
     */

    public show(placementId: string, requestedOrientation: ScreenOrientation, callback: INativeCallback): void {
        callback(CallbackStatus.OK);

        if(this._adUnitManager.isShowing()) {
            // finish event is not sent here to avoid confusing simple state machines
            this.showError(false, placementId, 'Can\'t open new ad unit while ad unit is already active');
            return;
        }

        let placement: Placement = this._configManager.getPlacement(placementId);
        if(!placement) {
            this.showError(true, placementId, 'No such placement: ' + placementId);
            return;
        }

        let campaign: Campaign = placement.getCampaign();
        if(!campaign) {
            this.showError(true, placementId, 'Campaign not found');
            return;
        }

        this.shouldReinitialize().then((reinitialize) => {
            this._mustReinitialize = reinitialize;
        });

        let adUnit: VideoAdUnit = new VideoAdUnit(placement, campaign);

        this._sessionManager.sendShow(adUnit);

        this._videoPlayer = new NativeVideoPlayer(this._nativeBridge);
        this._videoPlayer.subscribe('prepared', this.onVideoPrepared.bind(this, adUnit));
        this._videoPlayer.subscribe('progress', this.onVideoProgress.bind(this, adUnit));
        this._videoPlayer.subscribe('start', this.onVideoStart.bind(this, adUnit));
        this._videoPlayer.subscribe('completed', this.onVideoCompleted.bind(this, adUnit));

        this._overlay = new Overlay(placement.muteVideo());
        this._overlay.render();
        document.body.appendChild(this._overlay.container());
        this._overlay.subscribe('skip', this.onSkip.bind(this, adUnit));
        this._overlay.subscribe('mute', this.onMute.bind(this, adUnit));

        this._endScreen = new EndScreen(adUnit);
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());
        this._endScreen.subscribe('replay', this.onReplay.bind(this));
        this._endScreen.subscribe('download', this.onDownload.bind(this));
        this._endScreen.subscribe('close', this.onClose.bind(this));

        let orientation: ScreenOrientation = requestedOrientation;
        if(!placement.useDeviceOrientationForVideo()) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];
        if(placement.disableBackButton()) {
            keyEvents = [KeyCode.BACK];
        }

        if(!placement.allowSkip()) {
            this._overlay.setSkipEnabled(false);
        } else {
            this._overlay.setSkipEnabled(true);
            this._overlay.setSkipDuration(placement.allowSkipInSeconds());
        }

        this._adUnitManager.start(adUnit, orientation, keyEvents);
        this._adUnitManager.subscribe('resumeadunit', this.onAdUnitResume.bind(this));
        this._adUnitManager.subscribe('close', this.onClose.bind(this));
    }

    public hide(): void {
        if(this._adUnitManager.isVideoActive()) {
            this._videoPlayer.stop();
            this._videoPlayer.reset();
        }

        this._adUnitManager.hide();
        this._adUnitManager.unsubscribe();
        this._videoPlayer.unsubscribe();
        this._videoPlayer = null;
        this._overlay.container().parentElement.removeChild(this._overlay.container());
        this._overlay = null;
        this._endScreen.container().parentElement.removeChild(this._endScreen.container());
        this._endScreen = null;
    }

    /*
     CAMPAIGN EVENT HANDLERS
     */

    private onCampaign(placement: Placement, campaign: Campaign): void {
        let cacheableAssets: string[] = [
            campaign.getGameIcon(),
            campaign.getLandscapeUrl(),
            campaign.getPortraitUrl(),
            campaign.getVideoUrl()
        ];

        this._cacheManager.cacheAll(cacheableAssets).then((fileUrls) => {
            campaign.setGameIcon(fileUrls[campaign.getGameIcon()]);
            campaign.setLandscapeUrl(fileUrls[campaign.getLandscapeUrl()]);
            campaign.setPortraitUrl(fileUrls[campaign.getPortraitUrl()]);
            campaign.setVideoUrl(fileUrls[campaign.getVideoUrl()]);

            this._nativeBridge.invoke('Placement', 'setPlacementState', [placement.getId(), PlacementState[PlacementState.READY]]).then(() => {
                this._nativeBridge.invoke('Listener', 'sendReadyEvent', [placement.getId()]);
            });
        });
    }

    /*
     AD UNIT EVENT HANDLERS
     */

    private onAdUnitResume(adUnit: VideoAdUnit): void {
        if(adUnit.isVideoActive()) {
            this._videoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        }
    }

    /*
     VIDEO EVENT HANDLERS
     */

    private onVideoPrepared(adUnit: AdUnit, duration: number, width: number, height: number): void {
        this._overlay.setVideoDuration(duration);
        this._videoPlayer.setVolume(new Double(this._overlay.isMuted() ? 0.0 : 1.0)).then(() => {
            if(this._adUnitManager.getVideoPosition() > 0) {
                this._videoPlayer.seekTo(this._adUnitManager.getVideoPosition()).then(() => {
                    this._videoPlayer.play();
                });
            } else {
                this._videoPlayer.play();
            }
        });
    }

    private onVideoProgress(adUnit: AdUnit, position: number): void {
        if(position > 0) {
            this._adUnitManager.setVideoPosition(position);
        }
        this._overlay.setVideoProgress(position);
    }

    private onVideoStart(adUnit: AdUnit): void {
        this._sessionManager.sendStart(adUnit);

        if(this._adUnitManager.getWatches() === 0) {
            // send start callback only for first watch, never for rewatches
            this._nativeBridge.invoke('Listener', 'sendStartEvent', [adUnit.getPlacement().getId()]);
        }

        this._adUnitManager.newWatch();
    }

    private onVideoCompleted(adUnit: AdUnit, url: string): void {
        this._adUnitManager.setVideoActive(false);
        this.setFinishState(FinishState.COMPLETED);
        this._sessionManager.sendView(adUnit);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
        this._storageManager.get<boolean>(StorageType.PUBLIC, 'integration_test.value').then(integrationTest => {
            if(integrationTest) {
                this._nativeBridge.rawInvoke('com.unity3d.ads.test.integration', 'IntegrationTest', 'onVideoCompleted', [adUnit.getPlacement().getId()]);
            }
        });
    }

    /*
    OVERLAY EVENT HANDLERS
     */

    private onSkip(adUnit: AdUnit): void {
        this._videoPlayer.pause();
        this._adUnitManager.setVideoActive(false);
        this.setFinishState(FinishState.SKIPPED);
        this._sessionManager.sendSkip(adUnit);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
    }

    private onMute(adUnit: AdUnit, muted: boolean): void {
        this._videoPlayer.setVolume(new Double(muted ? 0.0 : 1.0));
    }

    /*
     ENDSCREEN EVENT HANDLERS
     */

    private onReplay(adUnit: AdUnit): void {
        this._adUnitManager.setVideoActive(true);
        this._adUnitManager.setVideoPosition(0);
        this._overlay.setSkipEnabled(true);
        this._overlay.setSkipDuration(0);
        this._endScreen.hide();
        this._overlay.show();
        this._nativeBridge.invoke('AdUnit', 'setViews', [['videoplayer', 'webview']]).then(() => {
            this._videoPlayer.prepare(adUnit.getCampaign().getVideoUrl(), new Double(adUnit.getPlacement().muteVideo() ? 0.0 : 1.0));
        });
    }

    private onDownload(adUnit: AdUnit): void {
        this._sessionManager.sendClick(adUnit);
        this._nativeBridge.invoke('Listener', 'sendClickEvent', [adUnit.getPlacement().getId()]);
        this._nativeBridge.invoke('Intent', 'launch', [{
            'action': 'android.intent.action.VIEW',
            'uri': 'market://details?id=' + adUnit.getCampaign().getAppStoreId()
        }]);
    }

    private onClose(adUnit: AdUnit): void {
        this.hide();
        if(this._mustReinitialize) {
            this.reinitialize();
        } else {
            this._nativeBridge.invoke('Placement', 'setPlacementState', [adUnit.getPlacement().getId(), PlacementState[PlacementState.WAITING]]);
            this._campaignManager.request(adUnit.getPlacement());
        }
    }

    /*
     CONNECTIVITY EVENT HANDLERS
     */

    private onConnected(wifi: boolean, networkType: number) {
        if(!this._adUnitManager.isShowing()) {
            this.shouldReinitialize().then((reinitialize) => {
                if(reinitialize) {
                    if(this._adUnitManager.isShowing()) {
                        this._mustReinitialize = true;
                    } else {
                        this.reinitialize();
                    }
                }
            });
        }
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
     GENERIC ONERROR HANDLER
     */
    private onError(event: ErrorEvent): boolean {
        Diagnostics.trigger(this._request, {
            'type': 'js_error',
            'message': event.message,
            'url': event.filename,
            'line': event.lineno,
            'column': event.colno,
            'object': event.error
        }, this._deviceInfo, this._clientInfo);
        return true; // returning true from window.onerror will suppress the error (in theory)
    }

    /*
     REINITIALIZE LOGIC
     */

    private reinitialize() {
        // todo: make sure session data and other similar things are saved before issuing reinit
        this._nativeBridge.invoke('Sdk', 'reinitialize');
    }

    private getConfigJson(): Promise<any[]> {
        return this._request.get(this._clientInfo.getConfigUrl() + '?ts=' + Date.now() + '&sdkVersion=' + this._clientInfo.getSdkVersion());
    }

    private shouldReinitialize(): Promise<boolean> {
        if(!this._clientInfo.getWebviewHash()) {
            return Promise.resolve(false);
        }
        if(Date.now() - this._configJsonCheckedAt <= 15 * 60 * 1000) {
            return Promise.resolve(false);
        }
        return this.getConfigJson().then(([response]) => {
            this._configJsonCheckedAt = Date.now();
            let configJson = JSON.parse(response);
            return configJson.hash === this._clientInfo.getWebviewHash();
        }).catch((error) => {
            return false;
        });
    }
}
