declare type PackedRawCall = [string, string, string, string];

interface IWebViewBridge {
    handleInvocation(className: String, methodName: String, parameters?: String, callback?: String): void;
    handleBatchInvocation(id: string, calls: PackedRawCall[]): void;
    handleCallback(id: String, status: String, parameters?: String): void;
}

/* tslint:disable:interface-name */
interface Window {
    webviewbridge: IWebViewBridge;
}
