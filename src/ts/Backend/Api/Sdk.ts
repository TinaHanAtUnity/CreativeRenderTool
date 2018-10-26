import { BackendApi } from 'Backend/BackendApi';

export class Sdk extends BackendApi {

    public loadComplete() {
        return [
            this._gameId,
            this._testMode,
            this._appName,
            this._appVersion,
            this._sdkVersion,
            this._sdkVersionName,
            this._debuggable,
            this._configUrl,
            this._webViewUrl,
            this._webViewHash,
            this._webViewVersion,
            this._initTimeStamp,
            this._reinitialized
        ];
    }

    public initComplete() {
        return;
    }

    public logError(message: string) {
        // tslint:disable:no-console
        console.error(message);
        // tslint:enable:no-console
    }

    public logWarning(message: string) {
        // tslint:disable:no-console
        console.warn(message);
        // tslint:enable:no-console
    }

    public logInfo(message: string) {
        // tslint:disable:no-console
        console.info(message);
        // tslint:enable:no-console
    }

    public logDebug(message: string) {
        // tslint:disable:no-console
        console.log(message);
        // tslint:enable:no-console
    }

    public setGameId(gameId: string) {
        this._gameId = gameId;
    }

    public setTestMode(testMode: boolean) {
        this._testMode = testMode;
    }

    public setAppName(appName: string) {
        this._appName = appName;
    }

    public setAppVersion(appVersion: string) {
        this._appVersion = appVersion;
    }

    public setSdkVersion(sdkVersion: number) {
        this._sdkVersion = sdkVersion;
    }

    public setSdkVersionName(sdkVersionName: string) {
        this._sdkVersionName = sdkVersionName;
    }

    public setDebuggable(debuggable: boolean) {
        this._debuggable = debuggable;
    }

    public setConfigUrl(configUrl: string) {
        this._configUrl = configUrl;
    }

    public setWebViewUrl(webViewUrl: string) {
        this._webViewUrl = webViewUrl;
    }

    public setWebViewHash(webViewHash: string | null) {
        this._webViewHash = webViewHash;
    }

    public setWebViewVersion(webViewVersion: string) {
        this._webViewVersion = webViewVersion;
    }

    public setInitTimeStamp(initTimeStamp: number) {
        this._initTimeStamp = initTimeStamp;
    }

    public setReinitialized(reinitialized: boolean) {
        this._reinitialized = reinitialized;
    }

    private _gameId: string = '345';
    private _testMode: boolean = true;
    private _appName: string = 'com.test.app.name';
    private _appVersion: string = '1.2.3-appversion';
    private _sdkVersion: number = 2000;
    private _sdkVersionName: string = '2.0.0-sdkversion';
    private _debuggable: boolean = false;
    private _configUrl: string = 'https://test.config.url';
    private _webViewUrl: string = 'https://test.webview.url';
    private _webViewHash: string | null = null;
    private _webViewVersion: string = '2.0.0.-webviewversion';
    private _initTimeStamp: number = 12345;
    private _reinitialized: boolean = false;
}
