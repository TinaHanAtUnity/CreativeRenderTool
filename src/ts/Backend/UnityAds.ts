import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Platform } from 'Common/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { WebView } from 'WebView';
import { Sdk } from 'Backend/Api/Sdk';

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

        UnityAds._listener = listener;

        // tslint:disable:no-string-literal
        (<any>window)['nativebridge'] = nativeBridge;
        (<any>window)['webview'] = new WebView(nativeBridge);
        (<any>window)['webview'].initialize();
        // tslint:enable:no-string-literal
    }

    public static show(placement?: string) {
        // tslint:disable:no-string-literal
        (<any>window)['webview'].show(placement, {}, () => {
            return;
        });
        // tslint:enable:no-string-literal
    }

    public static getListener() {
        return UnityAds._listener;
    }

    private static _listener: IUnityAdsListener | undefined;

}
