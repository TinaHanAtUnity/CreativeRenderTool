/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="WebViewBridge.d.ts" />

import { Observable } from 'Utilities/Observable';

enum CallbackStatus {
    OK,
    ERROR
}

type NativeInvocation = [string, string, any[], string];

export class BatchInvocation {

    private _nativeBridge: NativeBridge;
    private _batch: NativeInvocation[] = [];
    private _promises: Promise<any[]>[] = [];

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public queue(className: string, methodName: string, parameters?: any[]): Promise<any[]> {
        let promise = new Promise<any[]>((resolve, reject): void => {
            let id = this._nativeBridge.registerCallback(resolve, reject);
            className = NativeBridge.PackageName + className;
            this._batch.push([className, methodName, parameters ? parameters : [], id.toString()]);
        });
        this._promises.push(promise);
        return promise;
    }

    public getBatch(): NativeInvocation[] {
        return this._batch;
    }

    public getPromises(): Promise<any[]>[] {
        return this._promises;
    }

}

export class NativeBridge extends Observable {

    public static PackageName: string = 'com.unity3d.ads.api.';

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

    public invokeBatch(batch: BatchInvocation): Promise<any[][]> {
        this._backend.handleInvocation(JSON.stringify(batch.getBatch()).replace(NativeBridge._doubleRegExp, '$1'));
        return Promise.all(batch.getPromises());
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

    public handleInvocation(className: string, methodName: string, callback: string, ...parameters: any[]): void {
        parameters.push((status: CallbackStatus, ...parameters: any[]) => {
            this.invokeCallback(callback, status, parameters);
        });
        window[className][methodName].apply(window[className], parameters);
    }

    private invokeCallback(id: string, status: CallbackStatus, ...parameters: any[]): void {
        if(parameters.length > 0) {
            this._backend.handleCallback(id, status.toString(), JSON.stringify(parameters));
        } else {
            this._backend.handleCallback(id, status.toString());
        }
    }

}
