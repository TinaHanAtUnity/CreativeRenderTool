interface WebViewBridge {
    handleInvocation(className: String, methodName: String, parameters?: String, callback?: String): void;
    handleCallback(id: String, status: String, parameters?: String): void;
}

interface Window {
    webviewbridge: WebViewBridge;
}