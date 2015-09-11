interface IWebViewBridge {
    handleInvocation(className: String, methodName: String, parameters?: String, callback?: String): void;
    handleCallback(id: String, status: String, parameters?: String): void;
}

/* tslint:disable:interface-name */
interface Window {
    webviewbridge: IWebViewBridge;
}
