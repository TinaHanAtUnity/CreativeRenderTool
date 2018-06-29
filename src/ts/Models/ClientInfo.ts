import { Platform } from 'Constants/Platform';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Model } from 'Models/Model';

interface IClientInfo {
    gameId: string;
    testMode: boolean;
    applicationName: string;
    applicationVersion: string;
    sdkVersion: number;
    sdkVersionName: string;
    platform: Platform;
    debuggable: boolean;
    configUrl: string;
    webviewUrl: string;
    webviewHash: string | null;
    webviewVersion: string | null;
    initTimestamp: number;
    reinitialized: boolean;
}

export class ClientInfo extends Model<IClientInfo> {

    constructor(platform: Platform, data: any[]) {
        super('ClientInfo', {
            gameId: ['string'],
            testMode: ['boolean'],
            applicationName: ['string'],
            applicationVersion: ['string'],
            sdkVersion: ['number'],
            sdkVersionName: ['string'],
            platform: ['number'],
            debuggable: ['boolean'],
            configUrl: ['string'],
            webviewUrl: ['string'],
            webviewHash: ['string', 'null'],
            webviewVersion: ['string', 'null'],
            initTimestamp: ['number'],
            reinitialized: ['boolean']
        });

        this.set('platform', platform);

        this.set('gameId', data.shift());
        this.set('testMode', data.shift());
        this.set('applicationName', data.shift());
        this.set('applicationVersion', data.shift());
        this.set('sdkVersion', data.shift());
        this.set('sdkVersionName', data.shift());
        this.set('debuggable', data.shift());
        this.set('configUrl', data.shift());
        this.set('webviewUrl', data.shift());
        this.set('webviewHash', data.shift());
        this.set('webviewVersion', data.shift());
        this.set('initTimestamp', data.shift());
        this.set('reinitialized', data.shift());
    }

    public getGameId(): string {
        return this.get('gameId');
    }

    public getTestMode(): boolean {
        return this.get('testMode');
    }

    public getApplicationVersion(): string {
        return this.get('applicationVersion');
    }

    public getApplicationName(): string {
        return this.get('applicationName');
    }

    public getSdkVersion(): number {
        return this.get('sdkVersion');
    }

    public getSdkVersionName(): string {
        return this.get('sdkVersionName');
    }

    public getPlatform(): Platform {
        return this.get('platform');
    }

    public isDebuggable(): boolean {
        return this.get('debuggable');
    }

    public getConfigUrl(): string {
        return this.get('configUrl');
    }

    public getWebviewUrl(): string {
        return this.get('webviewUrl');
    }

    public getWebviewHash(): string | null {
        return this.get('webviewHash');
    }

    public getWebviewVersion(): string | null {
        return this.get('webviewVersion');
    }

    public getInitTimestamp(): number {
        return this.get('initTimestamp');
    }

    public isReinitialized(): boolean {
        return this.get('reinitialized');
    }

    public getDTO() {
        return {
            'gameId': this.getGameId(),
            'testMode': this.getTestMode(),
            'bundleId': this.getApplicationName(),
            'bundleVersion': this.getApplicationVersion(),
            'sdkVersion': this.getSdkVersion(),
            'sdkVersionName': this.getSdkVersionName(),
            'platform': Platform[this.getPlatform()].toLowerCase(),
            'encrypted': !this.isDebuggable(),
            'configUrl': this.getConfigUrl(),
            'webviewUrl': this.getWebviewUrl(),
            'webviewHash': this.getWebviewHash(),
            'webviewVersion': this.getWebviewVersion(),
            'initTimestamp': this.getInitTimestamp(),
            'reinitialized': this.isReinitialized()
        };
    }
}
