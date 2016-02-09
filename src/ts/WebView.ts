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
import { StorageManager, StorageType } from 'Managers/StorageManager';

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


    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        this._deviceInfo = new DeviceInfo();

        this._cacheManager = new CacheManager(nativeBridge);
        this._request = new Request(nativeBridge);

        this._adUnitManager = new AdUnitManager(nativeBridge);

        this._storageManager = new StorageManager(nativeBridge);
    }

    public initialize(): Promise<void> {
        return this._nativeBridge.invoke('Sdk', 'loadComplete').then(([gameId, testMode, appVersion, sdkVersion, platform, debuggable]) => {
            this._clientInfo = new ClientInfo(gameId, testMode, appVersion, sdkVersion, platform, debuggable);
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

    public show(placementId: string, callback: INativeCallback): void {
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

        let adUnit: AdUnit = new AdUnit(placement, campaign);

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

        let orientation: ScreenOrientation = ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED;
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

        this._adUnitManager.start(adUnit, orientation, keyEvents).then(() => {
            this._videoPlayer.prepare(campaign.getVideoUrl(), new Double(placement.muteVideo() ? 0.0 : 1.0));
        });
        this._adUnitManager.subscribe('close', this.onClose.bind(this));
    }

    public hide(): void {
        this._adUnitManager.hide();
        this._adUnitManager.unsubscribe();
        this._videoPlayer.stop();
        this._videoPlayer.reset();
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
     VIDEO EVENT HANDLERS
     */

    private onVideoPrepared(adUnit: AdUnit, duration: number, width: number, height: number): void {
        this._overlay.setVideoDuration(duration);
        this._videoPlayer.setVolume(new Double(this._overlay.isMuted() ? 0.0 : 1.0)).then(() => {
            this._videoPlayer.play();
        });
    }

    private onVideoProgress(adUnit: AdUnit, position: number): void {
        this._overlay.setVideoProgress(position);
    }

    private onVideoStart(adUnit: AdUnit): void {
        this._sessionManager.sendStart(adUnit);
        this._nativeBridge.invoke('Listener', 'sendStartEvent', [adUnit.getPlacement().getId()]);
    }

    private onVideoCompleted(adUnit: AdUnit, url: string): void {
        this.setFinishState(FinishState.COMPLETED);
        this._sessionManager.sendView(adUnit);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
        this._storageManager.get<boolean>(StorageType.PUBLIC, 'integration_test').then(integrationTest => {
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
        this._overlay.setSkipEnabled(true);
        this._overlay.setSkipDuration(0);
        this._videoPlayer.seekTo(0).then(() => {
            this._endScreen.hide();
            this._overlay.show();
            this._nativeBridge.invoke('AdUnit', 'setViews', [['videoplayer', 'webview']]);
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
        this._nativeBridge.invoke('Placement', 'setPlacementState', [adUnit.getPlacement().getId(), PlacementState[PlacementState.WAITING]]);
        this._campaignManager.request(adUnit.getPlacement());
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
}