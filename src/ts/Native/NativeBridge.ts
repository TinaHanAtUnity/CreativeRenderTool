/// <reference path="../../../typings/main.d.ts" />
/// <reference path="WebViewBridge.d.ts" />

import { INativeBridge } from 'Native/INativeBridge';
import { BatchInvocation } from 'Native/BatchInvocation';
import { BroadcastApi } from 'Native/Api/Broadcast';
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
import { CallbackContainer } from 'Utilities/CallbackContainer';
import { Platform } from 'Constants/Platform';
import { AndroidAdUnitApi } from 'Native/Api/AndroidAdUnit';
import { IosAdUnitApi } from 'Native/Api/IosAdUnit';

export enum CallbackStatus {
    OK,
    ERROR
}

export interface INativeCallback {
    (status: CallbackStatus, ...parameters: any[]): void;
}

export class NativeBridge implements INativeBridge {

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    public AndroidAdUnit: AndroidAdUnitApi = null;
    public IosAdUnit: IosAdUnitApi = null;
    public Broadcast: BroadcastApi = null;
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
    private _callbackTable: {[key: number]: CallbackContainer} = {};

    private _platform: Platform;
    private _backend: IWebViewBridge;

    private _autoBatchEnabled: boolean;
    private _autoBatch: BatchInvocation;
    private _autoBatchTimer: any; // todo: should be number but causes naming clash with nodejs Timer
    private _autoBatchInterval = 50;

    private static convertStatus(status: string): CallbackStatus {
        switch(status) {
            case CallbackStatus[CallbackStatus.OK]: return CallbackStatus.OK;
            case CallbackStatus[CallbackStatus.ERROR]: return CallbackStatus.ERROR;
            default: throw new Error('Status string is not valid: ' + status);
        }
    }

    constructor(backend: IWebViewBridge, platform: Platform = Platform.TEST, autoBatch = true) {
        this._autoBatchEnabled = autoBatch;

        this._platform = platform;
        this._backend = backend;

        if(platform === Platform.IOS) {
            this.IosAdUnit = new IosAdUnitApi(this);
        } else {
            this.AndroidAdUnit = new AndroidAdUnitApi(this);
        }

        this.Broadcast = new BroadcastApi(this);
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

    public registerCallback(resolve: Function, reject: Function): number {
        let id: number = this._callbackId++;
        this._callbackTable[id] = new CallbackContainer(resolve, reject);
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

    public rawInvoke(fullClassName: string, methodName: string, parameters?: any[]): Promise<any[]> {
        let batch: BatchInvocation = new BatchInvocation(this);
        let promise = batch.rawQueue(fullClassName, methodName, parameters);
        this.invokeBatch(batch);
        return promise;
    }

    /* tslint:disable:switch-default */
    public handleCallback(results: any[][]): void {
        results.forEach((result: any[]): void => {
            let id: number = parseInt(result.shift(), 10);
            let status = NativeBridge.convertStatus(result.shift());
            let parameters = result.shift();
            let callbackObject: CallbackContainer = this._callbackTable[id];
            if (!callbackObject) {
                throw new Error('Unable to find matching callback object from callback id ' + id);
            }
            if(parameters.length === 1) {
                parameters = parameters[0];
            }
            switch (status) {
                case CallbackStatus.OK:
                    callbackObject.resolve(parameters);
                    break;
                case CallbackStatus.ERROR:
                    callbackObject.reject(parameters);
                    break;
            }
            delete this._callbackTable[id];
        });
    }

    public handleEvent(parameters: any[]): void {
        let category: string = parameters.shift();
        let event: string = parameters.shift();
        switch(category) {
            case EventCategory[EventCategory.ADUNIT]:
                if(this.getPlatform() === Platform.IOS) {
                    this.IosAdUnit.handleEvent(event, parameters);
                } else {
                    this.AndroidAdUnit.handleEvent(event, parameters);
                }
                break;

            case EventCategory[EventCategory.BROADCAST]:
                this.Broadcast.handleEvent(event, parameters);
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

    public getPlatform(): Platform {
        return this._platform;
    }

    private invokeBatch(batch: BatchInvocation): void {
        this._backend.handleInvocation(JSON.stringify(batch.getBatch()).replace(NativeBridge._doubleRegExp, '$1'));
    }

    private invokeCallback(id: string, status: string, ...parameters: any[]): void {
        this._backend.handleCallback(id, status, JSON.stringify(parameters));
    }

}
