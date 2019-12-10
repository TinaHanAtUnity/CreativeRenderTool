import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { RequestError } from 'Core/Errors/RequestError';
import { Platform } from 'Core/Constants/Platform';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ICore } from 'Core/ICore';

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

interface IDataRequestBody {
    idfa: string | null | undefined;
    gameID: string;
    bundleID: string;
    projectID: string;
    platform: string;
    language: string;
}

export class PrivacyDataRequestHelper {

    private static BaseUrl: string = 'https://us-central1-unity-ads-debot-prd.cloudfunctions.net/debot/';

    private static _platform: Platform;
    private static _request: RequestManager;
    private static _idfa: string | null | undefined;
    private static _gameID: string;
    private static _bundleID: string;
    private static _projectID: string;
    private static _language: string;

    public static init(core: ICore) {
        this._request = core.RequestManager;
        this._platform = core.NativeBridge.getPlatform();
        this._idfa = this.getIdfa(core.NativeBridge.getPlatform(), core.DeviceInfo);
        this._gameID = core.ClientInfo.getGameId();
        this._bundleID = core.ClientInfo.getApplicationName();
        this._projectID = core.Config.getUnityProjectId();
        this._language = core.DeviceInfo.getLanguage();
    }

    public static sendInitRequest(email: string): Promise<IDataRequestResponse> {
        const body = {
            ... this.getRequestBody(),
            email: email
        };

        const url = PrivacyDataRequestHelper.BaseUrl + 'init';
        return PrivacyDataRequestHelper.sendRequest(
            url, JSON.stringify(body));
    }

    public static sendVerifyRequest(email: string, selectedImage: string): Promise<IDataRequestResponse> {
        const body = {
            ... this.getRequestBody(),
            email: email,
            answer: selectedImage
        };

        const url = PrivacyDataRequestHelper.BaseUrl + 'verify';
        return PrivacyDataRequestHelper.sendRequest(
            url, JSON.stringify(body));
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

    private static getIdfa(platform: Platform, deviceInfo: DeviceInfo): string | null | undefined {
        let idfa: string | null | undefined;

        if (!deviceInfo.getAdvertisingIdentifier()) {
            if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
                idfa = deviceInfo.getAndroidId();
            }
        } else {
            idfa = deviceInfo.getAdvertisingIdentifier();
        }
        return idfa;
    }

    private static getRequestBody(): IDataRequestBody {
        return {
            idfa: PrivacyDataRequestHelper._idfa,
            gameID: PrivacyDataRequestHelper._gameID,
            bundleID: PrivacyDataRequestHelper._bundleID,
            projectID: PrivacyDataRequestHelper._projectID,
            platform: Platform[PrivacyDataRequestHelper._platform].toLowerCase(),
            language: PrivacyDataRequestHelper._language
        };
    }
}
