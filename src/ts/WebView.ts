import NativeBridge = require('NativeBridge');

import EndScreen = require('Views/EndScreen');
import Overlay = require('Views/Overlay');

import VideoPlayer = require('Video/VideoPlayer');
import NativeVideoPlayer = require('Video/NativeVideoPlayer');

import ScreenOrientation = require('Constants/Android/ScreenOrientation');
import Observer = require('Utilities/Observer');

class WebView {

    private _nativeBridge: NativeBridge;

    private _videoPlayer: VideoPlayer;

    private _endScreen: EndScreen;
    private _overlay: Overlay;

    private _fileUrl: string;

    constructor(nativeBridge: NativeBridge) {
        let resizeHandler = () => {
            let currentOrientation = document.body.classList.contains('landscape') ? 'landscape' : document.body.classList.contains('portrait') ? 'portrait' : null;
            let newOrientation = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
            if(currentOrientation) {
                if(currentOrientation !== newOrientation) {
                    document.body.classList.remove(currentOrientation);
                    document.body.classList.add(newOrientation);
                }
            } else {
                document.body.classList.add(newOrientation);
            }
        };
        resizeHandler();
        window.addEventListener('resize', resizeHandler, false);

        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe("CACHE", this.trigger.bind(this));
        this._nativeBridge.invoke("Cache", "download", ["http://static.everyplay.com/impact/videos/18940/441d82f9f69cb66c/dominations-30-v2/b30-600.mp4"], (status) => {});

        this._endScreen = new EndScreen();
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());

        this._overlay = new Overlay();
        this._overlay.render();
        this._overlay.hide();
        document.body.appendChild(this._overlay.container());

        this._videoPlayer = new NativeVideoPlayer(nativeBridge);

        this._videoPlayer.subscribe('videoplayer', (id: string) => {
           if(id === 'completed') {
               this._overlay.hide();
               this._endScreen.show();
           }
        });

        this._overlay.subscribe('overlay', (id: string) => {
           if(id === 'skip') {
               this._videoPlayer.pause();
               this._overlay.hide();
               this._endScreen.show();
           } else if(id === 'play') {
               this._videoPlayer.play();
           } else if(id === 'pause') {
               this._videoPlayer.pause();
           }
        });

        this._endScreen.subscribe('end-screen', (id: string) => {
           if(id === 'replay') {
               this._videoPlayer.seekTo(0, (status) => {
                   this._endScreen.hide();
                   this._overlay.show();
                   this._videoPlayer.play();
               });
           } else if(id === 'close') {
               this.hide();
           }
        });

        this._nativeBridge.invoke("AdUnit", "loadComplete", [], (status, config) => {
            console.log("loadCompleteCallback: " + status);
            this._nativeBridge.invoke("AdUnit", "initComplete", [], (status) => {
                console.log("initCompleteCallback: " + status);
                this._overlay.show();
            });
        });
    }

    show() {
        this._nativeBridge.invoke("AdUnit", "open", [["videoplayer", "webview"], ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED], (status) => {
            console.log("openCallback: " + status);
            this._videoPlayer.prepare(this._fileUrl);
        });
    }

    hide() {
        this._nativeBridge.invoke("AdUnit", "close", [], (status) => {});
    }

    private onDownloadEnd(url: string, size: number, duration: number) {
        this._nativeBridge.invoke("Cache", "getFileUrl", ["http://static.everyplay.com/impact/videos/18940/441d82f9f69cb66c/dominations-30-v2/b30-600.mp4"], (status, fileUrl) => {
            this._fileUrl = fileUrl;
            this._nativeBridge.invoke("Listener", "sendReadyEvent", ["test"], (status) => {});
        });
    }

    private _eventBindings = {
        'DOWNLOAD_END': this.onDownloadEnd
    };

    private trigger(id: string, ...parameters) {
        let eventHandler = this._eventBindings[id];
        if(eventHandler) {
            eventHandler.apply(this, parameters);
        }
    }

}

export = WebView;