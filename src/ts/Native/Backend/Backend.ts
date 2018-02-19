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
import { Lifecycle } from 'Native/Backend/Api/Lifecycle';
import { Purchasing } from 'Native/Backend/Api/Purchasing';

interface IInvocation {
    className: string;
    method: string;
    parameters: Array<[string | number]>;
    callbackId: number;
}

interface IResult {
    callbackId: number;
    callbackStatus: CallbackStatus;
    parameters: any[];
}

export class Backend implements IWebViewBridge {

    public static sendEvent(category: string, name: string, ...parameters: any[]) {
        // tslint:disable:no-string-literal
        (<any>window)['nativebridge']['handleEvent']([category, name].concat(parameters));
        // tslint:enable:no-string-literal
    }

    public static getPlatform(): Platform {
        // tslint:disable:no-string-literal
        return (<any>window)['nativebridge']['getPlatform']();
        // tslint:enable:no-string-literal
    }

    private static _apiMap: { [key: string]: any } = {
        '.*AdUnit': AdUnit,
        '.*AppSheet': AppSheet,
        '.*Broadcast': Broadcast,
        '.*Cache': Cache,
        '.*Connectivity': Connectivity,
        '.*DeviceInfo': DeviceInfo,
        '.*Intent': Intent,
        '.*Lifecycle': Lifecycle,
        '.*Listener': Listener,
        '.*Notification': Notification,
        '.*Placement': Placement,
        '.*Purchasing': Purchasing,
        '.*Request': Request,
        '.*Sdk': Sdk,
        '.*Storage': Storage,
        '.*UrlScheme': UrlScheme,
        '.*VideoPlayer': VideoPlayer
    };

    public handleInvocation(rawInvocations: string): void {
        const invocations: IInvocation[] = JSON.parse(rawInvocations).map((invocation: any) => this.parseInvocation(invocation));
        const results = invocations.map((invocation) => this.executeInvocation(invocation));
        // tslint:disable:no-string-literal
        (<any>window)['nativebridge']['handleCallback'](results.map(result => [result.callbackId.toString(), CallbackStatus[result.callbackStatus], result.parameters]));
        // tslint:enable:no-string-literal
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        return;
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
        const api = (() => {
            for(const apiKey in Backend._apiMap) {
                if(Backend._apiMap.hasOwnProperty(apiKey) && invocation.className.match(apiKey)) {
                    return Backend._apiMap[apiKey];
                }
            }
        })();

        if (!api[invocation.method]) {
            // tslint:disable:no-console
            console.info('WARNING! Missing backend API method: ' + invocation.className + '.' + invocation.method);
            // tslint:enable:no-console
        }

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
