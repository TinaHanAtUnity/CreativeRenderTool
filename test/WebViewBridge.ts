/// <reference path="../src/ts/WebViewBridge.d.ts" />

/* tslint:disable:no-string-literal */

import { NativeBridge } from '../src/ts/NativeBridge';
import { INativeBridge } from '../src/ts/INativeBridge';
import { Sdk } from './Api/Sdk';
import { DeviceInfo } from './Api/DeviceInfo';
import { Placement } from './Api/Placement';
import { Url } from './Api/Url';
import { Cache } from './Api/Cache';
import { Listener } from './Api/Listener';
import { Storage } from './Api/Storage';

export class WebViewBridge implements IWebViewBridge {
    private _nativeBridge: INativeBridge;

    private _apiMap: {} = {
        'Sdk': new Sdk(),
        'DeviceInfo': new DeviceInfo(),
        'Placement': new Placement(),
        'Url': new Url(),
        'Cache': new Cache(),
        'Listener': new Listener(),
        'Storage': new Storage(),
    };

    public setNativeBridge(nativeBridge: INativeBridge): void {
        this._nativeBridge = nativeBridge;

        for(let api in this._apiMap) {
            if(this._apiMap.hasOwnProperty(api)) {
                this._apiMap[api].setNativeBridge(nativeBridge);
            }
        }
    }

    public handleInvocation(invocations: string): void {
        let calls: [string, string, any[], string][] = JSON.parse(invocations);
        console.dir(calls);
        let results: any[][] = calls.map((value: [string, string, any[], string]): any[] => {
            let [className, methodName, parameters, callback]: [string, string, any[], string] = value;
            className = className.split(NativeBridge.ApiPackageName + '.')[1];
            let apiClass: Object = this._apiMap[className];
            let apiMethod: Function = apiClass[methodName];
            if(!apiMethod) {
                throw new Error(className + '.' + methodName + ' is not implemented');
            }
            let result: any[] = apiMethod.apply(apiClass, parameters);
            result.unshift(callback);
            return result;
        });
        console.dir(results);
        window['nativebridge'].handleCallback(results);
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        console.log(id, status, parameters);
    }
}
