import { NativeBridge } from '../Native/NativeBridge';
import { Platform } from '../Constants/Platform';

export class NativeAdUnit {
    private _nativeBridge: NativeBridge;
    private _platform: Platform;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._platform = nativeBridge.getPlatform();
    }

    public showVideoPlayer(): Promise<string[]> {
        if(this._platform === Platform.IOS) {
            return this._nativeBridge.IosAdUnit.setViews(['videoplayer', 'webview']);
        } else {
            return this._nativeBridge.AndroidAdUnit.setViews(['videoplayer', 'webview']);
        }
    }

    public showWebView(): Promise<string[]> {
        if(this._platform === Platform.IOS) {
            return this._nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            return this._nativeBridge.AndroidAdUnit.setViews(['webview']);
        }
    }

    public close(): Promise<void> {
        if(this._platform === Platform.IOS) {
            return this._nativeBridge.IosAdUnit.close();
        } else {
            return this._nativeBridge.AndroidAdUnit.close();
        }
    }
}