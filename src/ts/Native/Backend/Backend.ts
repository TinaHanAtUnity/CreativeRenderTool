import { CallbackStatus } from 'Native/NativeBridge';
import { Sdk } from 'Native/Backend/Api/Sdk';
import { Cache } from 'Native/Backend/Api/Cache';
import { DeviceInfo } from 'Native/Backend/Api/DeviceInfo';
import { Broadcast } from 'Native/Backend/Api/Broadcast';
import { Connectivity } from 'Native/Backend/Api/Connectivity';
import { Storage } from 'Native/Backend/Api/Storage';
import { Request } from 'Native/Backend/Api/Request';
import { Placement } from 'Native/Backend/Api/Placement';
import { Listener } from 'Native/Backend/Api/Listener';
import { AdUnit } from 'Native/Backend/Api/AdUnit';
import { VideoPlayer } from 'Native/Backend/Api/VideoPlayer';
import { Notification } from 'Native/Backend/Api/Notification';
import { AppSheet } from 'Native/Backend/Api/AppSheet';
import { Platform } from 'Constants/Platform';
import { Intent } from 'Native/Backend/Api/Intent';
import { UrlScheme } from 'Native/Backend/Api/UrlScheme';

interface IInvocation {
    className: string;
    method: string;
    parameters: [string | number][];
    callbackId: number;
}

interface IResult {
    callbackId: number;
    callbackStatus: CallbackStatus;
    parameters: any[];
}

export class Backend implements IWebViewBridge {

    private static _apiMap = {
        '.*AdUnit': AdUnit,
        '.*AppSheet': AppSheet,
        '.*Broadcast': Broadcast,
        '.*Cache': Cache,
        '.*Connectivity': Connectivity,
        '.*DeviceInfo': DeviceInfo,
        '.*Intent': Intent,
        '.*Listener': Listener,
        '.*Notification': Notification,
        '.*Placement': Placement,
        '.*Request': Request,
        '.*Sdk': Sdk,
        '.*Storage': Storage,
        '.*UrlScheme': UrlScheme,
        '.*VideoPlayer': VideoPlayer
    };

    public static sendEvent(category: string, name: string, ...parameters: any[]) {
        console.log(category + '_' + name + ': ' + JSON.stringify(parameters));
        // tslint:disable:no-string-literal
        window['nativebridge']['handleEvent']([category, name].concat(parameters));
        // tslint:enable:no-string-literal
    }

    public static getPlatform(): Platform {
        // tslint:disable:no-string-literal
        return window['nativebridge']['getPlatform']();
        // tslint:enable:no-string-literal
    }

    public handleInvocation(rawInvocations: string): void {
        let invocations: IInvocation[] = JSON.parse(rawInvocations).map((invocation: any) => this.parseInvocation(invocation));
        let results = invocations.map((invocation) => this.executeInvocation(invocation));
        // tslint:disable:no-string-literal
        window['nativebridge']['handleCallback'](results.map(result => {
            console.log(result.parameters);
            return [result.callbackId.toString(), CallbackStatus[result.callbackStatus], result.parameters];
        }));
        // tslint:enable:no-string-literal
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        console.log(id);
        console.log(status);
        console.log(parameters);
    }

    private parseInvocation(invocation: any): IInvocation {
        return {
            className: invocation[0],
            method: invocation[1],
            parameters: invocation[2],
            callbackId: invocation[3]
        };
    }

    private executeInvocation(invocation: IInvocation): IResult {
        console.log(invocation.className + '.' + invocation.method + '(' + JSON.stringify(invocation.parameters) + ');');
        let api = (() => {
            for(let apiKey in Backend._apiMap) {
                if(Backend._apiMap.hasOwnProperty(apiKey) && invocation.className.match(apiKey)) {
                    return Backend._apiMap[apiKey];
                }
            }
        })();
        try {
            return {
                callbackId: invocation.callbackId,
                callbackStatus: CallbackStatus.OK,
                parameters: [api[invocation.method].apply(undefined, invocation.parameters)]
            };
        } catch(error) {
            return {
                callbackId: invocation.callbackId,
                callbackStatus: CallbackStatus.ERROR,
                parameters: [error]
            };
        }
    }

}