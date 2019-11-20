import { GDPREventAction, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { IPermissions, isUnityConsentPermissions, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export interface IPrivacyEventHandlerParameters {
    platform: Platform;
    core: ICoreApi;
    privacyManager: UserPrivacyManager;
    adsConfig: AdsConfiguration;
    privacySDK: PrivacySDK;
}

export class PrivacyEventHandler implements IPrivacyHandler {

    private _platform: Platform;
    private _core: ICoreApi;
    private _privacyManager: UserPrivacyManager;
    private _configuration: AdsConfiguration;
    private _privacy: PrivacySDK;

    constructor(parameters: IPrivacyEventHandlerParameters) {
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._privacyManager = parameters.privacyManager;
        this._configuration = parameters.adsConfig;
        this._privacy = parameters.privacySDK;
    }

    public onPrivacy(url: string): void {
        if (this._platform === Platform.IOS) {
            this._core.iOS!.UrlScheme.open(url);
        } else if (this._platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    public onPrivacyClose(): void {
        //
    }

    public onGDPROptOut(optOutEnabled: boolean): void {
        let permissions = UserPrivacy.PERM_ALL_FALSE;
        if (!optOutEnabled) {
            // TODO, we could consider creating a separate view for DEVELOPER_CONSENT which does not include controls
            if (this._privacy.getGamePrivacy().getMethod() === PrivacyMethod.DEVELOPER_CONSENT) {
                permissions = UserPrivacy.PERM_DEVELOPER_CONSENTED;
            } else {
                permissions = UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST;
            }
        }
        this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.BANNER_PERMISSIONS);
    }

    public onPersonalizedConsent(permissions: IPermissions): void {
        const gamePrivacy = this._privacy.getGamePrivacy();
        if (gamePrivacy.getMethod() === PrivacyMethod.UNITY_CONSENT && isUnityConsentPermissions(permissions)) {
            this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.PERSONALIZED_PERMISSIONS, ConsentPage.MY_CHOICES);
        }
    }
}
