/// <reference path="../../../typings/main.d.ts" />
/// <reference path="WebViewBridge.d.ts" />

import { INativeBridge } from 'Native/INativeBridge';
import { BatchInvocation } from 'Native/BatchInvocation';
import { AdUnitApi } from 'Native/Api/AdUnit';
import { CacheApi } from 'Native/Api/Cache';
import { ConnectivityApi } from 'Native/Api/Connectivity';
import { RequestApi } from 'Native/Api/Request';
import { VideoPlayerApi } from 'Native/Api/VideoPlayer';
import { EventCategory } from 'Constants/EventCategory';
import { ResolveApi } from 'Native/Api/Resolve';
import { IntentApi } from 'Native/Api/Intent';
import { ListenerApi } from 'Native/Api/Listener';
import { PlacementApi } from 'Native/Api/Placement';
import { SdkApi } from 'Native/Api/Sdk';
import { StorageApi } from 'Native/Api/Storage';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';

export enum CallbackStatus {
    OK,
    ERROR
}

export interface INativeCallback {
    (status: CallbackStatus, ...parameters: any[]): void;
}

export class NativeBridge implements INativeBridge {

    public static AdUnit: AdUnitApi;
    public static Cache: CacheApi;
    public static Connectivity: ConnectivityApi;
    public static DeviceInfo: DeviceInfoApi;
    public static Intent: IntentApi;
    public static Listener: ListenerApi;
    public static Placement: PlacementApi;
    public static Request: RequestApi;
    public static Resolve: ResolveApi;
    public static Sdk: SdkApi;
    public static Storage: StorageApi;
    public static VideoPlayer: VideoPlayerApi;

    public static ApiPackageName: string = 'com.unity3d.ads.api';

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    private static _instance: NativeBridge = null;

    private _callbackId: number = 1;
    private _callbackTable: {[key: number]: Object} = {};

    private _backend: IWebViewBridge;

    constructor(backend: IWebViewBridge) {
        this._backend = backend;
        NativeBridge.AdUnit = new AdUnitApi(this);
        NativeBridge.Cache = new CacheApi(this);
        NativeBridge.Connectivity = new ConnectivityApi(this);
        NativeBridge.DeviceInfo = new DeviceInfoApi(this);
        NativeBridge.Intent = new IntentApi(this);
        NativeBridge.Listener = new ListenerApi(this);
        NativeBridge.Placement = new PlacementApi(this);
        NativeBridge.Request = new RequestApi(this);
        NativeBridge.Resolve = new ResolveApi(this);
        NativeBridge.Sdk = new SdkApi(this);
        NativeBridge.Storage = new StorageApi(this);
        NativeBridge.VideoPlayer = new VideoPlayerApi(this);
        NativeBridge._instance = this;
    }

    public static getInstance() {
        return NativeBridge._instance;
    }

    public registerCallback(resolve, reject): number {
        let id: number = this._callbackId++;
        let callbackObject: Object = {};
        callbackObject[CallbackStatus.OK] = resolve;
        callbackObject[CallbackStatus.ERROR] = reject;
        this._callbackTable[id] = callbackObject;
        return id;
    }

    public invoke<T>(className: string, methodName: string, parameters?: any[]): Promise<T> {
        let batch: BatchInvocation = new BatchInvocation(this);
        let promise = batch.queue(className, methodName, parameters);
        this.invokeBatch(batch);
        return promise;
    }

    public rawInvoke(packageName: string, className: string, methodName: string, parameters?: any[]): Promise<any[]> {
        let batch: BatchInvocation = new BatchInvocation(this);
        let promise = batch.rawQueue(packageName, className, methodName, parameters);
        this.invokeBatch(batch);
        return promise;
    }

    public invokeBatch(batch: BatchInvocation): void {
        this._backend.handleInvocation(JSON.stringify(batch.getBatch()).replace(NativeBridge._doubleRegExp, '$1'));
    }

    public handleCallback(results: any[][]): void {
        results.forEach((result: any[]): void => {
            let id: number = parseInt(result.shift(), 10);
            let status: string = result.shift();
            let parameters = result;
            let callbackObject: Object = this._callbackTable[id];
            if(!callbackObject) {
                throw new Error('Unable to find matching callback object from callback id ' + id);
            }
            callbackObject[CallbackStatus[status]](parameters);
            delete this._callbackTable[id];
        });
    }

    public handleEvent(parameters: any[]): void {
        let category: string = parameters.shift();
        let event: string = parameters.shift();
        switch(category) {
            case EventCategory[EventCategory.ADUNIT]:
                NativeBridge.AdUnit.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.CACHE]:
                NativeBridge.Cache.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.CONNECTIVITY]:
                NativeBridge.Connectivity.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.REQUEST]:
                NativeBridge.Request.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.RESOLVE]:
                NativeBridge.Resolve.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.VIDEOPLAYER]:
                NativeBridge.VideoPlayer.handleEvent(event, parameters);
                break;

            default:
                throw new Error('Unknown event category: ' + category);
        }
    }

    public handleInvocation(parameters: any[]): void {
        let className: string = parameters.shift();
        let methodName: string = parameters.shift();
        let callback: string = parameters.shift();
        parameters.push((status: CallbackStatus, ...callbackParameters: any[]) => {
            this.invokeCallback(callback, CallbackStatus[status], ...callbackParameters);
        });
        window[className][methodName].apply(window[className], parameters);
    }

    private invokeCallback(id: string, status: string, ...parameters: any[]): void {
        this._backend.handleCallback(id, status, JSON.stringify(parameters));
    }

}
