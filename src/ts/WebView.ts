import { NativeBridge } from 'NativeBridge';

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
import { Zone, ZoneState } from 'Models/Zone';
import { Request } from 'Utilities/Request';
import { Double } from 'Utilities/Double';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';

enum FinishState {
    COMPLETED,
    SKIPPED,
    ERROR
}

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

    private _sessionManager: SessionManager;

    private _finishState: FinishState;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        this._deviceInfo = new DeviceInfo();

        this._cacheManager = new CacheManager(nativeBridge);
        this._request = new Request(nativeBridge);

        this._finishState = null;
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

            let defaultZone = this._configManager.getDefaultZone();
            this._nativeBridge.invoke('Zone', 'setDefaultZone', [defaultZone.getId()]);

            let zones: Object = this._configManager.getZones();
            for(let zoneId in zones) {
                if(zones.hasOwnProperty(zoneId)) {
                    let zone: Zone = zones[zoneId];
                    this._nativeBridge.invoke('Zone', 'setZoneState', [zone.getId(), ZoneState[ZoneState.NOT_AVAILABLE]]);
                    this._campaignManager.request(zones[zoneId]);
                }
            }

            return this._nativeBridge.invoke('Sdk', 'initComplete');
        }).catch(error => {
            console.log(error);
        });
    }

    public setFinishState(state: FinishState): void {
        if(this._finishState !== FinishState.COMPLETED) {
            this._finishState = state;
        }
    }

    /*
     PUBLIC API EVENT HANDLERS
     */

    public show(zoneId: string): void {
        let zone: Zone = this._configManager.getZone(zoneId);
        let campaign: Campaign = zone.getCampaign();

        this._sessionManager.sendShow(zone, campaign);

        this._videoPlayer = new NativeVideoPlayer(this._nativeBridge);
        this._videoPlayer.subscribe('prepared', this.onVideoPrepared.bind(this, zone, campaign));
        this._videoPlayer.subscribe('progress', this.onVideoProgress.bind(this, zone, campaign));
        this._videoPlayer.subscribe('start', this.onVideoStart.bind(this, zone, campaign));
        this._videoPlayer.subscribe('completed', this.onVideoCompleted.bind(this, zone, campaign));

        this._overlay = new Overlay(zone.muteVideo());
        this._overlay.render();
        document.body.appendChild(this._overlay.container());
        this._overlay.subscribe('skip', this.onSkip.bind(this, zone, campaign));
        this._overlay.subscribe('mute', this.onMute.bind(this, zone, campaign));

        this._endScreen = new EndScreen(zone, campaign);
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());
        this._endScreen.subscribe('replay', this.onReplay.bind(this));
        this._endScreen.subscribe('download', this.onDownload.bind(this));
        this._endScreen.subscribe('close', this.onClose.bind(this));

        let orientation: ScreenOrientation = ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED;
        if(!zone.useDeviceOrientationForVideo()) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];
        if(zone.disableBackButton()) {
            keyEvents = [KeyCode.BACK];
        }

        if(!zone.allowSkip()) {
            this._overlay.setSkipEnabled(false);
        } else {
            this._overlay.setSkipEnabled(true);
            this._overlay.setSkipDuration(zone.allowSkipInSeconds());
        }

        this._nativeBridge.invoke('AdUnit', 'open', [['videoplayer', 'webview'], orientation, keyEvents]).then(() => {
            this._videoPlayer.prepare(campaign.getVideoUrl(), new Double(zone.muteVideo() ? 0.0 : 1.0));
        });
    }

    public hide(zone: Zone, campaign: Campaign): void {
        this._nativeBridge.invoke('AdUnit', 'close', []);
        this._nativeBridge.invoke('Listener', 'sendFinishEvent', [zone.getId(), FinishState[this._finishState]]);
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

    private onCampaign(zone: Zone, campaign: Campaign): void {
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

            this._nativeBridge.invoke('Zone', 'setZoneState', [zone.getId(), ZoneState[ZoneState.READY]]).then(() => {
                this._nativeBridge.invoke('Listener', 'sendReadyEvent', [zone.getId()]);
            });
        });
    }

    /*
     VIDEO EVENT HANDLERS
     */

    private onVideoPrepared(zone: Zone, campaign: Campaign, duration: number, width: number, height: number): void {
        this._overlay.setVideoDuration(duration);
        this._videoPlayer.setVolume(new Double(this._overlay.isMuted() ? 0.0 : 1.0)).then(() => {
            this._videoPlayer.play();
        });
    }

    private onVideoProgress(zone: Zone, campaign: Campaign, position: number): void {
        this._overlay.setVideoProgress(position);
    }

    private onVideoStart(zone: Zone, campaign: Campaign): void {
        this._sessionManager.sendStart(zone, campaign);
        this._nativeBridge.invoke('Listener', 'sendStartEvent', [zone.getId()]);
    }

    private onVideoCompleted(zone: Zone, campaign: Campaign, url: string): void {
        this.setFinishState(FinishState.COMPLETED);
        this._sessionManager.sendView(zone, campaign);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
    }

    /*
    OVERLAY EVENT HANDLERS
     */

    private onSkip(zone: Zone, campaign: Campaign): void {
        this._videoPlayer.pause();
        this.setFinishState(FinishState.SKIPPED);
        this._sessionManager.sendSkip(zone, campaign);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
    }

    private onMute(zone: Zone, campaign: Campaign, muted: boolean): void {
        this._videoPlayer.setVolume(new Double(muted ? 0.0 : 1.0));
    }

    /*
     ENDSCREEN EVENT HANDLERS
     */

    private onReplay(zone: Zone, campaign: Campaign): void {
        this._overlay.setSkipEnabled(true);
        this._overlay.setSkipDuration(0);
        this._videoPlayer.seekTo(0).then(() => {
            this._endScreen.hide();
            this._overlay.show();
            this._nativeBridge.invoke('AdUnit', 'setViews', [['videoplayer', 'webview']]);
        });
    }

    private onDownload(zone: Zone, campaign: Campaign): void {
        this._sessionManager.sendClick(zone, campaign);
        this._nativeBridge.invoke('Listener', 'sendClickEvent', [zone.getId()]);
        this._nativeBridge.invoke('Intent', 'launch', [{
            'action': 'android.intent.action.VIEW',
            'uri': 'market://details?id=' + campaign.getStoreId()
        }]);
    }

    private onClose(zone: Zone, campaign: Campaign): void {
        this.hide(zone, campaign);
        this._nativeBridge.invoke('Zone', 'setZoneState', [zone.getId(), ZoneState[ZoneState.WAITING]]);
        this._campaignManager.request(zone);
    }

}
