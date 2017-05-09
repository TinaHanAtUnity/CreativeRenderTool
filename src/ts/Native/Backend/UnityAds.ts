import { IUnityAdsListener } from 'Native/Backend/IUnityAdsListener';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { Backend } from 'Native/Backend/Backend';
import { WebView } from 'WebView';
import { Sdk } from 'Native/Backend/Api/Sdk';

export class UnityAds {

    public static initialize(platform: Platform, gameId: string, listener: IUnityAdsListener, testMode: boolean = false) {
        let nativeBridge: NativeBridge;
        switch(platform) {
            case Platform.ANDROID:
                // todo: setting auto batching on causes some very weird behaviour with Node, should be investigated
                nativeBridge = new NativeBridge(new Backend(), Platform.ANDROID, false);
                break;

            case Platform.IOS:
                nativeBridge = new NativeBridge(new Backend(), Platform.IOS, false);
                break;

            default:
                throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
        }

        Sdk.setGameId(gameId);
        Sdk.setTestMode(testMode);
        Sdk.setAppName('com.test.app.name');
        Sdk.setAppVersion('1.2.3-appversion');
        Sdk.setSdkVersion(2000);
        Sdk.setSdkVersionName('2.0.0-sdkversion');
        Sdk.setDebuggable(false);
        Sdk.setConfigUrl('https://test.config.url');
        Sdk.setWebViewUrl('https://test.webview.url');
        Sdk.setWebViewHash(null);
        Sdk.setWebViewVersion('2.0.0.-webviewversion');
        Sdk.setInitTimeStamp(12345);
        Sdk.setReinitialized(false);

        UnityAds._listener = listener;

        // tslint:disable:no-string-literal
        window['nativebridge'] = nativeBridge;
        window['webview'] = new WebView(nativeBridge);
        window['webview'].initialize();
        // tslint:enable:no-string-literal
    }

    public static show(placement?: string) {
        // tslint:disable:no-string-literal
        window['webview'].show(placement, {}, () => {
            return;
        });
        // tslint:enable:no-string-literal
    }

    public static getListener() {
        return UnityAds._listener;
    }

    private static _listener: IUnityAdsListener | undefined;

}
