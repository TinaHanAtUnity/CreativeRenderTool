import { NativeBridge, BatchInvocation } from 'NativeBridge';

export class ClientInfo {

    private _gameId: string;
    private _testMode: boolean;

    private _applicationVersion: string;
    private _sdkVersion: string;

    constructor(gameId: string, testMode: boolean) {
        this._gameId = gameId;
        this._testMode = testMode;
    }

    public fetch(nativeBridge: NativeBridge): Promise<any[]> {
        let batch: BatchInvocation = new BatchInvocation(nativeBridge);
        batch.queue('Client', 'getApplicationVersion').then(([applicationVersion]) => this._applicationVersion = applicationVersion);
        batch.queue('Sdk', 'getSdkVersion').then(([sdkVersion]) => this._sdkVersion = sdkVersion);
        return nativeBridge.invokeBatch(batch);
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

}
