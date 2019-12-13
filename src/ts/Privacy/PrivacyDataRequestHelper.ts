import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { RequestError } from 'Core/Errors/RequestError';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { CaptchaEvent, PrivacyMetrics} from 'Privacy/PrivacyMetrics';

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
    country: string;
    subdivision: string;
    token: string;
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
    private static _country: string;
    private static _subdivision: string;
    private static _token: string;

    public static init(core: ICore) {
        this._request = core.RequestManager;
        this._platform = core.NativeBridge.getPlatform();
        this._idfa = core.DeviceInfo.getAdvertisingIdentifier();
        this._gameID = core.ClientInfo.getGameId();
        this._bundleID = core.ClientInfo.getApplicationName();
        this._projectID = core.Config.getUnityProjectId();
        this._language = core.DeviceInfo.getLanguage();
        this._country = core.Config.getCountry();
        this._subdivision = core.Config.getSubdivision();
        this._token = core.Config.getToken();
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
                if (url.includes('init')) {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_SCREEN_OPEN);
                } else if (url.includes('verify')) {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_PASS);
                }

                return { status: DataRequestResponseStatus.SUCCESS, imageUrls: JSON.parse(response.response).imageURLs };
            } else {
                return { status: DataRequestResponseStatus.GENERIC_ERROR };
            }
        }).catch((error) => {
            if (error instanceof RequestError && error.nativeResponse) {
                if (error.nativeResponse.responseCode === 403) {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_FAIL);
                    return { status: DataRequestResponseStatus.FAILED_VERIFICATION };
                } else if (error.nativeResponse.responseCode === 429) {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_FAILED_MULTIPLE);
                    return { status: DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS };
                } else {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_MISSING_DATA);
                    return { status: DataRequestResponseStatus.GENERIC_ERROR };
                }
            }
            PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR);
            return { status: DataRequestResponseStatus.GENERIC_ERROR };

        });
    }

    private static getRequestBody(): IDataRequestBody {
        return {
            idfa: PrivacyDataRequestHelper._idfa,
            gameID: PrivacyDataRequestHelper._gameID,
            bundleID: PrivacyDataRequestHelper._bundleID,
            projectID: PrivacyDataRequestHelper._projectID,
            platform: Platform[PrivacyDataRequestHelper._platform].toLowerCase(),
            language: PrivacyDataRequestHelper._language,
            country: PrivacyDataRequestHelper._country,
            subdivision: PrivacyDataRequestHelper._subdivision,
            token: PrivacyDataRequestHelper._token
        };
    }
}
