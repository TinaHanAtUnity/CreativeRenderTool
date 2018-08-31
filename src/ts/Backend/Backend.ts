import { CallbackStatus } from 'Common/Native/NativeBridge';
import { Sdk } from 'Backend/Api/Sdk';
import { Cache } from 'Backend/Api/Cache';
import { DeviceInfo } from 'Backend/Api/DeviceInfo';
import { Broadcast } from 'Backend/Api/Broadcast';
import { Connectivity } from 'Backend/Api/Connectivity';
import { Storage } from 'Backend/Api/Storage';
import { Request } from 'Backend/Api/Request';
import { Placement } from 'Backend/Api/Placement';
import { Listener } from 'Backend/Api/Listener';
import { AdUnit } from 'Backend/Api/AdUnit';
import { VideoPlayer } from 'Backend/Api/VideoPlayer';
import { Notification } from 'Backend/Api/Notification';
import { AppSheet } from 'Backend/Api/AppSheet';
import { Platform } from 'Common/Constants/Platform';
import { Intent } from 'Backend/Api/Intent';
import { UrlScheme } from 'Backend/Api/UrlScheme';
import { Lifecycle } from 'Backend/Api/Lifecycle';
import { Purchasing } from 'Backend/Api/Purchasing';

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
