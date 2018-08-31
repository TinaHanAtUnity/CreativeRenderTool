import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';
import { NativeBridge } from 'Common/Native/NativeBridge';

export type ClientInfoData = [number, boolean, string, string, string, string, boolean, string, string, string];

export class SdkApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Sdk', ApiPackage.CORE);
    }

    public loadComplete(): Promise<ClientInfoData> {
        return this._nativeBridge.invoke<ClientInfoData>(this._fullApiClassName, 'loadComplete');
    }

    public initComplete(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'initComplete');
    }

    public setDebugMode(debugMode: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setDebugMode', [debugMode]);
    }

    public getDebugMode(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getDebugMode');
    }

    public logError(message: string) {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'logError', [message]);
    }

    public logWarning(message: string) {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'logWarning', [message]);
    }

    public logInfo(message: string) {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'logInfo', [message]);
    }

    public logDebug(message: string) {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'logDebug', [message]);
    }

    public reinitialize(): void {
        this._nativeBridge.invoke<void>(this._fullApiClassName, 'reinitialize');
    }
}
