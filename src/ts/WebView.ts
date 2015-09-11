import NativeBridge = require('NativeBridge');

import EndScreen = require('Views/EndScreen');
import Overlay = require('Views/Overlay');

import VideoPlayer = require('Video/VideoPlayer');
import NativeVideoPlayer = require('Video/NativeVideoPlayer');

import DeviceInfo = require('Device/Info');

import CampaignManager = require('Controllers/CampaignManager');

import ScreenOrientation = require('Constants/Android/ScreenOrientation');
import KeyCode = require('Constants/Android/KeyCode');

import Observer = require('Utilities/Observer');

import Campaign = require('Models/Campaign');

import CacheManager = require('Cache/CacheManager');

class WebView {

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

        this._nativeBridge.invoke("AdUnit", "loadComplete", [], (status, config) => {
            console.log("loadCompleteCallback: " + status);

            this._deviceInfo = new DeviceInfo(nativeBridge, (status) => {
                this._campaignController = new CampaignManager(this._nativeBridge, this._deviceInfo);
                this._campaignController.subscribe('campaign', (id:string, campaign:Campaign) => {
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

                        this._endScreen.subscribe('end-screen', (id:string) => {
                            if (id === 'replay') {
                                this._videoPlayer.seekTo(0, (status) => {
                                    this._endScreen.hide();
                                    this._overlay.show();
                                    this._videoPlayer.play();
                                });
                            } else if (id === 'close') {
                                this.hide();
                            }
                        });

                        this._nativeBridge.invoke("Listener", "sendReadyEvent", ["test"], (status) => {});
                    });
                });
                this._campaignController.request("test");
            });


            this._nativeBridge.invoke("AdUnit", "initComplete", [], (status) => {
                console.log("initCompleteCallback: " + status);
                this._overlay.show();
            });
        });

        this._overlay = new Overlay();
        this._overlay.render();
        this._overlay.hide();
        document.body.appendChild(this._overlay.container());

        this._videoPlayer = new NativeVideoPlayer(nativeBridge);

        this._videoPlayer.subscribe('videoplayer', (id:string) => {
            if (id === 'completed') {
                this._overlay.hide();
                this._endScreen.show();
            }
        });

        this._overlay.subscribe('overlay', (id:string) => {
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

    show() {
        this._nativeBridge.invoke("AdUnit", "open", [["videoplayer", "webview"], ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, [KeyCode.BACK]], (status) => {
            console.log("openCallback: " + status);
            this._videoPlayer.prepare(this._campaign.getVideoUrl());
        });
    }

    hide() {
        this._nativeBridge.invoke("AdUnit", "close", [], (status) => {});
    }

}

export = WebView;