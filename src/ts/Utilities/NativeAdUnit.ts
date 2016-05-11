import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';

export class NativeAdUnit {
    public static showVideoPlayer(nativeBridge: NativeBridge): Promise<string[]> {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            return nativeBridge.IosAdUnit.setViews(['videoplayer', 'webview']);
        } else {
            return nativeBridge.AndroidAdUnit.setViews(['videoplayer', 'webview']);
        }
    }

    public static showWebView(nativeBridge: NativeBridge): Promise<string[]> {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            return nativeBridge.IosAdUnit.setViews(['webview']);
        } else {
            return nativeBridge.AndroidAdUnit.setViews(['webview']);
        }
    }

    public static close(nativeBridge: NativeBridge): Promise<void> {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            return nativeBridge.IosAdUnit.close();
        } else {
            return nativeBridge.AndroidAdUnit.close();
        }
    }
}