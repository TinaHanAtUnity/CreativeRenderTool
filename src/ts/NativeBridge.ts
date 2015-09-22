/// <reference path="WebViewBridge.d.ts" />

import Observable from 'Utilities/Observable';

export const enum CallbackStatus {
    OK,
    ERROR
}

export default class NativeBridge extends Observable {

    private static _packageName: string = 'com.unity3d.unityads.api.';

    private static _callbackId: number = 1;
    private static _callbackTable: Object = {};

    public invoke(className: string, methodName: string, parameters?: any[], callback?: Function): void {
        let id: number = null;
        if(callback) {
            id = NativeBridge._callbackId++;
            NativeBridge._callbackTable[id] = callback;
        }
        if(window.webviewbridge) {
            let fullClassName: string = NativeBridge._packageName + className;
            window.webviewbridge.handleInvocation(fullClassName, methodName, JSON.stringify(parameters), id ? id.toString() : null);
        }
    }

    public handleCallback(id: string, status: string, ...parameters: any[]): void {
        let callback: Function = NativeBridge._callbackTable[id];
        if(callback) {
            parameters.unshift(status);
            callback.apply(window, parameters);
            delete NativeBridge._callbackTable[id];
        }
    }

    public handleEvent(category: string, id: string, ...parameters: any[]): void {
        this.trigger.apply(this, [category + '_' + id].concat(parameters));
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
