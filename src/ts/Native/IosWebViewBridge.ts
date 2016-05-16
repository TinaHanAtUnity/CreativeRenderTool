export class IosWebViewBridge implements IWebViewBridge {

    private static _nativeUrl = 'https://webviewbridge.unityads.unity3d.com';

    public handleInvocation(invocations: string): void {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', IosWebViewBridge._nativeUrl + '/handleInvocation', false);
        xhr.send(invocations);
    }

    public handleCallback(id: string, status: string, parameters?: string) {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', IosWebViewBridge._nativeUrl + '/handleCallback', false);
        xhr.send('{"id":"' + id + '","status":"' + status + '","parameters":' + parameters + '}');
    }

}
