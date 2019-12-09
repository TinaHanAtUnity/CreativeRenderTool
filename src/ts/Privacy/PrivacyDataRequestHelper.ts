import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { RequestError } from 'Core/Errors/RequestError';
import { Platform } from 'Core/Constants/Platform';
import { ITrackingIdentifier } from 'Ads/Utilities/TrackingIdentifierFilter';

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

    private static BaseUrl: string = 'https://us-central1-unity-ads-debot-prd.cloudfunctions.net/debot/';

    private static _platform: Platform;
    private static _request: RequestManager;
    private static _trackingIdentifiers: ITrackingIdentifier;

    public static init(platform: Platform, request: RequestManager, trackingIdentifiers: ITrackingIdentifier) {
        this._platform = platform;
        this._request = request;
        this._trackingIdentifiers = trackingIdentifiers;
    }

    public static sendInitRequest(email: string): Promise<IDataRequestResponse> {
        const url = PrivacyDataRequestHelper.BaseUrl + 'init';
        return PrivacyDataRequestHelper.sendRequest(
            url, JSON.stringify({ idfa: PrivacyDataRequestHelper._trackingIdentifiers.advertisingTrackingId, email: email}));
    }

    public static sendVerifyRequest(email: string, selectedImage: string): Promise<IDataRequestResponse> {
        const url = PrivacyDataRequestHelper.BaseUrl + 'verify';
        return PrivacyDataRequestHelper.sendRequest(
            url, JSON.stringify({ idfa: PrivacyDataRequestHelper._trackingIdentifiers.advertisingTrackingId, email: email, answer: selectedImage }));
    }

    public static sendDebugResetRequest(): Promise<IDataRequestResponse> {
        const url = PrivacyDataRequestHelper.BaseUrl + 'debug_reset';
        return PrivacyDataRequestHelper.sendRequest(
            url, JSON.stringify({}));
    }

    private static sendRequest(url: string, data: string): Promise<IDataRequestResponse> {
        return PrivacyDataRequestHelper._request.post(url, data).then((response: INativeResponse) => {
            if (response.responseCode === 200) {
                return { status: DataRequestResponseStatus.SUCCESS, imageUrls: JSON.parse(response.response).imageURLs };
            } else {
                return { status: DataRequestResponseStatus.GENERIC_ERROR };
            }
        }).catch((error) => {
            if (error instanceof RequestError && error.nativeResponse) {
                if (error.nativeResponse.responseCode === 403) {
                    return { status: DataRequestResponseStatus.FAILED_VERIFICATION };
                } else if (error.nativeResponse.responseCode === 429) {
                    return { status: DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS };
                } else {
                    return { status: DataRequestResponseStatus.GENERIC_ERROR };
                }
            }
            return { status: DataRequestResponseStatus.GENERIC_ERROR };

        });
    }
}
