import { SdkApi } from 'Common/Native/Api/Sdk';

// mock of SDK API to ignore native logging calls in tests
export class FakeSdkApi extends SdkApi {
    public logError(message: string) {
        return Promise.resolve();
    }

    public logWarning(message: string) {
        return Promise.resolve();
    }

    public logInfo(message: string) {
        return Promise.resolve();
    }

    public logDebug(message: string) {
        return Promise.resolve();
    }
}
