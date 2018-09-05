export class WKWebViewBridge implements IWebViewBridge {

    public handleInvocation(invocations: string): void {
        window.webkit.messageHandlers.handleInvocation.postMessage(invocations);
    }

    public handleCallback(id: string, status: string, parameters?: string) {
        window.webkit.messageHandlers.handleCallback.postMessage({id: id, status: status, parameters: parameters});
    }

}
