/// <reference path="WebViewBridge.d.ts" />

import Observable = require('Utilities/Observable');

enum CallbackStatus {
    OK,
    ERROR
}

class NativeBridge extends Observable {

    private static _packageName = 'com.unity3d.unityads.api.';

    private static _callbackId = 0;
    private static _callbackTable = {};

    invoke(className: string, methodName: string, parameters?: any[], callback?: Function) {
        var id = NativeBridge._callbackId++;
        NativeBridge._callbackTable[id] = callback;
        if(window.webviewbridge) {
            window.webviewbridge.handleInvocation(NativeBridge._packageName + className, methodName, JSON.stringify(parameters), id.toString());
        }
    }

    private invokeCallback(id: string, status: CallbackStatus, ...parameters) {
        if(window.webviewbridge) {
            if(parameters.length > 0) {
                window.webviewbridge.handleCallback(id, status.toString(), JSON.stringify(parameters));
            } else {
                window.webviewbridge.handleCallback(id, status.toString());
            }
        }
    }

    handleEvent(category: string, id: string, ...parameters) {
        this.trigger.apply(this, [category, id].concat(parameters));
    }

    handleCallback(id: string, status: string, ...parameters) {
        let callback = NativeBridge._callbackTable[id];
        if(callback) {
            parameters.unshift(status);
            callback.apply(window, parameters);
            delete NativeBridge._callbackTable[id];
        }
    }

    handleInvocation(className: string, methodName: string, callback: string, ...parameters) {
        parameters.push((status: CallbackStatus, ...parameters) => {
            this.invokeCallback(callback, status, parameters);
        });
        window[className][methodName].apply(window[className], parameters);
    }

    ping(callback) {
        callback("OK");
    }

}

export = NativeBridge;