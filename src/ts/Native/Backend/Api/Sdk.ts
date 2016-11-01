export class Sdk {

    public static loadComplete() {
        return [
            Sdk._gameId,
            Sdk._testMode,
            Sdk._appName,
            Sdk._appVersion,
            Sdk._sdkVersion,
            Sdk._sdkVersionName,
            Sdk._debuggable,
            Sdk._configUrl,
            Sdk._webViewUrl,
            Sdk._webViewHash,
            Sdk._webViewVersion
        ];
    }

    public static initComplete() {
        return;
    }

    public static logError(message: string) {
        console.error(message);
    }

    public static logInfo(message: string) {
        // tslint:disable:no-console
        console.info(message);
        // tslint:enable:no-console
    }

    public static setGameId(gameId: string) {
        Sdk._gameId = gameId;
    }

    public static setTestMode(testMode: boolean) {
        Sdk._testMode = testMode;
    }

    private static _gameId: string = '14851';
    private static _testMode: boolean = false;
    private static _appName: string = 'com.unity3d.ads.example';
    private static _appVersion: string = '2.0.5';
    private static _sdkVersion: number = 2005;
    private static _sdkVersionName: string = '2.0.5';
    private static _debuggable: boolean = true;
    private static _configUrl: string = 'https://config.unityads.unity3d.com/webview/master/release/config.json';
    private static _webViewUrl: string = 'https://webview.unityads.unity3d.com/webview/master/14074b3e2814a1ce9b560821dc6f16f0b045413d/release/index.html';
    private static _webViewHash: string = 'f87a80ca1665bb5dbe2a6083fcef6008a96876e9c44f9046f33795ae3ffd663e';
    private static _webViewVersion: string = '14074b3e2814a1ce9b560821dc6f16f0b045413d';

}
