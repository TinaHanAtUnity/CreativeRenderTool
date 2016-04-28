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

    public static ApiPackageName: string = 'com.unity3d.ads.api';

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    public AdUnit: AdUnitApi = null;
    public Cache: CacheApi = null;
    public Connectivity: ConnectivityApi = null;
    public DeviceInfo: DeviceInfoApi = null;
    public Intent: IntentApi = null;
    public Listener: ListenerApi = null;
    public Placement: PlacementApi = null;
    public Request: RequestApi = null;
    public Resolve: ResolveApi = null;
    public Sdk: SdkApi = null;
    public Storage: StorageApi = null;
    public VideoPlayer: VideoPlayerApi = null;

    private _callbackId: number = 1;
    private _callbackTable: {[key: number]: Object} = {};

    private _backend: IWebViewBridge;

    private _autoBatchEnabled: boolean;
    private _autoBatch: BatchInvocation;
    private _autoBatchTimer;
    private _autoBatchInterval = 50;

    constructor(backend: IWebViewBridge, autoBatch = true) {
        this._autoBatchEnabled = autoBatch;

        this._backend = backend;
        this.AdUnit = new AdUnitApi(this);
        this.Cache = new CacheApi(this);
        this.Connectivity = new ConnectivityApi(this);
        this.DeviceInfo = new DeviceInfoApi(this);
        this.Intent = new IntentApi(this);
        this.Listener = new ListenerApi(this);
        this.Placement = new PlacementApi(this);
        this.Request = new RequestApi(this);
        this.Resolve = new ResolveApi(this);
        this.Sdk = new SdkApi(this);
        this.Storage = new StorageApi(this);
        this.VideoPlayer = new VideoPlayerApi(this);
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
        if(this._autoBatchEnabled) {
            if(!this._autoBatch) {
                this._autoBatch = new BatchInvocation(this);
            }
            let promise = this._autoBatch.queue(className, methodName, parameters);
            if(!this._autoBatchTimer) {
                this._autoBatchTimer = setTimeout(() => {
                    this.invokeBatch(this._autoBatch);
                    this._autoBatch = null;
                    this._autoBatchTimer = null;
                }, this._autoBatchInterval);
            }
            return promise;
        } else {
            let batch = new BatchInvocation(this);
            let promise = batch.queue(className, methodName, parameters);
            this.invokeBatch(batch);
            return promise;
        }
    }

    public rawInvoke(packageName: string, className: string, methodName: string, parameters?: any[]): Promise<any[]> {
        let batch: BatchInvocation = new BatchInvocation(this);
        let promise = batch.rawQueue(packageName, className, methodName, parameters);
        this.invokeBatch(batch);
        return promise;
    }

    public handleCallback(results: any[][]): void {
        results.forEach((result: any[]): void => {
            let id: number = parseInt(result.shift(), 10);
            let status: string = result.shift();
            let parameters = result.shift();
            let callbackObject: Object = this._callbackTable[id];
            if(!callbackObject) {
                throw new Error('Unable to find matching callback object from callback id ' + id);
            }
            if(parameters.length === 1) {
                parameters = parameters[0];
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
                this.AdUnit.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.CACHE]:
                this.Cache.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.CONNECTIVITY]:
                this.Connectivity.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.REQUEST]:
                this.Request.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.RESOLVE]:
                this.Resolve.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.VIDEOPLAYER]:
                this.VideoPlayer.handleEvent(event, parameters);
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

    private invokeBatch(batch: BatchInvocation): void {
        this._backend.handleInvocation(JSON.stringify(batch.getBatch()).replace(NativeBridge._doubleRegExp, '$1'));
    }

    private invokeCallback(id: string, status: string, ...parameters: any[]): void {
        this._backend.handleCallback(id, status, JSON.stringify(parameters));
    }

}
