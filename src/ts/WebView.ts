import { NativeBridge } from 'NativeBridge';

import { EndScreen } from 'Views/EndScreen';
import { Overlay } from 'Views/Overlay';

import { VideoPlayer } from 'Video/VideoPlayer';
import { NativeVideoPlayer } from 'Video/NativeVideoPlayer';

import { DeviceInfo } from 'Models/DeviceInfo';

import { ZoneManager } from 'Managers/ZoneManager';
import { CampaignManager } from 'Managers/CampaignManager';

import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';

import { Campaign } from 'Models/Campaign';

import { CacheManager } from 'Managers/CacheManager';
import { Zone, ZoneState } from 'Models/Zone';
import { Request } from 'Utilities/Request';
import { Double } from 'Utilities/Double';

export class WebView {

    private _nativeBridge: NativeBridge;

    private _gameId: string = null;
    private _testMode: boolean = null;

    private _deviceInfo: DeviceInfo;

    private _request: Request;

    private _zoneManager: ZoneManager;
    private _campaignManager: CampaignManager;

    private _videoPlayer: VideoPlayer;

    private _endScreen: EndScreen;
    private _overlay: Overlay;

    private _cacheManager: CacheManager;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        this._deviceInfo = new DeviceInfo(nativeBridge);

        this._cacheManager = new CacheManager(nativeBridge);
        this._request = new Request(nativeBridge);

        this._videoPlayer = new NativeVideoPlayer(nativeBridge);
    }

    public initialize(): Promise<any[]> {
        return this._nativeBridge.invoke('Sdk', 'loadComplete').then(([gameId, testMode]) => {
            this._gameId = gameId;
            this._testMode = testMode;
            return DeviceInfo.fetch(this._nativeBridge);
        }).then((deviceInfo: DeviceInfo) => {
            this._deviceInfo = deviceInfo;
            this._zoneManager = new ZoneManager({
                'enabled': true,
                'zones': [
                    {
                        'id': 'defaultVideoAndPictureZone',
                        'name': 'Video ad placement',
                        'enabled': true,
                        'default': true,
                        'incentivised': false,
                        'allowSkipVideoInSeconds': 5,
                        'disableBackButtonForSeconds': 30,
                        'muteVideoSounds': false,
                        'useDeviceOrientationForVideo': true
                    },
                    {
                        'id': 'incentivizedZone',
                        'name': 'Incentivized placement',
                        'enabled': true,
                        'default': false,
                        'incentivized': true,
                        'allowSkipVideoInSeconds': -1,
                        'disableBackButtonForSeconds': 30,
                        'muteVideoSounds': true,
                        'useDeviceOrientationForVideo': false
                    }
                ]
            });

            this._campaignManager = new CampaignManager(this._request, this._deviceInfo, this._testMode);
            this._campaignManager.subscribe({
                'new': this.onNewCampaign.bind(this)
            });

            let zones: Object = this._zoneManager.getZones();
            for(let zoneId in zones) {
                if(zones.hasOwnProperty(zoneId)) {
                    let zone: Zone = zones[zoneId];
                    this._nativeBridge.invoke('Zone', 'setZoneState', [zone.getId(), ZoneState[ZoneState.NOT_AVAILABLE]]);
                }
            }

            for(let zoneId in zones) {
                if(zones.hasOwnProperty(zoneId)) {
                    this._campaignManager.request(this._gameId, zones[zoneId]);
                }
            }

            return this._nativeBridge.invoke('Sdk', 'initComplete');
        });
    }

    /*
     PUBLIC API EVENT HANDLERS
     */

    public show(zoneId: string): void {
        let zone: Zone = this._zoneManager.getZone(zoneId);
        let campaign: Campaign = zone.getCampaign();

        this._videoPlayer.subscribe({
            'prepared': this.onVideoPrepared.bind(this, zone),
            'progress': this.onVideoProgress.bind(this, zone),
            'completed': this.onVideoCompleted.bind(this, zone)
        });

        this._overlay = new Overlay(zone.muteVideoSounds());
        this._overlay.render();
        document.body.appendChild(this._overlay.container());
        this._overlay.subscribe({
            'skip': this.onSkip.bind(this, zone),
            'mute': this.onMute.bind(this, zone)
        });

        this._endScreen = new EndScreen(zone, campaign);
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());
        this._endScreen.subscribe({
            'replay': this.onReplay.bind(this),
            'download': this.onDownload.bind(this),
            'close': this.onClose.bind(this)
        });

        let orientation: ScreenOrientation = ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED;
        if(!zone.useDeviceOrientationForVideo()) {
            orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        }

        let keyEvents: any[] = [];
        if(zone.isIncentivized()) {
            keyEvents = [KeyCode.BACK];
            this._overlay.setSkipEnabled(false);
        } else {
            this._overlay.setSkipEnabled(true);
            this._overlay.setSkipDuration(zone.allowSkipInSeconds());
        }

        this._nativeBridge.invoke('AdUnit', 'open', [['videoplayer', 'webview'], orientation, keyEvents]).then(() => {
            this._videoPlayer.prepare(campaign.getVideoUrl(), new Double(zone.muteVideoSounds() ? 0.0 : 1.0));
        });
    }

    public hide(): void {
        this._nativeBridge.invoke('AdUnit', 'close', []);
        this._overlay.container().parentElement.removeChild(this._overlay.container());
        this._overlay = null;
        this._endScreen.container().parentElement.removeChild(this._endScreen.container());
        this._endScreen = null;
    }

    /*
     CAMPAIGN EVENT HANDLERS
     */

    private onNewCampaign(zone: Zone): void {
        let campaign: Campaign = zone.getCampaign();

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

    private onVideoPrepared(zone: Zone, duration: number, width: number, height: number): void {
        this._overlay.setVideoDuration(duration);
        this._videoPlayer.setVolume(new Double(this._overlay.isMuted() ? 0.0 : 1.0)).then(() => {
            this._videoPlayer.play();
        });
    }

    private onVideoProgress(zone: Zone, position: number): void {
        this._overlay.setVideoProgress(position);
    }

    private onVideoCompleted(zone: Zone, url: string): void {
        this._nativeBridge.invoke('Listener', 'sendFinishEvent', [zone.getId(), 'COMPLETED']);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
    }

    /*
    OVERLAY EVENT HANDLERS
     */

    private onSkip(zone: Zone): void {
        this._videoPlayer.pause();
        this._nativeBridge.invoke('Listener', 'sendFinishEvent', [zone.getId(), 'SKIPPED']);
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
    }

    private onMute(zone: Zone, muted: boolean): void {
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
        this._nativeBridge.invoke('Intent', 'launch', [{
            'action': 'android.intent.action.VIEW',
            'uri': 'market://details?id=' + campaign.getStoreId()
        }]);
    }

    private onClose(zone: Zone, campaign: Campaign): void {
        this.hide();
        this._nativeBridge.invoke('Zone', 'setZoneState', [zone.getId(), ZoneState[ZoneState.WAITING]]);
        this._campaignManager.request(this._gameId, zone);
    }

}
