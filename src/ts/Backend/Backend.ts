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
import { CallbackStatus, NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { BackendApi } from './BackendApi';
import { Resolve } from './Api/Resolve';

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

interface IBackendApi {
    [key: string]: BackendApi;
    AdUnit: AdUnit;
    AppSheet: AppSheet;
    Broadcast: Broadcast;
    Cache: Cache;
    Connectivity: Connectivity;
    DeviceInfo: DeviceInfo;
    Intent: Intent;
    Lifecycle: Lifecycle;
    Listener: Listener;
    Notification: Notification;
    Placement: Placement;
    Purchasing: Purchasing;
    Request: Request;
    Sdk: Sdk;
    Storage: Storage;
    UrlScheme: UrlScheme;
    VideoPlayer: VideoPlayer;
}

export class Backend implements IWebViewBridge {

    private _platform: Platform;
    private _nativeBridge: NativeBridge;

    public readonly Api: IBackendApi;

    constructor(platform: Platform) {
        this._platform = platform;

        this.Api = {
            AdUnit: new AdUnit(this),
            AppSheet: new AppSheet(this),
            Broadcast: new Broadcast(this),
            Cache: new Cache(this),
            Connectivity: new Connectivity(this),
            DeviceInfo: new DeviceInfo(this),
            Intent: new Intent(this),
            Lifecycle: new Lifecycle(this),
            Listener: new Listener(this),
            Notification: new Notification(this),
            Placement: new Placement(this),
            Purchasing: new Purchasing(this),
            Request: new Request(this),
            Resolve: new Resolve(this),
            Sdk: new Sdk(this),
            Storage: new Storage(this),
            UrlScheme: new UrlScheme(this),
            VideoPlayer: new VideoPlayer(this)
        };
    }

    public setNativeBridge(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public sendEvent(category: string, name: string, ...parameters: any[]) {
        this._nativeBridge.handleEvent([category, name].concat(parameters));
    }

    public getPlatform(): Platform {
        return this._nativeBridge.getPlatform();
    }

    public handleInvocation(rawInvocations: string): void {
        const invocations: IInvocation[] = JSON.parse(rawInvocations).map((invocation: any) => this.parseInvocation(invocation));
        const results = invocations.map((invocation) => this.executeInvocation(invocation));
        this._nativeBridge.handleCallback(results.map(result => [result.callbackId.toString(), CallbackStatus[result.callbackStatus], result.parameters]));
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
            for(const apiKey in this.Api) {
                if(this.Api.hasOwnProperty(apiKey) && invocation.className.match('.*' + apiKey)) {
                    return this.Api[apiKey];
                }
            }
        })();

        if(!api) {
            throw new Error('Missing backend API implementation for: ' + invocation.className);
        }

        // @ts-ignore
        const method = api[invocation.method];
        if (!method) {
            throw new Error('Missing backend API method: ' + invocation.className + '.' + invocation.method);
        }

        try {
            return {
                callbackId: invocation.callbackId,
                callbackStatus: CallbackStatus.OK,
                parameters: [method.apply(api, invocation.parameters)]
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
