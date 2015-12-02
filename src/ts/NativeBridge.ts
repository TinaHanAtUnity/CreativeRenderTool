/// <reference path="WebViewBridge.d.ts" />

import { Observable } from 'Utilities/Observable';

export enum CallbackStatus {
    OK,
    ERROR
}

export type Callback = (...parameters: any[]) => void;

export type PackedCall = [string, string, any[], Callback, Callback];
export type PackedResult = [string, string, any[]];

export class NativeBridge extends Observable {

    private static _packageName: string = 'com.unity3d.unityads.api.';

    private static _callbackId: number = 1;
    private static _callbackTable: Object = {};

    private static _batchCallbackId: number = 1;
    private static _batchCallbackTable: {[key: number]: Callback} = {};

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    private _backend: IWebViewBridge;

    constructor(backend: IWebViewBridge) {
        super();
        this._backend = backend;
    }

    public invoke(className: string, methodName: string, parameters?: any[], callback?: Callback, error?: Callback): void {
        let id: number = null;
        if(callback) {
            id = this.createCallback(callback, error);
        }
        let fullClassName: string = NativeBridge._packageName + className;
        let jsonParameters: string = JSON.stringify(parameters).replace(NativeBridge._doubleRegExp, '$1');
        this._backend.handleInvocation(fullClassName, methodName, jsonParameters, id ? id.toString() : null);
    }

    public invokeBatch(calls: PackedCall[], callback?: Callback): void {
        let batch: [string, string, any[], string][] = [];
        calls.forEach((call: PackedCall): void => {
            let [className, methodName, parameters, callback, error]: PackedCall = call;
            let id: number = this.createCallback(callback, error);
            let fullClassName: string = NativeBridge._packageName + className;
            batch.push([fullClassName, methodName, parameters, id.toString()]);
        });

        let id: number = null;
        if(callback) {
            id = this.createBatchCallback(callback);
        }

        let jsonBatch: string = JSON.stringify(batch).replace(NativeBridge._doubleRegExp, '$1');
        this._backend.handleBatchInvocation(id ? id.toString() : null, jsonBatch);
    }

    public handleCallback(rawId: string, status: string, ...parameters: any[]): void {
        let id: number = parseInt(rawId, 10);
        let callbackObject: Function = NativeBridge._callbackTable[id];
        if(callbackObject) {
            let callback: Callback = callbackObject[CallbackStatus.OK];
            let error: Callback = callbackObject[CallbackStatus.ERROR];
            switch(status) {
                case CallbackStatus[CallbackStatus.OK]:
                    callback.apply(this, parameters);
                    break;

                case CallbackStatus[CallbackStatus.ERROR]:
                    error.apply(this, parameters);
                    break;

                default:
                    break;
            }
            delete NativeBridge._callbackTable[id];
        }
    }

    public handleBatchCallback(rawId: string, status: string, results: PackedResult[]): void {
        let id: number = parseInt(rawId, 10);
        results.forEach((result: PackedResult): void => {
            let [id, status, parameters]: PackedResult = result;
            this.handleCallback(id, status, parameters);
        });

        let callback: Callback = NativeBridge._batchCallbackTable[id];
        if(callback) {
            callback();
            delete NativeBridge._batchCallbackTable[id];
        }
    }

    public handleEvent(...parameters: any[]): void {
        this.trigger.apply(this, parameters);
    }

    public handleInvocation(className: string, methodName: string, callback: string, ...parameters: any[]): void {
        parameters.push((status: CallbackStatus, ...parameters: any[]) => {
            this.invokeCallback(callback, status, parameters);
        });
        window[className][methodName].apply(window[className], parameters);
    }

    private createCallback(callback: Callback, error: Callback): number {
        let id: number = NativeBridge._callbackId++;
        let callbackObject: Object = {};
        callbackObject[CallbackStatus.OK] = callback;
        callbackObject[CallbackStatus.ERROR] = error;
        NativeBridge._callbackTable[id] = callbackObject;
        return id;
    }

    private createBatchCallback(callback: Callback): number {
        let id: number = NativeBridge._batchCallbackId++;
        NativeBridge._batchCallbackTable[id] = callback;
        return id;
    }

    private invokeCallback(id: string, status: CallbackStatus, ...parameters: any[]): void {
        if(parameters.length > 0) {
            this._backend.handleCallback(id, status.toString(), JSON.stringify(parameters));
        } else {
            this._backend.handleCallback(id, status.toString());
        }
    }

}
