/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/ts/WebViewBridge.d.ts" />

import * as request from 'request';
import * as http from 'http';

export default class WebViewBridge implements IWebViewBridge {

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

        'com.unity3d.unityads.api.Url.get': this.urlGet
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
        window['nativebridge'].handleBatchCallback(id, results);
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        console.log(id, status, parameters);
    }

    private loadComplete(): any[] {
        return ['OK', 12345, true];
    }

    private initComplete(): any[] {
        return;
    }

    private getAndroidId(): any[] {
        return ['OK', '6ea99dfb2436dc8f'];
    }

    private getAdvertisingTrackingId(): any[] {
        return ['OK', '4649c6ec-09c8-4bd0-87e0-67f24c914c8e'];
    }

    private getLimitAdTrackingFlag(): any[] {
        return ['OK', false];
    }

    private getSoftwareVersion(): any[] {
        return ['OK', '23'];
    }

    private getHardwareVersion(): any[] {
        return ['OK', 'LGE Nexus 5'];
    }

    private getNetworkType(): any[] {
        return ['OK', 0];
    }

    private getScreenLayout(): any[] {
        return ['OK', 268435794];
    }

    private getScreenDensity(): any[] {
        return ['OK', 480];
    }

    private isWifi(): any[] {
        return ['OK', true];
    }

    private setZoneState(zoneId: string, zoneState: string): any[] {
        return;
    }

    private urlGet(url: string, headers: [string, string][]): any[] {
        let headerObject: {} = {};
        headers.forEach((entry: [string, string]): void => {
            let [key, value]: [string, string] = entry;
            headerObject[key] = value;
        });
        request.get(url, {headers: headerObject}, (error: any, response: http.IncomingMessage, body: any) => {
            window['nativebridge'].handleEvent('URL_COMPLETE', url, body, 200, []);
        });
        return;
    }
}
