/// <reference path="../../typings/main.d.ts" />
/// <reference path="WebViewBridge.d.ts" />

import { Observable } from 'Utilities/Observable';
import { INativeBridge } from 'INativeBridge';

type NativeInvocation = [string, string, any[], string];

export class BatchInvocation {

    private _nativeBridge: NativeBridge;
    private _batch: NativeInvocation[] = [];

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public queue(className: string, methodName: string, parameters?: any[]): Promise<any[]> {
        return this.rawQueue(NativeBridge.ApiPackageName, className, methodName, parameters);
    }

    public rawQueue(packageName: string, className: string, methodName: string, parameters?: any[]): Promise<any[]> {
        return new Promise<any[]>((resolve, reject): void => {
            let id = this._nativeBridge.registerCallback(resolve, reject);
            let fullClassName = packageName + '.' + className;
            this._batch.push([fullClassName, methodName, parameters ? parameters : [], id.toString()]);
        });
    }

    public getBatch(): NativeInvocation[] {
        return this._batch;
    }

}

export enum CallbackStatus {
    OK,
    ERROR
}

export enum UnityAdsError {
    NOT_INITIALIZED,
    INITIALIZE_FAILED,
    INVALID_ARGUMENT,
    VIDEO_PLAYER_ERROR,
    INIT_SANITY_CHECK_FAIL,
    AD_BLOCKER_DETECTED,
    FILE_IO_ERROR,
    DEVICE_ID_ERROR,
    SHOW_ERROR,
    INTERNAL_ERROR
}

export interface INativeCallback {
    (status: CallbackStatus, ...parameters: any[]): void;
}

export class NativeBridge extends Observable implements INativeBridge {

    public static ApiPackageName: string = 'com.unity3d.ads.api';

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    private _callbackId: number = 1;
    private _callbackTable: {[key: number]: Object} = {};

    private _backend: IWebViewBridge;

    public registerCallback(resolve, reject): number {
        let id: number = this._callbackId++;
        let callbackObject: Object = {};
        callbackObject[CallbackStatus.OK] = resolve;
        callbackObject[CallbackStatus.ERROR] = reject;
        this._callbackTable[id] = callbackObject;
        return id;
    }

    constructor(backend: IWebViewBridge) {
        super();
        this._backend = backend;
    }

    public invoke(className: string, methodName: string, parameters?: any[]): Promise<any[]> {
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
        this.trigger.apply(this, parameters);
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
