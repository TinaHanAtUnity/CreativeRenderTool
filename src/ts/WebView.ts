import NativeBridge = require('NativeBridge');

import ViewController = require('Controllers/ViewController');
import EndScreen = require('Views/EndScreen');
import Overlay = require('Views/Overlay');

import VideoPlayer = require('Video/VideoPlayer');
import NativeVideoPlayer = require('Video/NativeVideoPlayer');

import ScreenOrientation = require('Constants/Android/ScreenOrientation');
import Observer = require('Utilities/Observer');

class WebView implements Observer {

    private _nativeBridge: NativeBridge;
    private _viewController: ViewController;

    private _videoPlayer: VideoPlayer;

    private _endScreen: EndScreen;
    private _overlay: Overlay;

    private _fileUrl: string;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe("CACHE", this);
        nativeBridge.subscribe("VIDEOPLAYER", this);
        this._nativeBridge.invoke("Cache", "download", ["http://static.everyplay.com/impact/videos/18940/441d82f9f69cb66c/dominations-30-v2/b30-600.mp4"], (status) => {});

        this._viewController = new ViewController();

        this._endScreen = new EndScreen(nativeBridge);
        this._overlay = new Overlay(nativeBridge);

        this._viewController.insertView(this._endScreen);
        this._viewController.insertView(this._overlay);

        this._videoPlayer = new NativeVideoPlayer(nativeBridge);

        this._nativeBridge.invoke("AdUnit", "loadComplete", [], (status, config) => {
            console.log("loadCompleteCallback: " + status);
            this._nativeBridge.invoke("AdUnit", "initComplete", [], (status) => {
                console.log("initCompleteCallback: " + status);
                this._viewController.showView(this._overlay);
            });
        });
    }

    show() {
        this._nativeBridge.invoke("AdUnit", "open", [["videoplayer", "webview"], ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED], (status) => {
            console.log("openCallback: " + status);
            this._videoPlayer.prepare(this._fileUrl);
        });
    }

    private onDownloadEnd(url: string, size: number, duration: number) {
        this._nativeBridge.invoke("Cache", "getFileUrl", ["http://static.everyplay.com/impact/videos/18940/441d82f9f69cb66c/dominations-30-v2/b30-600.mp4"], (status, fileUrl) => {
            this._fileUrl = fileUrl;
            this._nativeBridge.invoke("Listener", "sendReadyEvent", ["test"], (status) => {});
        });
    }

    trigger(id: string, ...parameters) {
        if(id === 'DOWNLOAD_END') {
            this.onDownloadEnd.apply(this, parameters);
        } else if(id === 'COMPLETED') {
            this._viewController.hideView(this._overlay);
            this._viewController.showView(this._endScreen);
        } else if(id === 'REPLAY') {
            this._viewController.hideView(this._endScreen);
            this._viewController.showView(this._overlay);
        }
    }

}

export = WebView;