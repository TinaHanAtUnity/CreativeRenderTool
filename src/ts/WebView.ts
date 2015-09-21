import NativeBridge from 'NativeBridge';

import EndScreen from 'Views/EndScreen';
import Overlay from 'Views/Overlay';

import VideoPlayer from 'Video/VideoPlayer';
import NativeVideoPlayer from 'Video/NativeVideoPlayer';

import DeviceInfo from 'Device/Info';

import ZoneManager from 'Managers/ZoneManager';
import CampaignManager from 'Managers/CampaignManager';

import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';

import Campaign from 'Models/Campaign';

import CacheManager from 'Managers/CacheManager';
import Zone from 'Models/Zone';
import Request from 'Utilities/Request';
import { ZoneState } from 'Models/Zone';

export default class WebView {

    private _nativeBridge: NativeBridge;

    private _gameId: string = null;

    private _deviceInfo: DeviceInfo;

    private _request: Request;

    private _zoneManager: ZoneManager;
    private _campaignManager: CampaignManager;

    private _videoPlayer: VideoPlayer;

    private _endScreen: EndScreen;
    private _overlay: Overlay;

    private _cacheManager: CacheManager;

    private _campaignEventHandlers: Object = {
        'new': this.onNewCampaign
    };

    private _videoEventHandlers: Object = {
        'prepared': this.onVideoPrepared,
        'progress': this.onVideoProgress,
        'completed': this.onVideoCompleted
    };

    private _overlayEventHandlers: Object = {
        'skip': this.onSkip
    };

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        this._cacheManager = new CacheManager(nativeBridge);
        this._request = new Request(nativeBridge);

        this._overlay = new Overlay();
        this._overlay.render();
        this._overlay.hide();
        document.body.appendChild(this._overlay.container());

        this._videoPlayer = new NativeVideoPlayer(nativeBridge);
        this._videoPlayer.subscribe('videoplayer', this.onVideoEvent.bind(this));

        this._overlay.subscribe('overlay', this.onOverlayEvent.bind(this));

        this._nativeBridge.invoke('AdUnit', 'loadComplete', [], (status: string, gameId: string, config: string) => {
            console.log('loadCompleteCallback: ' + status);
            this._gameId = gameId;

            this._deviceInfo = new DeviceInfo(nativeBridge, () => {
                this._zoneManager = new ZoneManager(config);
                this._campaignManager = new CampaignManager(this._request, this._deviceInfo);

                this._campaignManager.subscribe('campaign', this.onCampaignEvent.bind(this));

                let zones: Object = this._zoneManager.getZones();
                for(let zoneId in zones) {
                    if(zones.hasOwnProperty(zoneId)) {
                        let zone: Zone = zones[zoneId];
                        this._nativeBridge.invoke('Zone', 'setZoneState', [zone.getId(), ZoneState[ZoneState.NOT_INITIALIZED]]);
                    }
                }

                for(let zoneId in zones) {
                    if(zones.hasOwnProperty(zoneId)) {
                        if(zoneId !== 'webglZone') {
                            this._campaignManager.request(this._gameId, zones[zoneId]);
                        }
                    }
                }

                this._nativeBridge.invoke('AdUnit', 'initComplete', [], (status: string): void => {
                    console.log('initCompleteCallback: ' + status);
                    this._overlay.show();
                });
            });
        });
    }

    public show(zoneId: string): void {
        let zone: Zone = this._zoneManager.getZone(zoneId);
        let campaign: Campaign = zone.getCampaign();

        this._endScreen = new EndScreen(campaign);
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());

        this._endScreen.subscribe('end-screen', (id: string) => {
            if (id === 'replay') {
                this._nativeBridge.invoke('AdUnit', 'setViews', [['videoplayer', 'webview']]);
                this._videoPlayer.seekTo(0, () => {
                    this._endScreen.hide();
                    this._overlay.show();
                    this._videoPlayer.play();
                });
            } else if (id === 'close') {
                this.hide();
                this._nativeBridge.invoke('Zone', 'setZoneState', [zone.getId(), ZoneState[ZoneState.NOT_INITIALIZED]]);
                if(zoneId !== 'webglZone') {
                    this._campaignManager.request(this._gameId, zone);
                }
            } else if(id === 'download') {
                this._nativeBridge.invoke('Intent', 'launch', [{
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=' + campaign.getStoreId()
                }]);
            }
        });

        let keyEvents: any[] = [];
        if(zone.isIncentivized()) {
            keyEvents = [KeyCode.BACK];
            this._overlay.setSkipEnabled(false);
        } else {
            this._overlay.setSkipEnabled(true);
            this._overlay.setSkipDuration(zone.allowSkipInSeconds());
        }

        this._nativeBridge.invoke('AdUnit', 'open', [['videoplayer', 'webview'], ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, keyEvents], (status: string): void => {
            console.log('openCallback: ' + status);
            this._videoPlayer.prepare(campaign.getVideoUrl());
        });
    }

    public hide(): void {
        this._nativeBridge.invoke('AdUnit', 'close', []);
        this._endScreen.container().parentElement.removeChild(this._endScreen.container());
        this._endScreen = null;
        this._overlay.show();
    }

    private onNewCampaign(zone: Zone): void {
        let campaign: Campaign = zone.getCampaign();

        let cacheableAssets: string[] = [
            campaign.getGameIcon(),
            campaign.getLandscapeUrl(),
            campaign.getPortraitUrl(),
            campaign.getVideoUrl()
        ];

        this._cacheManager.cacheAll(cacheableAssets, (fileUrls: { [key: string]: string }) => {
            campaign.setGameIcon(fileUrls[campaign.getGameIcon()]);
            campaign.setLandscapeUrl(fileUrls[campaign.getLandscapeUrl()]);
            campaign.setPortraitUrl(fileUrls[campaign.getPortraitUrl()]);
            campaign.setVideoUrl(fileUrls[campaign.getVideoUrl()]);

            this._nativeBridge.invoke('Zone', 'setZoneState', [zone.getId(), ZoneState[ZoneState.READY]], (status: string) => {
                this._nativeBridge.invoke('Listener', 'sendReadyEvent', [zone.getId()]);
            });
        });
    }

    private onVideoPrepared(duration: number, width: number, height: number): void {
        this._overlay.setVideoDuration(duration);
    }

    private onVideoProgress(position: number): void {
        this._overlay.setVideoProgress(position);
    }

    private onVideoCompleted(url: string): void {
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
    }

    private onSkip(): void {
        this._videoPlayer.pause();
        this._nativeBridge.invoke('AdUnit', 'setViews', [['webview']]);
        this._overlay.hide();
        this._endScreen.show();
    }

    private onCampaignEvent(id: string, ...parameters: any[]): void {
        let handler: Function = this._campaignEventHandlers[id];
        if(handler) {
            handler.apply(this, parameters);
        }
    }

    private onVideoEvent(id: string, ...parameters: any[]): void {
        let handler: Function = this._videoEventHandlers[id];
        if(handler) {
            handler.apply(this, parameters);
        }
    }

    private onOverlayEvent(id: string, ...parameters: any[]): void {
        let handler: Function = this._overlayEventHandlers[id];
        if(handler) {
            handler.apply(this, parameters);
        }
    }

}
