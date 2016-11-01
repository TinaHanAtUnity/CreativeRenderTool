import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export type ClientInfoData = [number, boolean, string, string, string, string, boolean, string, string, string];

export class SdkApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Sdk');
    }

    public loadComplete(): Promise<ClientInfoData> {
        return this._nativeBridge.invoke<ClientInfoData>(this._apiClass, 'loadComplete');
    }

    public initComplete(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'initComplete');
    }

    public setDebugMode(debugMode: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setDebugMode', [debugMode]);
    }

    public getDebugMode(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getDebugMode');
    }

    public logError(message: string) {
        return this._nativeBridge.invoke<void>(this._apiClass, 'logError', [message]);
    }

    public logWarning(message: string) {
        return this._nativeBridge.invoke<void>(this._apiClass, 'logWarning', [message]);
    }

    public logInfo(message: string) {
        return this._nativeBridge.invoke<void>(this._apiClass, 'logInfo', [message]);
    }

    public logDebug(message: string) {
        return this._nativeBridge.invoke<void>(this._apiClass, 'logDebug', [message]);
    }

    public setShowTimeout(timeout: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setShowTimeout', [timeout]);
    }

    public reinitialize(): void {
        this._nativeBridge.invoke<void>(this._apiClass, 'reinitialize');
    }

}
