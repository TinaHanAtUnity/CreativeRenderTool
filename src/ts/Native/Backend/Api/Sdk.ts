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
            Sdk._webViewVersion,
            Sdk._initTimeStamp,
            Sdk._reinitialized
        ];
    }

    public static initComplete() {
        return;
    }

    public static logError(message: string) {
        // tslint:disable:no-console
        console.error(message);
        // tslint:enable:no-console
    }

    public static logWarning(message: string) {
        // tslint:disable:no-console
        console.warn(message);
        // tslint:enable:no-console
    }

    public static logInfo(message: string) {
        // tslint:disable:no-console
        console.info(message);
        // tslint:enable:no-console
    }

    public static logDebug(message: string) {
        // tslint:disable:no-console
        console.log(message);
        // tslint:enable:no-console
    }

    public static setGameId(gameId: string) {
        Sdk._gameId = gameId;
    }

    public static setTestMode(testMode: boolean) {
        Sdk._testMode = testMode;
    }

    public static setAppName(appName: string) {
        Sdk._appName = appName;
    }

    public static setAppVersion(appVersion: string) {
        Sdk._appVersion = appVersion;
    }

    public static setSdkVersion(sdkVersion: number) {
        Sdk._sdkVersion = sdkVersion;
    }

    public static setSdkVersionName(sdkVersionName: string) {
        Sdk._sdkVersionName = sdkVersionName;
    }

    public static setDebuggable(debuggable: boolean) {
        Sdk._debuggable = debuggable;
    }

    public static setConfigUrl(configUrl: string) {
        Sdk._configUrl = configUrl;
    }

    public static setWebViewUrl(webViewUrl: string) {
        Sdk._webViewUrl = webViewUrl;
    }

    public static setWebViewHash(webViewHash: string | null) {
        Sdk._webViewHash = webViewHash;
    }

    public static setWebViewVersion(webViewVersion: string) {
        Sdk._webViewVersion = webViewVersion;
    }

    public static setInitTimeStamp(initTimeStamp: number) {
        Sdk._initTimeStamp = initTimeStamp;
    }

    public static setReinitialized(reinitialized: boolean) {
        Sdk._reinitialized = reinitialized;
    }

    private static _gameId: string = '345';
    private static _testMode: boolean = true;
    private static _appName: string = 'com.test.app.name';
    private static _appVersion: string = '1.2.3-appversion';
    private static _sdkVersion: number = 2000;
    private static _sdkVersionName: string = '2.0.0-sdkversion';
    private static _debuggable: boolean = false;
    private static _configUrl: string = 'https://test.config.url';
    private static _webViewUrl: string = 'https://test.webview.url';
    private static _webViewHash: string | null = null;
    private static _webViewVersion: string = '2.0.0.-webviewversion';
    private static _initTimeStamp: number = 12345;
    private static _reinitialized: boolean = false;
}
