interface IWebViewBridge {
    handleInvocation(invocations: string): void;
    handleCallback(id: string, status: string, parameters?: string): void;
}

interface IMessageHandler {
    postMessage: Function;
}

interface IMessageHandlers {
    handleInvocation: IMessageHandler;
    handleCallback: IMessageHandler;
}

interface IWebKit {
    messageHandlers: IMessageHandlers;
}

// tslint:disable:interface-name
interface Window {
    webviewbridge: IWebViewBridge;
    webkit: IWebKit;
}
// tslint:enable:interface-name
