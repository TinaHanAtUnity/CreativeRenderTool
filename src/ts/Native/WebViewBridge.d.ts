interface IWebViewBridge {
    handleInvocation(invocations: string): void;
    handleCallback(id: string, status: string, parameters?: string): void;
}

// tslint:disable:interface-name
interface Window {
    webviewbridge: IWebViewBridge;
}
// tslint:enable:interface-name
