import { Model } from 'Models/Model';
import { Platform } from 'Constants/Platform';

export class ClientInfo extends Model {

    private _gameId: string;
    private _testMode: boolean;

    private _applicationName: string;
    private _applicationVersion: string;
    private _sdkVersion: string;

    private _platform: Platform;

    private _debuggable: boolean;

    private _configUrl: string;
    private _webviewUrl: string;
    private _webviewHash: string;

    constructor(data: any[]) {
        super();
        this._gameId = data.shift();
        this._testMode = data.shift();
        this._applicationName = data.shift();
        this._applicationVersion = data.shift();
        this._sdkVersion = data.shift();

        let platformString = data.shift();
        if(platformString === 'android') {
            this._platform = Platform.ANDROID;
        } else if(platformString === 'ios') {
            this._platform = Platform.IOS;
        } else {
            throw new Error('Unknown platform');
        }

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

    public getApplicationName(): string {
        return this._applicationName;
    }

    public getSdkVersion(): string {
        return this._sdkVersion;
    }

    public getPlatform(): Platform {
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

    public getDTO() {
        return {
            'game_id': this._gameId,
            'test_mode': this._testMode,
            'application_name': this._applicationName,
            'application_version': this._applicationVersion,
            'sdk_version': this._sdkVersion,
            'platform': Platform[this._platform].toLowerCase(),
            'encrypted': !this._debuggable,
            'config_url': this._configUrl,
            'webview_url': this._webviewUrl,
            'webview_hash': this._webviewHash
        };
    }
}
