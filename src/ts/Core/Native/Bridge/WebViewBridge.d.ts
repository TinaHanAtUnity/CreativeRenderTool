interface IWebViewBridge {
    handleInvocation(invocations: string): void;
    handleCallback(id: string, status: string, parameters?: string): void;
}

interface IMessageHandler {
    // eslint-disable-next-line
    postMessage: (message: unknown) => void;
}

interface IMessageHandlers {
    handleInvocation: IMessageHandler;
    handleCallback: IMessageHandler;
}

interface IWebKit {
    messageHandlers: IMessageHandlers;
}

// eslint-disable-next-line
interface Window {
    webviewbridge: IWebViewBridge;
    webkit: IWebKit;
}
