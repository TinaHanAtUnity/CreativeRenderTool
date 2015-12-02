/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/ts/WebViewBridge.d.ts" />

/* tslint:disable:no-string-literal */

export class WebViewBridge implements IWebViewBridge {

    private _invocationMap: {} = {
        'com.unity3d.unityads.api.Sdk.loadComplete': this.loadComplete,
        'com.unity3d.unityads.api.Sdk.initComplete': this.initComplete,

        'com.unity3d.unityads.api.DeviceInfo.getAndroidId': this.getAndroidId,
        'com.unity3d.unityads.api.DeviceInfo.getAdvertisingTrackingId': this.getAdvertisingTrackingId,
        'com.unity3d.unityads.api.DeviceInfo.getLimitAdTrackingFlag': this.getLimitAdTrackingFlag,
        'com.unity3d.unityads.api.DeviceInfo.getSoftwareVersion': this.getSoftwareVersion,
        'com.unity3d.unityads.api.DeviceInfo.getHardwareVersion': this.getHardwareVersion,
        'com.unity3d.unityads.api.DeviceInfo.getNetworkType': this.getNetworkType,
        'com.unity3d.unityads.api.DeviceInfo.getScreenLayout': this.getScreenLayout,
        'com.unity3d.unityads.api.DeviceInfo.getScreenDensity': this.getScreenDensity,
        'com.unity3d.unityads.api.DeviceInfo.isWifi': this.isWifi,

        'com.unity3d.unityads.api.Zone.setZoneState': this.setZoneState,

        'com.unity3d.unityads.api.Url.get': this.urlGet,

        'com.unity3d.unityads.api.Cache.download': this.download,
        'com.unity3d.unityads.api.Cache.getFileUrl': this.getFileUrl,

        'com.unity3d.unityads.api.Listener.sendReadyEvent': this.sendReadyEvent
    };

    public handleInvocation(className: string, methodName: string, jsonParameters?: string, callback?: string): void {
        console.log(className, methodName, jsonParameters, callback);
        let call: Function = this._invocationMap[className + '.' + methodName];
        let parameters: any[] = JSON.parse(jsonParameters);
        let result: any[] = call.apply(this, parameters);
        if(callback) {
            result.unshift(callback);
            window['nativebridge'].handleCallback.apply(window, result);
        }
    }

    public handleBatchInvocation(id: string, jsonCalls: string): void {
        console.log(id, jsonCalls);
        let calls: [string, string, any[], string][] = JSON.parse(jsonCalls);
        let results: any[][] = calls.map((value: [string, string, any[], string]): any[] => {
            let [className, methodName, parameters, callback]: [string, string, any[], string] = value;
            let call: Function = this._invocationMap[className + '.' + methodName];
            let [result, resultParameters]: any[] = call.apply(this, parameters);
            return [callback, result, resultParameters];
        });
        window['nativebridge'].handleBatchCallback(id, 'OK', results);
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        console.log(id, status, parameters);
    }

    protected loadComplete(): any[] {
        return ['OK', 12345, true];
    }

    protected initComplete(): any[] {
        return ['OK'];
    }

    protected getAndroidId(): any[] {
        return ['OK', '6ea99dfb2436dc8f'];
    }

    protected getAdvertisingTrackingId(): any[] {
        return ['OK', '4649c6ec-09c8-4bd0-87e0-67f24c914c8e'];
    }

    protected getLimitAdTrackingFlag(): any[] {
        return ['OK', false];
    }

    protected getSoftwareVersion(): any[] {
        return ['OK', '23'];
    }

    protected getHardwareVersion(): any[] {
        return ['OK', 'LGE Nexus 5'];
    }

    protected getNetworkType(): any[] {
        return ['OK', 0];
    }

    protected getScreenLayout(): any[] {
        return ['OK', 268435794];
    }

    protected getScreenDensity(): any[] {
        return ['OK', 480];
    }

    protected isWifi(): any[] {
        return ['OK', true];
    }

    protected setZoneState(zoneId: string, zoneState: string): any[] {
        return ['OK'];
    }

    protected urlGet(url: string, headers: [string, string][]): any[] {
        let campaignResponse: {} = {
            'data': {
                'campaigns': [{
                    'id': '000000000000000000000000',
                    'gameId': 11017,
                    'gameName': 'Test Game (android)',
                    'tagLine': 'Unity Ads test campaign',
                    'clickUrl': 'http://impact.applifier.com/mobile/campaigns/000000000000000000000000/click/50507b163822f20000000001?test=true&platform=android&gameId=12345',
                    'customClickUrl': '',
                    'bypassAppSheet': false,
                    'rating': '4.5',
                    'ratingCount': 10000,
                    'cacheVideo': true,
                    'allowCache': true,
                    'gameIcon': 'http://static.applifier.com/impact/11017/test_game_icon.png',
                    'picture': 'http://static.applifier.com/impact/11017/test_game_icon.png',
                    'endScreen': 'http://static.applifier.com/impact/11017/test_endscreen_landscape.png',
                    'endScreenPortrait': 'http://static.applifier.com/impact/11017/test_endscreen_portrait.png',
                    'trailerDownloadable': 'http://static.applifier.com/impact/11017/blue_test_trailer.mp4',
                    'trailerStreaming': 'http://static.applifier.com/impact/11017/blue_test_trailer.mp4',
                    'trailerSize': 1445875,
                    'iTunesId': 'com.iUnity.angryBots',
                    'network': 'mobile_android'
                }]
            }
        };
        window['nativebridge'].handleEvent('URL_COMPLETE', url, JSON.stringify(campaignResponse), 200, []);
        return;
    }

    protected download(url: string, overwrite: boolean): any[] {
        window['nativebridge'].handleEvent('CACHE_DOWNLOAD_END', url);
        return ['OK'];
    }

    protected getFileUrl(url: string): any[] {
        return ['OK', url];
    }

    protected sendReadyEvent(zone: string): any[] {
        return;
    }
}
