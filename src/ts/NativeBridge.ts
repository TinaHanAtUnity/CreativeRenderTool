/// <reference path="WebViewBridge.d.ts" />

import Observable from 'Utilities/Observable';

export enum CallbackStatus {
    OK,
    ERROR
}

export type Callback = (...parameters: any[]) => void;

export class NativeBridge extends Observable {

    private static _packageName: string = 'com.unity3d.unityads.api.';

    private static _callbackId: number = 1;
    private static _callbackTable: Object = {};

    private static _doubleRegExp: RegExp = /"(\d+\.\d+)=double"/g;

    public invoke(className: string, methodName: string, parameters?: any[], callback?: Callback, error?: Callback): void {
        let id: number = null;
        if(callback) {
            id = NativeBridge._callbackId++;
            let callbackObject: Object = {};
            callbackObject[CallbackStatus.OK] = callback;
            callbackObject[CallbackStatus.ERROR] = error;
            NativeBridge._callbackTable[id] = callbackObject;
        }
        if(window.webviewbridge) {
            let fullClassName: string = NativeBridge._packageName + className;
            let jsonParameters: string = JSON.stringify(parameters).replace(NativeBridge._doubleRegExp, '$1');
            window.webviewbridge.handleInvocation(fullClassName, methodName, jsonParameters, id ? id.toString() : null);
        }
    }

    public handleCallback(id: string, status: string, ...parameters: any[]): void {
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

    public handleEvent(...parameters: any[]): void {
        this.trigger.apply(this, parameters);
    }

    public handleInvocation(className: string, methodName: string, callback: string, ...parameters: any[]): void {
        parameters.push((status: CallbackStatus, ...parameters: any[]) => {
            this.invokeCallback(callback, status, parameters);
        });
        window[className][methodName].apply(window[className], parameters);
    }

    private invokeCallback(id: string, status: CallbackStatus, ...parameters: any[]): void {
        if(window.webviewbridge) {
            if(parameters.length > 0) {
                window.webviewbridge.handleCallback(id, status.toString(), JSON.stringify(parameters));
            } else {
                window.webviewbridge.handleCallback(id, status.toString());
            }
        }
    }

}
