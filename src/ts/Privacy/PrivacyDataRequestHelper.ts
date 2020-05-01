import { INativeResponse } from 'Core/Managers/RequestManager';
import { RequestError } from 'Core/Errors/RequestError';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { CaptchaEvent, PrivacyMetrics} from 'Privacy/PrivacyMetrics';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';

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

    private static _core: ICore;
    private static _userPrivacyManager: UserPrivacyManager;
    private static _privacySDK: PrivacySDK;

    public static init(core: ICore, userPrivacyManager: UserPrivacyManager, privacySDK: PrivacySDK) {
        this._core = core;
        this._userPrivacyManager = userPrivacyManager;
        this._privacySDK = privacySDK;
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
            answer: selectedImage,
            abGroup: PrivacyDataRequestHelper._core.Config.getAbGroup(),
            legalFramework: PrivacyDataRequestHelper._userPrivacyManager.getLegalFramework(),
            agreedOverAgeLimit: PrivacyDataRequestHelper._userPrivacyManager.getAgeGateChoice(),
            agreedVersion: PrivacyDataRequestHelper._privacySDK.getGamePrivacy().getVersion(),
            coppa: PrivacyDataRequestHelper._core.Config.isCoppaCompliant(),
            layout: ''
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
        return PrivacyDataRequestHelper._core.RequestManager.post(url, data).then((response: INativeResponse) => {
            if (response.responseCode === 200) {
                if (url.includes('init')) {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_SCREEN_SHOW);
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
                    if (url.includes('init')) {
                        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_BLOCKED);
                    } else if (url.includes('verify')) {
                        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_FAIL_LIMIT);
                    }
                    return { status: DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS };
                } else {
                    if (url.includes('init')) {
                        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR_INIT_MISSING_DATA);
                    } else if (url.includes('verify')) {
                        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR_VERIFY_MISSING_DATA);
                    }
                    return { status: DataRequestResponseStatus.GENERIC_ERROR };
                }
            }
            if (url.includes('init')) {
                PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR_INIT);
            } else if (url.includes('verify')) {
                PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR_VERIFY);
            }
            return { status: DataRequestResponseStatus.GENERIC_ERROR };

        });
    }

    private static getRequestBody(): IDataRequestBody {
        return {
            idfa: PrivacyDataRequestHelper._core.DeviceInfo.getAdvertisingIdentifier(),
            gameID: PrivacyDataRequestHelper._core.ClientInfo.getGameId(),
            bundleID: PrivacyDataRequestHelper._core.ClientInfo.getApplicationName(),
            projectID: PrivacyDataRequestHelper._core.Config.getUnityProjectId(),
            platform: Platform[PrivacyDataRequestHelper._core.NativeBridge.getPlatform()].toLowerCase(),
            language: PrivacyDataRequestHelper._core.DeviceInfo.getLanguage(),
            country: PrivacyDataRequestHelper._core.Config.getCountry(),
            subdivision: PrivacyDataRequestHelper._core.Config.getSubdivision(),
            token: PrivacyDataRequestHelper._core.Config.getToken()
        };
    }
}
