import { Platform } from 'Constants/Platform';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Model, ISchema } from 'Models/Model';

interface IClientInfo extends ISchema {
    gameId: [string, string[]];
    testMode: [boolean, string[]];
    applicationName: [string, string[]];
    applicationVersion: [string, string[]];
    sdkVersion: [number, string[]];
    sdkVersionName: [string, string[]];
    platform: [Platform, string[]];
    debuggable: [boolean, string[]];
    configUrl: [string, string[]];
    webviewUrl: [string, string[]];
    webviewHash: [string, string[]];
    webviewVersion: [string, string[]];
    initTimestamp: [number, string[]];
    reinitialized: [boolean, string[]];
}

export class ClientInfo extends Model<IClientInfo> {

    constructor(platform: Platform, data: any[]) {
        super({
            gameId: ['', ['string']],
            testMode: [false, ['boolean']],
            applicationName: ['', ['string']],
            applicationVersion: ['', ['string']],
            sdkVersion: [0, ['number']],
            sdkVersionName: ['', ['string']],
            platform: [Platform.TEST, ['object']],
            debuggable: [false, ['boolean']],
            configUrl: ['', ['string']],
            webviewUrl: ['', ['string']],
            webviewHash: ['', ['string']],
            webviewVersion: ['', ['string']],
            initTimestamp: [0, ['number']],
            reinitialized: [false, ['boolean']],
        });

        this.set('platform', platform);

        const gameIdString = data.shift();
        if(typeof gameIdString === 'string' && /^\d+$/.test(gameIdString)) {
            this.set('gameId', gameIdString);
        } else {
            throw new Error(UnityAdsError[UnityAdsError.INVALID_ARGUMENT]);
        }

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

    public getWebviewHash(): string {
        return this.get('webviewHash');
    }

    public getWebviewVersion(): string {
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
