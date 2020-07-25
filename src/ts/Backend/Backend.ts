import { AdUnit } from 'Backend/Api/AdUnit';
import { Analytics } from 'Backend/Api/Analytics';
import { AppSheet } from 'Backend/Api/AppSheet';
import { Broadcast } from 'Backend/Api/Broadcast';
import { Cache } from 'Backend/Api/Cache';
import { Connectivity } from 'Backend/Api/Connectivity';
import { DeviceInfo } from 'Backend/Api/DeviceInfo';
import { Intent } from 'Backend/Api/Intent';
import { Lifecycle } from 'Backend/Api/Lifecycle';
import { Listener } from 'Backend/Api/Listener';
import { MonetizationListener } from 'Backend/Api/MonetizationListener';
import { Notification } from 'Backend/Api/Notification';
import { Placement } from 'Backend/Api/Placement';
import { PlacementContents } from 'Backend/Api/PlacementContents';
import { Request } from 'Backend/Api/Request';
import { Resolve } from 'Backend/Api/Resolve';
import { Sdk } from 'Backend/Api/Sdk';
import { Storage } from 'Backend/Api/Storage';
import { UrlScheme } from 'Backend/Api/UrlScheme';
import { VideoPlayer } from 'Backend/Api/VideoPlayer';
import { BackendApi } from 'Backend/BackendApi';
import { Platform } from 'Core/Constants/Platform';
import { CallbackStatus, NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IosPreferences } from 'Backend/Api/IosPreferences';
import { AndroidPreferences } from 'Backend/Api/AndroidPreferences';
import { BannerListener } from 'Backend/Api/BannerListener';
import { AndroidStore } from 'Backend/Api/AndroidStore';
import { Products } from 'Backend/Api/Products';
import { BannerBackendApi } from 'Backend/Api/Banner';
import { ClassDetection } from 'Backend/Api/ClassDetection';
import { TrackingManager } from 'Backend/Api/TrackingManager';

interface IInvocation {
    className: string;
    method: string;
    parameters: [string | number][];
    callbackId: number;
}

interface IResult {
    callbackId: number;
    callbackStatus: CallbackStatus;
    parameters: unknown[];
}

interface IBackendApi {
    [key: string]: BackendApi;
    AdUnit: AdUnit;
    AppSheet: AppSheet;
    Broadcast: Broadcast;
    Cache: Cache;
    Connectivity: Connectivity;
    DeviceInfo: DeviceInfo;
    ClassDetection: ClassDetection;
    Intent: Intent;
    Lifecycle: Lifecycle;
    Listener: Listener;
    Notification: Notification;
    Placement: Placement;
    Preferences: AndroidPreferences | IosPreferences;
    Products: Products;
    Request: Request;
    Sdk: Sdk;
    Storage: Storage;
    Store: AndroidStore;
    UrlScheme: UrlScheme;
    VideoPlayer: VideoPlayer;
    BannerListener: BannerListener;
    Banner: BannerBackendApi;
    TrackingManager: TrackingManager;
}

export class Backend implements IWebViewBridge {

    private _platform: Platform;
    private _nativeBridge: NativeBridge;

    public readonly Api: IBackendApi;

    constructor(platform: Platform) {
        this._platform = platform;

        this.Api = {
            AdUnit: new AdUnit(this),
            Analytics: new Analytics(this),
            AppSheet: new AppSheet(this),
            Broadcast: new Broadcast(this),
            Cache: new Cache(this),
            Connectivity: new Connectivity(this),
            DeviceInfo: new DeviceInfo(this),
            ClassDetection: new ClassDetection(this),
            Intent: new Intent(this),
            Lifecycle: new Lifecycle(this),
            Listener: new Listener(this),
            MonetizationListener: new MonetizationListener(this),
            Notification: new Notification(this),
            Placement: new Placement(this),
            PlacementContents: new PlacementContents(this),
            Preferences: platform === Platform.IOS ? new IosPreferences(this) : new AndroidPreferences(this),
            Products: new Products(this),
            Request: new Request(this),
            Resolve: new Resolve(this),
            Sdk: new Sdk(this),
            Storage: new Storage(this),
            Store: new AndroidStore(this),
            UrlScheme: new UrlScheme(this),
            VideoPlayer: new VideoPlayer(this),
            BannerListener: new BannerListener(this),
            Banner: new BannerBackendApi(this),
            TrackingManager: new TrackingManager(this)
        };
    }

    public setNativeBridge(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public sendEvent(category: string, name: string, ...parameters: unknown[]) {
        this._nativeBridge.handleEvent((<unknown[]>[category, name]).concat(parameters));
    }

    public getPlatform(): Platform {
        return this._nativeBridge.getPlatform();
    }

    public handleInvocation(rawInvocations: string): void {
        const invocations: IInvocation[] = JSON.parse(rawInvocations).map((invocation: unknown) => this.parseInvocation(<[string, string, [string | number][], number]>invocation));
        const results = invocations.map((invocation) => this.executeInvocation(invocation));
        this._nativeBridge.handleCallback(results.map(result => [result.callbackId.toString(), CallbackStatus[result.callbackStatus], result.parameters]));
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        return;
    }

    private parseInvocation(invocation: [string, string, [string | number][], number]): IInvocation {
        return {
            className: invocation[0],
            method: invocation[1],
            parameters: invocation[2],
            callbackId: invocation[3]
        };
    }

    private executeInvocation(invocation: IInvocation): IResult {
        const api = (() => {
            if (this._platform === Platform.ANDROID) {
                const splitClassName = invocation.className.split('.');
                const apiKey = splitClassName[splitClassName.length - 1];
                return this.Api[apiKey];
            } else if (this._platform === Platform.IOS) {
                const splitClassName = invocation.className.split('Api');
                const apiKey = splitClassName[1];
                return this.Api[apiKey];
            }
        })();

        if (!api) {
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
        } catch (error) {
            return {
                callbackId: invocation.callbackId,
                callbackStatus: CallbackStatus.ERROR,
                parameters: [error]
            };
        }
    }

}
