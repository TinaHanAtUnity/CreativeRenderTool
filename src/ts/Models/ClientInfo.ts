export class ClientInfo {

    private _gameId: string;
    private _testMode: boolean;

    private _applicationVersion: string;
    private _sdkVersion: string;

    private _platform: string;

    private _debuggable: boolean;

    private _configUrl: string;
    private _webviewUrl: string;
    private _webviewHash: string;

    constructor(data: any[]) {
        this._gameId = data.shift();
        this._testMode = data.shift();
        this._applicationVersion = data.shift();
        this._sdkVersion = data.shift();
        this._platform = data.shift();
        this._debuggable = data.shift();
        this._configUrl = data.shift();
        this._webviewUrl = data.shift();
        this._webviewHash = data.shift();
    }

    public getGameId(): string {
        return this._gameId;
    }

    public getTestMode(): boolean {
        return this._testMode;
    }

    public getApplicationVersion(): string {
        return this._applicationVersion;
    }

    public getSdkVersion(): string {
        return this._sdkVersion;
    }

    public getPlatform(): string {
        return this._platform;
    }

    public isDebuggable(): boolean {
        return this._debuggable;
    }

    public getConfigUrl(): string {
        return this._configUrl;
    }

    public getWebviewUrl(): string {
        return this._webviewUrl;
    }

    public getWebviewHash(): string {
        return this._webviewHash;
    }
}