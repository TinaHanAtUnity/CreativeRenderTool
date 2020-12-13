import { RequestError } from 'Core/Errors/RequestError';
import { Platform } from 'Core/Constants/Platform';
import { CaptchaEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
export var DataRequestResponseStatus;
(function (DataRequestResponseStatus) {
    DataRequestResponseStatus[DataRequestResponseStatus["SUCCESS"] = 0] = "SUCCESS";
    DataRequestResponseStatus[DataRequestResponseStatus["FAILED_VERIFICATION"] = 1] = "FAILED_VERIFICATION";
    DataRequestResponseStatus[DataRequestResponseStatus["MULTIPLE_FAILED_VERIFICATIONS"] = 2] = "MULTIPLE_FAILED_VERIFICATIONS";
    DataRequestResponseStatus[DataRequestResponseStatus["GENERIC_ERROR"] = 3] = "GENERIC_ERROR";
})(DataRequestResponseStatus || (DataRequestResponseStatus = {}));
export class PrivacyDataRequestHelper {
    static init(core, userPrivacyManager, privacySDK) {
        this._core = core;
        this._userPrivacyManager = userPrivacyManager;
        this._privacySDK = privacySDK;
    }
    static sendInitRequest(email) {
        const body = Object.assign({}, this.getRequestBody(), { email: email });
        const url = PrivacyDataRequestHelper.BaseUrl + 'init';
        return PrivacyDataRequestHelper.sendRequest(url, JSON.stringify(body));
    }
    static sendVerifyRequest(email, selectedImage) {
        const body = Object.assign({}, this.getRequestBody(), { email: email, answer: selectedImage, abGroup: PrivacyDataRequestHelper._core.Config.getAbGroup(), legalFramework: PrivacyDataRequestHelper._userPrivacyManager.getLegalFramework(), agreedOverAgeLimit: PrivacyDataRequestHelper._userPrivacyManager.getAgeGateChoice(), agreedVersion: PrivacyDataRequestHelper._privacySDK.getGamePrivacy().getVersion(), coppa: PrivacyDataRequestHelper._core.Config.isCoppaCompliant(), layout: '' });
        const url = PrivacyDataRequestHelper.BaseUrl + 'verify';
        return PrivacyDataRequestHelper.sendRequest(url, JSON.stringify(body));
    }
    static sendDebugResetRequest() {
        const url = PrivacyDataRequestHelper.BaseUrl + 'debug_reset';
        return PrivacyDataRequestHelper.sendRequest(url, JSON.stringify({}));
    }
    static sendRequest(url, data) {
        return PrivacyDataRequestHelper._core.RequestManager.post(url, data).then((response) => {
            if (response.responseCode === 200) {
                if (url.includes('init')) {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_SCREEN_SHOW);
                }
                else if (url.includes('verify')) {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_PASS);
                }
                return { status: DataRequestResponseStatus.SUCCESS, imageUrls: JSON.parse(response.response).imageURLs };
            }
            else {
                return { status: DataRequestResponseStatus.GENERIC_ERROR };
            }
        }).catch((error) => {
            if (error instanceof RequestError && error.nativeResponse) {
                if (error.nativeResponse.responseCode === 403) {
                    PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_FAIL);
                    return { status: DataRequestResponseStatus.FAILED_VERIFICATION };
                }
                else if (error.nativeResponse.responseCode === 429) {
                    if (url.includes('init')) {
                        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_BLOCKED);
                    }
                    else if (url.includes('verify')) {
                        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_FAIL_LIMIT);
                    }
                    return { status: DataRequestResponseStatus.MULTIPLE_FAILED_VERIFICATIONS };
                }
                else {
                    if (url.includes('init')) {
                        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR_INIT_MISSING_DATA);
                    }
                    else if (url.includes('verify')) {
                        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR_VERIFY_MISSING_DATA);
                    }
                    return { status: DataRequestResponseStatus.GENERIC_ERROR };
                }
            }
            if (url.includes('init')) {
                PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR_INIT);
            }
            else if (url.includes('verify')) {
                PrivacyMetrics.trigger(CaptchaEvent.REQUEST_CAPTCHA_ERROR_VERIFY);
            }
            return { status: DataRequestResponseStatus.GENERIC_ERROR };
        });
    }
    static getRequestBody() {
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
PrivacyDataRequestHelper.BaseUrl = 'https://us-central1-unity-ads-debot-prd.cloudfunctions.net/debot/';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeURhdGFSZXF1ZXN0SGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RzL1ByaXZhY3kvUHJpdmFjeURhdGFSZXF1ZXN0SGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUl0RSxNQUFNLENBQU4sSUFBWSx5QkFLWDtBQUxELFdBQVkseUJBQXlCO0lBQ2pDLCtFQUFPLENBQUE7SUFDUCx1R0FBbUIsQ0FBQTtJQUNuQiwySEFBNkIsQ0FBQTtJQUM3QiwyRkFBYSxDQUFBO0FBQ2pCLENBQUMsRUFMVyx5QkFBeUIsS0FBekIseUJBQXlCLFFBS3BDO0FBbUJELE1BQU0sT0FBTyx3QkFBd0I7SUFRMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFXLEVBQUUsa0JBQXNDLEVBQUUsVUFBc0I7UUFDMUYsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO1FBQzlDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxNQUFNLENBQUMsZUFBZSxDQUFDLEtBQWE7UUFDdkMsTUFBTSxJQUFJLHFCQUNGLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFDekIsS0FBSyxFQUFFLEtBQUssR0FDZixDQUFDO1FBRUYsTUFBTSxHQUFHLEdBQUcsd0JBQXdCLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0RCxPQUFPLHdCQUF3QixDQUFDLFdBQVcsQ0FDdkMsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFD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