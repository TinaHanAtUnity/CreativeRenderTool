import { SdkApi } from 'Core/Native/Sdk';

export class Logger {

    private static _sdk: SdkApi;

    public static setSdk(sdk: SdkApi) {
        this._sdk = sdk;
    }

    public static Error(message: string) {
        return Logger._sdk.logError(message);
    }

    public static Warning(message: string) {
        return Logger._sdk.logWarning(message);
    }

    public static Info(message: string) {
        return Logger._sdk.logInfo(message);
    }

    public static Debug(message: string) {
        return Logger._sdk.logDebug(message);
    }

}
