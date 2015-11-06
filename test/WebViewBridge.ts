/// <reference path="../src/ts/WebViewBridge.d.ts" />

export default class WebViewBridge implements IWebViewBridge {
    public handleInvocation(className: string, methodName: string, parameters?: string, callback?: string): void {
        console.log(className, methodName, parameters, callback);

        switch(className) {
            case 'com.unity3d.unityads.api.Sdk':
                switch(methodName) {
                    case 'loadComplete':
                        window['nativebridge'].handleCallback(callback, 'OK', [12345, true]);
                        break;

                    default:
                        break;
                }
                break;

            default:
                break;
        }
    }

    public handleBatchInvocation(id: string, calls: string): void {
        console.log(id, calls);
    }

    public handleCallback(id: string, status: string, parameters?: string): void {
        console.log(id, status, parameters);
    }
}
