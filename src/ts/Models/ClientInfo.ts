import { Platform } from 'Constants/Platform';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Optional, TypedModel, ISchema } from 'Models/TypedModel';

interface IClientInfo extends ISchema {
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
    webviewHash: string;
    webviewVersion: string;

    initTimestamp: number;
    reinitialized: boolean;

    foobar: Optional<string>;
}

export class ClientInfo extends TypedModel<IClientInfo> {

    constructor(platform: Platform, data: any[]) {
        super({
            gameId: '',
            testMode: false,
            applicationName: '',
            applicationVersion: '',
            sdkVersion: 0,
            sdkVersionName: '',
            platform: Platform.TEST,
            debuggable: false,
            configUrl: '',
            webviewUrl: '',
            webviewHash: '',
            webviewVersion: '',
            initTimestamp: 0,
            reinitialized: false,
            foobar: new Optional<string>()
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

        this.set('foobar', new Optional<string>());
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
            'gameId': this.get('gameId'),
            'testMode': this.get('testMode'),
            'bundleId': this.get('applicationName'),
            'bundleVersion': this.get('applicationVersion'),
            'sdkVersion': this.get('sdkVersion'),
            'sdkVersionName': this.get('sdkVersionName'),
            'platform': Platform[this.get('platform')].toLowerCase(),
            'encrypted': !this.get('debuggable'),
            'configUrl': this.get('configUrl'),
            'webviewUrl': this.get('webviewUrl'),
            'webviewHash': this.get('webviewHash'),
            'webviewVersion': this.get('webviewVersion'),
            'initTimestamp': this.get('initTimestamp'),
            'reinitialized': this.get('reinitialized')
        };
    }
}
