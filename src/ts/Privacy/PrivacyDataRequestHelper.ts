import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { RequestError } from 'Core/Errors/RequestError';

export enum DataRequestResponseStatus {
    SUCCESS,
    FAILED_VERIFICATION,
    MULTIPLE_FAILED_VERIFICATIONS,
    GENERIC_ERROR
}

export interface IDataRequestResponse {
    status: DataRequestResponseStatus;
    imageUrls?: string[];
}

export class PrivacyDataRequestHelper {

    private static BaseUrl: string = 'https://us-central1-ads-debot.cloudfunctions.net/debot/';

    private static Request: RequestManager;
    private static AdvertisingIdentifier: string | undefined | null;

    public static setRequest(request: RequestManager) {
        PrivacyDataRequestHelper.Request = request;
    }

    public static setAdvertisingIdentifier(idfa: string | undefined | null): void {
        PrivacyDataRequestHelper.AdvertisingIdentifier = idfa;
    }

    public static sendInitRequest(email: string): Promise<IDataRequestResponse> {
        const url = PrivacyDataRequestHelper.BaseUrl + 'init';
        return PrivacyDataRequestHelper.sendRequest(
            url, JSON.stringify({ idfa: PrivacyDataRequestHelper.AdvertisingIdentifier, email: email}));
    }

    public static sendVerifyRequest(email: string, selectedImage: string): Promise<IDataRequestResponse> {
        const url = PrivacyDataRequestHelper.BaseUrl + 'verify';
        return PrivacyDataRequestHelper.sendRequest(
            url, JSON.stringify({ idfa: PrivacyDataRequestHelper.AdvertisingIdentifier, email: email, answer: selectedImage }));
    }

    public static sendDebugResetRequest(): Promise<IDataRequestResponse> {
        const url = PrivacyDataRequestHelper.BaseUrl + 'debug_reset';
        return PrivacyDataRequestHelper.sendRequest(
            url, JSON.stringify({}));
    }

    private static sendRequest(url: string, data: string): Promise<IDataRequestResponse> {
        return PrivacyDataRequestHelper.Request.post(url, data).then((response: INativeResponse) => {
            if (response.responseCode === 200) {
                return { status: DataRequestResponseStatus.SUCCESS, imageUrls: JSON.parse(response.response).imageURLs };
            } else {
                return { status: DataRequestResponseStatus.GENERIC_ERROR };
            }
        }).catch((error) => {
            if (error instanceof RequestError && error.nativeResponse) {
                if (error.nativeResponse.responseCode === 403) {
                    return { status: DataRequestResponseStatus.FAILED_VERIFICATION };
                } else if (error.nativeResponse.responseCode === 409) {
                    return { status: DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS };
                } else {
                    return { status: DataRequestResponseStatus.GENERIC_ERROR };
                }
            }
            return { status: DataRequestResponseStatus.GENERIC_ERROR };

        });
    }
}
