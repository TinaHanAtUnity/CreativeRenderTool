export class ClientInfo {

    private _gameId: string;
    private _testMode: boolean;

    private _applicationVersion: string;
    private _sdkVersion: string;

    private _platform: string;

    private _debuggable: boolean;

    constructor(gameId: string, testMode: boolean, applicationVersion: string, sdkVersion: string, platform: string, debuggable: boolean) {
        this._gameId = gameId;
        this._testMode = testMode;
        this._applicationVersion = applicationVersion;
        this._sdkVersion = sdkVersion;
        this._platform = platform;
        this._debuggable = debuggable;
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

}
