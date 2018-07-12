import { NativeBridge } from 'Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Native/NativeApi';

export type ClientInfoData = [number, boolean, string, string, string, string, boolean, string, string, string];

export class SdkApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Sdk', ApiPackage.CORE);
    }

    public loadComplete(): Promise<ClientInfoData> {
        return this._nativeBridge.invoke<ClientInfoData>(this.getFullApiClassName(), 'loadComplete');
    }

    public initComplete(): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'initComplete');
    }

    public setDebugMode(debugMode: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setDebugMode', [debugMode]);
    }

    public getDebugMode(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getDebugMode');
    }

    public logError(message: string) {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'logError', [message]);
    }

    public logWarning(message: string) {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'logWarning', [message]);
    }

    public logInfo(message: string) {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'logInfo', [message]);
    }

    public logDebug(message: string) {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'logDebug', [message]);
    }

    public setShowTimeout(timeout: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setShowTimeout', [timeout]);
    }

    public reinitialize(): void {
        this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'reinitialize');
    }

}
