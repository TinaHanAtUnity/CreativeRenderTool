export class UIWebViewBridge implements IWebViewBridge {

    private static _nativeUrl = 'https://webviewbridge.unityads.unity3d.com';
    private static _async = false;

    public handleInvocation(invocations: string): void {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UIWebViewBridge._nativeUrl + '/handleInvocation', UIWebViewBridge._async);
        xhr.send(invocations);
    }

    public handleCallback(id: string, status: string, parameters?: string) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UIWebViewBridge._nativeUrl + '/handleCallback', UIWebViewBridge._async);
        xhr.send('{"id":"' + id + '","status":"' + status + '","parameters":' + parameters + '}');
    }

    public static setAsync(value: boolean) {
        UIWebViewBridge._async = value;
    }

}
