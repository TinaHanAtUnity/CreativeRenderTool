import { AdUnit } from 'Backend/Api/AdUnit';
import { AppSheet } from 'Backend/Api/AppSheet';
import { Broadcast } from 'Backend/Api/Broadcast';
import { Cache } from 'Backend/Api/Cache';
import { Connectivity } from 'Backend/Api/Connectivity';
import { DeviceInfo } from 'Backend/Api/DeviceInfo';
import { Intent } from 'Backend/Api/Intent';
import { Lifecycle } from 'Backend/Api/Lifecycle';
import { Listener } from 'Backend/Api/Listener';
import { Notification } from 'Backend/Api/Notification';
import { Placement } from 'Backend/Api/Placement';
import { Purchasing } from 'Backend/Api/Purchasing';
import { Request } from 'Backend/Api/Request';
import { Sdk } from 'Backend/Api/Sdk';
import { Storage } from 'Backend/Api/Storage';
import { UrlScheme } from 'Backend/Api/UrlScheme';
import { VideoPlayer } from 'Backend/Api/VideoPlayer';
import { Platform } from 'Core/Constants/Platform';
import { CallbackStatus } from 'Core/Native/Bridge/NativeBridge';

interface IInvocation {
    className: string;
    method: string;
    parameters: Array<[string | number]>;
    callbackId: number;
}

interface IResult {
    callbackId: number;
    callbackStatus: CallbackStatus;
    parameters: unknown[];
}

export class Backend implements IWebViewBridge {

    public static sendEvent(category: string, name: string, ...parameters: unknown[]) {
        // tslint:disable:no-string-literal
        (<unknown>window)['nativebridge']['handleEvent']([category, name].concat(parameters));
        // tslint:enable:no-string-literal
    }

    public static getPlatform(): Platform {
        // tslint:disable:no-string-literal
        return (<unknown>window)['nativebridge']['getPlatform']();
        // tslint:enable:no-string-literal
    }

    private _apiMap: { [key: string]: unknown } = {
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
        const invocations: IInvocation[] = JSON.parse(rawInvocations).map((invocation: unknown) => this.parseInvocation(invocation));
        const results = invocations.map((invocation) => this.executeInvocation(invocation));
        // tslint:disable:no-string-literal
        (<unknown>window)['nativebridge']['handleCallback'](results.map(result => [result.callbackId.toString(), CallbackStatus[result.callbackStatus], result.parameters]));
        // tslint:enable:no-string-literal
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        return;
    }

    private parseInvocation(invocation: unknown): IInvocation {
        return {
            className: invocation[0],
            method: invocation[1],
            parameters: invocation[2],
            callbackId: invocation[3]
        };
    }

    private executeInvocation(invocation: IInvocation): IResult {
        const api = (() => {
            for(const apiKey in this._apiMap) {
                if(this._apiMap.hasOwnProperty(apiKey) && invocation.className.match(apiKey)) {
                    return this._apiMap[apiKey];
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
