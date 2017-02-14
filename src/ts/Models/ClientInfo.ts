import { Model } from 'Models/Model';
import { Platform } from 'Constants/Platform';
import { UnityAdsError } from 'Constants/UnityAdsError';

export class ClientInfo extends Model {

    private _gameId: string;
    private _testMode: boolean;

    private _applicationName: string;
    private _applicationVersion: string;
    private _sdkVersion: string;
    private _sdkVersionName: string;

    private _platform: Platform;

    private _debuggable: boolean;

    private _configUrl: string;
    private _webviewUrl: string;
    private _webviewHash: string;
    private _webviewVersion: string;

    private _initTimestamp: number;
    private _reinitialized: boolean;

    constructor(platform: Platform, data: any[]) {
        super();

        this._platform = platform;

        const gameIdString = data.shift();
        if(typeof gameIdString === 'string' && /^\d+$/.test(gameIdString)) {
            this._gameId = gameIdString;
        } else {
            throw new Error(UnityAdsError[UnityAdsError.INVALID_ARGUMENT]);
        }

        this._testMode = data.shift();
        this._applicationName = data.shift();
        this._applicationVersion = data.shift();
        this._sdkVersion = data.shift();
        this._sdkVersionName = data.shift();

        this._debuggable = data.shift();
        this._configUrl = data.shift();
        this._webviewUrl = data.shift();
        this._webviewHash = data.shift();
        this._webviewVersion = data.shift();

        this._initTimestamp = data.shift();
        this._reinitialized = data.shift();
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

    public getSdkVersionName(): string {
        return this._sdkVersionName;
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

    public getWebviewVersion(): string {
        return this._webviewVersion;
    }

    public getInitTimestamp(): number {
        return this._initTimestamp;
    }

    public isReinitialized(): boolean {
        return this._reinitialized;
    }

    public getDTO() {
        return {
            'gameId': this._gameId,
            'testMode': this._testMode,
            'bundleId': this._applicationName,
            'bundleVersion': this._applicationVersion,
            'sdkVersion': this._sdkVersion,
            'sdkVersionName': this._sdkVersionName,
            'platform': Platform[this._platform].toLowerCase(),
            'encrypted': !this._debuggable,
            'configUrl': this._configUrl,
            'webviewUrl': this._webviewUrl,
            'webviewHash': this._webviewHash,
            'webviewVersion': this._webviewVersion,
            'initTimestamp': this._initTimestamp,
            'reinitialized': this._reinitialized
        };
    }
}
