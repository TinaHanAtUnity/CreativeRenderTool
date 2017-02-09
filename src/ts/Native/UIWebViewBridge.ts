export class UIWebViewBridge implements IWebViewBridge {

    private static _nativeUrl = 'https://webviewbridge.unityads.unity3d.com';

    public handleInvocation(invocations: string): void {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UIWebViewBridge._nativeUrl + '/handleInvocation', false);
        xhr.send(invocations);
    }

    public handleCallback(id: string, status: string, parameters?: string) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UIWebViewBridge._nativeUrl + '/handleCallback', false);
        xhr.send('{"id":"' + id + '","status":"' + status + '","parameters":' + parameters + '}');
    }

}
