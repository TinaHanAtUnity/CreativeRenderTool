import { NativeBridge, BatchInvocation } from 'NativeBridge';

export class ClientInfo {

    private _applicationVersion: string;
    private _sdkVersion: string;

    public fetch(nativeBridge: NativeBridge): Promise<any[]> {
        let batch: BatchInvocation = new BatchInvocation(nativeBridge);
        batch.queue('Client', 'getApplicationVersion').then(([applicationVersion]) => this._applicationVersion = applicationVersion);
        batch.queue('Sdk', 'getSdkVersion').then(([sdkVersion]) => this._sdkVersion = sdkVersion);
        return nativeBridge.invokeBatch(batch);
    }

    public getApplicationVersion(): string {
        return this._applicationVersion;
    }

    public getSdkVersion(): string {
        return this._sdkVersion;
    }

}
