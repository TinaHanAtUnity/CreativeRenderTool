/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/ts/WebViewBridge.d.ts" />

/* tslint:disable:no-string-literal */

import { NativeBridge } from '../src/ts/NativeBridge';

export class WebViewBridge implements IWebViewBridge {

    private _invocationMap: {} = {
        'Sdk.loadComplete': this.loadComplete,
        'Sdk.initComplete': this.initComplete,

        'DeviceInfo.getAndroidId': this.getAndroidId,
        'DeviceInfo.getAdvertisingTrackingId': this.getAdvertisingTrackingId,
        'DeviceInfo.getLimitAdTrackingFlag': this.getLimitAdTrackingFlag,
        'DeviceInfo.getSoftwareVersion': this.getSoftwareVersion,
        'DeviceInfo.getHardwareVersion': this.getHardwareVersion,
        'DeviceInfo.getNetworkType': this.getNetworkType,
        'DeviceInfo.getScreenLayout': this.getScreenLayout,
        'DeviceInfo.getScreenDensity': this.getScreenDensity,
        'DeviceInfo.isWifi': this.isWifi,

        'Zone.setZoneState': this.setZoneState,

        'Url.get': this.urlGet,

        'Cache.download': this.download,
        'Cache.getFileUrl': this.getFileUrl,

        'Listener.sendReadyEvent': this.sendReadyEvent
    };

    private static _cacheQueue: string[] = [];

    public handleInvocation(invocations: string): void {
        let calls: [string, string, any[], string][] = JSON.parse(invocations);
        console.dir(calls);
        let results: any[][] = calls.map((value: [string, string, any[], string]): any[] => {
            let [className, methodName, parameters, callback]: [string, string, any[], string] = value;
            className = className.split(NativeBridge.PackageName)[1];
            let call: Function = this._invocationMap[className + '.' + methodName];
            let result: any[] = call.apply(this, parameters);
            result.unshift(callback);
            return result;
        });
        console.dir(results);
        window['nativebridge'].handleCallback(results);
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
        setTimeout(() => {
            window['nativebridge'].handleEvent('URL_COMPLETE', url, JSON.stringify(campaignResponse), 200, []);
        }, 0);
        return ['OK'];
    }

    protected download(url: string, overwrite: boolean): any[] {
        if(WebViewBridge._cacheQueue.some(cacheUrl => cacheUrl === url)) {
            return ['ERROR', 'FILE_ALREADY_IN_QUEUE', url];
        } else {
            WebViewBridge._cacheQueue.push(url);
            setTimeout(() => {
                WebViewBridge._cacheQueue = WebViewBridge._cacheQueue.filter(cacheUrl => cacheUrl !== url);
                window['nativebridge'].handleEvent('CACHE_DOWNLOAD_END', url);
            }, 0);
            return ['OK'];
        }
    }

    protected getFileUrl(url: string): any[] {
        return ['OK', url.replace('http', 'file')];
    }

    protected sendReadyEvent(zone: string): any[] {
        return ['OK'];
    }
}
