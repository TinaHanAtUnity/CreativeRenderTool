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

    private static _callbackId: number = 1;
    private static _callbackTable: {[key: number]: Object} = {};

    private static _backend: IWebViewBridge;
    private static _instance: NativeBridge = null;

    constructor(backend: IWebViewBridge) {
        NativeBridge._backend = backend;
        NativeBridge._instance = this;
    }

    public static getInstance() {
        return NativeBridge._instance;
    }

    public registerCallback(resolve, reject): number {
        let id: number = NativeBridge._callbackId++;
        let callbackObject: Object = {};
        callbackObject[CallbackStatus.OK] = resolve;
        callbackObject[CallbackStatus.ERROR] = reject;
        NativeBridge._callbackTable[id] = callbackObject;
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
        NativeBridge._backend.handleInvocation(JSON.stringify(batch.getBatch()).replace(NativeBridge._doubleRegExp, '$1'));
    }

    public handleCallback(results: any[][]): void {
        results.forEach((result: any[]): void => {
            let id: number = parseInt(result.shift(), 10);
            let status: string = result.shift();
            let parameters = result;
            let callbackObject: Object = NativeBridge._callbackTable[id];
            if(!callbackObject) {
                throw new Error('Unable to find matching callback object from callback id ' + id);
            }
            callbackObject[CallbackStatus[status]](parameters);
            delete NativeBridge._callbackTable[id];
        });
    }

    public handleEvent(parameters: any[]): void {
        let category: string = parameters.shift();
        let event: string = parameters.shift();
        switch(category) {
            case EventCategory[EventCategory.ADUNIT]:
                AdUnitApi.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.CACHE]:
                CacheApi.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.CONNECTIVITY]:
                ConnectivityApi.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.REQUEST]:
                RequestApi.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.RESOLVE]:
                ResolveApi.handleEvent(event, parameters);
                break;

            case EventCategory[EventCategory.VIDEOPLAYER]:
                VideoPlayerApi.handleEvent(event, parameters);
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
        NativeBridge._backend.handleCallback(id, status, JSON.stringify(parameters));
    }

}
