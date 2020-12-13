import { BackendApi } from 'Backend/BackendApi';
export class Sdk extends BackendApi {
    constructor() {
        super(...arguments);
        this._gameId = '345';
        this._testMode = true;
        this._appName = 'com.test.app.name';
        this._appVersion = '1.2.3-appversion';
        this._sdkVersion = 2000;
        this._sdkVersionName = '2.0.0-sdkversion';
        this._debuggable = false;
        this._configUrl = 'https://test.config.url';
        this._webViewUrl = 'https://test.webview.url';
        this._webViewHash = null;
        this._webViewVersion = '2.0.0.-webviewversion';
        this._initTimeStamp = 12345;
        this._reinitialized = false;
        this._usePerPlacementLoad = false;
        this._enableLogs = false;
    }
    loadComplete() {
        this._enableLogs = window.location.href.includes('enableLogs');
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
            this._reinitialized,
            this._usePerPlacementLoad
        ];
    }
    initComplete() {
        return;
    }
    initError(message, code) {
        // tslint:disable:no-console
        console.error(`Failed to initialize Unity Ads SDK.\nError: ${message}\nError Code: ${code}`);
        // tslint:enable:no-console
    }
    logError(message) {
        if (this._enableLogs) {
            // tslint:disable:no-console
            console.error(message);
            // tslint:enable:no-console
        }
    }
    logWarning(message) {
        if (this._enableLogs) {
            // tslint:disable:no-console
            console.warn(message);
            // tslint:enable:no-console
        }
    }
    logInfo(message) {
        if (this._enableLogs) {
            // tslint:disable:no-console
            console.info(message);
            // tslint:enable:no-console
        }
    }
    logDebug(message) {
        if (this._enableLogs) {
            // tslint:disable:no-console
            console.log(message);
            // tslint:enable:no-console
        }
    }
    setGameId(gameId) {
        this._gameId = gameId;
    }
    setTestMode(testMode) {
        this._testMode = testMode;
    }
    setAppName(appName) {
        this._appName = appName;
    }
    setAppVersion(appVersion) {
        this._appVersion = appVersion;
    }
    setSdkVersion(sdkVersion) {
        this._sdkVersion = sdkVersion;
    }
    setSdkVersionName(sdkVersionName) {
        this._sdkVersionName = sdkVersionName;
    }
    setDebuggable(debuggable) {
        this._debuggable = debuggable;
    }
    setConfigUrl(configUrl) {
        this._configUrl = configUrl;
    }
    setWebViewUrl(webViewUrl) {
        this._webViewUrl = webViewUrl;
    }
    setWebViewHash(webViewHash) {
        this._webViewHash = webViewHash;
    }
    setWebViewVersion(webViewVersion) {
        this._webViewVersion = webViewVersion;
    }
    setInitTimeStamp(initTimeStamp) {
        this._initTimeStamp = initTimeStamp;
    }
    setReinitialized(reinitialized) {
        this._reinitialized = reinitialized;
    }
    setUsePerPlacementLoad(usePerPlacementLoad) {
        this._usePerPlacementLoad = usePerPlacementLoad;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2RrLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0JhY2tlbmQvQXBpL1Nkay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFaEQsTUFBTSxPQUFPLEdBQUksU0FBUSxVQUFVO0lBQW5DOztRQXdIWSxZQUFPLEdBQVcsS0FBSyxDQUFDO1FBQ3hCLGNBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIsYUFBUSxHQUFXLG1CQUFtQixDQUFDO1FBQ3ZDLGdCQUFXLEdBQVcsa0JBQWtCLENBQUM7UUFDekMsZ0JBQVcsR0FBVyxJQUFJLENBQUM7UUFDM0Isb0JBQWUsR0FBVyxrQkFBa0IsQ0FBQztRQUM3QyxnQkFBVyxHQUFZLEtBQUssQ0FBQztRQUM3QixlQUFVLEdBQVcseUJBQXlCLENBQUM7UUFDL0MsZ0JBQVcsR0FBVywwQkFBMEIsQ0FBQztRQUNqRCxpQkFBWSxHQUFrQixJQUFJLENBQUM7UUFDbkMsb0JBQWUsR0FBVyx1QkFBdUIsQ0FBQztRQUNsRCxtQkFBYyxHQUFXLEtBQUssQ0FBQztRQUMvQixtQkFBYyxHQUFZLEtBQUssQ0FBQztRQUNoQyx5QkFBb0IsR0FBWSxLQUFLLENBQUM7UUFDdEMsZ0JBQVcsR0FBWSxLQUFLLENBQUM7SUFDekMsQ0FBQztJQXJJVSxZQUFZO1FBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0QsT0FBTztZQUNILElBQUksQ0FBQyxPQUFPO1lBQ1osSUFBSSxDQUFDLFNBQVM7WUFDZCxJQUFJLENBQUMsUUFBUTtZQUNiLElBQUksQ0FBQyxXQUFXO1lBQ2hCLElBQUksQ0FBQyxXQUFXO1lBQ2hCLElBQUksQ0FBQyxlQUFlO1lBQ3BCLElBQUksQ0FBQyxXQUFXO1lBQ2hCLElBQUksQ0FBQyxVQUFVO1lBQ2Ys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