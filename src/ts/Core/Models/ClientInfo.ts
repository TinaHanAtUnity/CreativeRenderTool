import { Model } from 'Core/Models/Model';
import { ClientInfoData } from 'Core/Native/Sdk';

interface IClientInfo {
    gameId: string;
    testMode: boolean;
    applicationName: string;
    applicationVersion: string;
    sdkVersion: number;
    sdkVersionName: string;
    debuggable: boolean;
    configUrl: string;
    webviewUrl: string;
    webviewHash: string | null;
    webviewVersion: string | null;
    initTimestamp: number;
    reinitialized: boolean;
}

export class ClientInfo extends Model<IClientInfo> {

    constructor(data: ClientInfoData) {
        super('ClientInfo', {
            gameId: ['string'],
            testMode: ['boolean'],
            applicationName: ['string'],
            applicationVersion: ['string'],
            sdkVersion: ['number'],
            sdkVersionName: ['string'],
            debuggable: ['boolean'],
            configUrl: ['string'],
            webviewUrl: ['string'],
            webviewHash: ['string', 'null'],
            webviewVersion: ['string', 'null'],
            initTimestamp: ['number'],
            reinitialized: ['boolean']
        });

        this.set('gameId', data[0]);
        this.set('testMode', data[1]);
        this.set('applicationName', data[2]);
        this.set('applicationVersion', data[3]);
        this.set('sdkVersion', data[4]);
        this.set('sdkVersionName', data[5]);
        this.set('debuggable', data[6]);
        this.set('configUrl', data[7]);
        this.set('webviewUrl', data[8]);
        this.set('webviewHash', data[9]);
        this.set('webviewVersion', data[10]);
        this.set('initTimestamp', data[11]);
        this.set('reinitialized', data[12]);
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
