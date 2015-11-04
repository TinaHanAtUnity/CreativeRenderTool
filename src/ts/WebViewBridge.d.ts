interface IWebViewBridge {
    handleInvocation(className: string, methodName: string, parameters?: string, callback?: string): void;
    handleBatchInvocation(id: string, calls: string): void;
    handleCallback(id: string, status: string, parameters?: string): void;
}

/* tslint:disable:interface-name */
interface Window {
    webviewbridge: IWebViewBridge;
}
