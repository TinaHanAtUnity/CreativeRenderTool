// disable tslint while hacky code exists
/* tslint:disable */

import NativeBridge from 'NativeBridge';

import EndScreen from 'Views/EndScreen';
import Overlay from 'Views/Overlay';

import VideoPlayer from 'Video/VideoPlayer';
import NativeVideoPlayer from 'Video/NativeVideoPlayer';

import DeviceInfo from 'Device/Info';

import CampaignManager from 'Controllers/CampaignManager';

import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { KeyCode } from 'Constants/Android/KeyCode';

import Campaign from 'Models/Campaign';

import CacheManager from 'Cache/CacheManager';

export default class WebView {

    private _nativeBridge: NativeBridge;

    private _deviceInfo: DeviceInfo;

    private _campaignController: CampaignManager;

    private _videoPlayer: VideoPlayer;

    private _endScreen: EndScreen;
    private _overlay: Overlay;

    private _campaign: Campaign;
    private _cacheManager: CacheManager;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        this._cacheManager = new CacheManager(nativeBridge);

        this._nativeBridge.invoke('AdUnit', 'loadComplete', [], (status, config: string) => {
            console.log('loadCompleteCallback: ' + status);

            this._deviceInfo = new DeviceInfo(nativeBridge, () => {
                this._campaignController = new CampaignManager(this._nativeBridge, this._deviceInfo);
                this._campaignController.subscribe('campaign', (id: string, campaign: Campaign) => {
                    this._campaign = campaign;

                    this._cacheManager.cacheAll([
                        this._campaign.getGameIcon(),
                        this._campaign.getLandscapeUrl(),
                        this._campaign.getPortraitUrl(),
                        this._campaign.getVideoUrl()
                    ], (fileUrls:{ [key: string]: string }) => {
                        this._campaign.setGameIcon(fileUrls[this._campaign.getGameIcon()]);
                        this._campaign.setLandscapeUrl(fileUrls[this._campaign.getLandscapeUrl()]);
                        this._campaign.setPortraitUrl(fileUrls[this._campaign.getPortraitUrl()]);
                        this._campaign.setVideoUrl(fileUrls[this._campaign.getVideoUrl()]);

                        this._endScreen = new EndScreen(this._campaign);
                        this._endScreen.render();
                        this._endScreen.hide();
                        document.body.appendChild(this._endScreen.container());

                        this._endScreen.subscribe('end-screen', (id: string) => {
                            if (id === 'replay') {
                                this._videoPlayer.seekTo(0, () => {
                                    this._endScreen.hide();
                                    this._overlay.show();
                                    this._videoPlayer.play();
                                });
                            } else if (id === 'close') {
                                this.hide();
                            }
                        });

                        this._nativeBridge.invoke('Listener', 'sendReadyEvent', ['test'], (status) => {});
                    });
                });
                this._campaignController.request('test');
            });

            this._nativeBridge.invoke('AdUnit', 'initComplete', [], (status) => {
                console.log('initCompleteCallback: ' + status);
                this._overlay.show();
            });
        });

        this._overlay = new Overlay();
        this._overlay.render();
        this._overlay.hide();
        document.body.appendChild(this._overlay.container());

        this._videoPlayer = new NativeVideoPlayer(nativeBridge);

        this._videoPlayer.subscribe('videoplayer', (id: string) => {
            if (id === 'completed') {
                this._overlay.hide();
                this._endScreen.show();
            }
        });

        this._overlay.subscribe('overlay', (id: string) => {
            if (id === 'skip') {
                this._videoPlayer.pause();
                this._overlay.hide();
                this._endScreen.show();
            } else if (id === 'play') {
                this._videoPlayer.play();
            } else if (id === 'pause') {
                this._videoPlayer.pause();
            }
        });
    }

    public show(): void {
        this._nativeBridge.invoke('AdUnit', 'open', [
            ['videoplayer', 'webview'], ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, [KeyCode.BACK]
        ], (status) => {
            console.log('openCallback: ' + status);
            this._videoPlayer.prepare(this._campaign.getVideoUrl());
        });
    }

    public hide(): void {
        this._nativeBridge.invoke('AdUnit', 'close', [], (status: string) => {});
    }

}
