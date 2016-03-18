import { NativeBridge } from 'Native/NativeBridge';

export type ClientInfoData = [number, boolean, string, string, string, string, boolean, string, string, string];

export class SdkApi {

    private static ApiClass = 'Sdk';

    public static loadComplete(): Promise<ClientInfoData> {
        return NativeBridge.getInstance().invoke<ClientInfoData>(SdkApi.ApiClass, 'loadComplete');
    }

    public static initComplete(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(SdkApi.ApiClass, 'initComplete');
    }

    public static setDebugMode(debugMode: boolean): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(SdkApi.ApiClass, 'setDebugMode', [debugMode]);
    }

    public static getDebugMode(): Promise<boolean> {
        return NativeBridge.getInstance().invoke<boolean>(SdkApi.ApiClass, 'getDebugMode');
    }

    public static logError(message: string) {
        return NativeBridge.getInstance().invoke<void>(SdkApi.ApiClass, 'logError', [message]);
    }

    public static logWarning(message: string) {
        return NativeBridge.getInstance().invoke<void>(SdkApi.ApiClass, 'logWarning', [message]);
    }

    public static logInfo(message: string) {
        return NativeBridge.getInstance().invoke<void>(SdkApi.ApiClass, 'logInfo', [message]);
    }

    public static logDebug(message: string) {
        return NativeBridge.getInstance().invoke<void>(SdkApi.ApiClass, 'logDebug', [message]);
    }

    public static setShowTimeout(timeout: number): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(SdkApi.ApiClass, 'setShowTimeout', [timeout]);
    }

    public static reinitialize(): void {
        NativeBridge.getInstance().invoke<void>(SdkApi.ApiClass, 'reinitialize');
    }


}
