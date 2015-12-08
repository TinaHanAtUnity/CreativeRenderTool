/// <reference path="WebViewBridge.d.ts" />

import { Observable } from 'Utilities/Observable';

enum CallbackStatus {
    OK,
    ERROR
}

export type PackedCall = [string, string, any[]];
export type PackedResult = [string, string, any[]];

export class NativeBridge extends Observable {

    public static PackageName: string = 'com.unity3d.ads.api.';

    private static _callbackId: number = 1;
    private static _callbackTable: {[key: number]: Object} = {};

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    private _backend: IWebViewBridge;

    constructor(backend: IWebViewBridge) {
        super();
        this._backend = backend;
    }

    public invoke(className: string, methodName: string, parameters?: any[]): Promise<any[]> {
        return this.invokeBatch([[className, methodName, parameters]]);
    }

    public invokeBatch(invocations: PackedCall[]): Promise<any[]> {
        let batch: [string, string, any[], string][] = [];
        let promises: Promise<any[]>[] = invocations.map((invocation: PackedCall): Promise<any[]> => {
            return new Promise<any[]>((resolve, reject): void => {
                let id: number = NativeBridge._callbackId++;
                let callbackObject: Object = {};
                callbackObject[CallbackStatus.OK] = resolve;
                callbackObject[CallbackStatus.ERROR] = reject;
                NativeBridge._callbackTable[id] = callbackObject;
                let [className, methodName, parameters] = invocation;
                className = NativeBridge.PackageName + className;
                batch.push([className, methodName, parameters, id.toString()]);
            });
        });
        this._backend.handleInvocation(JSON.stringify(batch).replace(NativeBridge._doubleRegExp, '$1'));
        return Promise.all(promises);
    }

    public handleCallback(results: PackedResult[]): void {
        results.forEach((result: PackedResult): void => {
            let [rawId, status, parameters] = result;
            let id: number = parseInt(rawId, 10);
            let callbackObject: Object = NativeBridge._callbackTable[id];
            if(!callbackObject) {
                throw new Error('Unable to find matching callback object from callback id ' + id);
            }
            callbackObject[CallbackStatus[status]].call(null, parameters);
            delete NativeBridge._callbackTable[id];
        });
    }

    public handleEvent(...parameters: any[]): void {
        console.dir(parameters);
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
