import {GDPREventAction, GDPREventSource, UserPrivacyManager} from 'Ads/Managers/UserPrivacyManager';
import {AdsConfiguration} from 'Ads/Models/AdsConfiguration';
import {IPrivacyHandler} from 'Ads/Views/AbstractPrivacy';
import {Platform} from 'Core/Constants/Platform';
import {ICoreApi} from 'Core/ICore';
import {IPermissions, isUnityConsentPermissions, PrivacyMethod} from 'Privacy/Privacy';
import {PrivacySDK} from 'Privacy/PrivacySDK';
import {ConsentPage} from 'Ads/Views/Consent/Consent';

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
        if (this._privacy.isOptOutRecorded()) {
            if (optOutEnabled !== this._privacy.isOptOutEnabled()) {
                this._privacy.setOptOutEnabled(optOutEnabled);
                if (optOutEnabled) {
                    // optout needs to send the source because we need to tell if it came from consent metadata or gdpr banner
                    // todo: add age gate choice
                    this._privacyManager.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.USER);
                } else {
                    this._privacyManager.sendGDPREvent(GDPREventAction.OPTIN);
                }
            }
        } else {
            this._privacy.setOptOutRecorded(true);
            this._privacy.setOptOutEnabled(optOutEnabled);

            // if default choice was not changed and no previous answer has been recorded, we must treat this event
            // as skip because user has not pressed any button and opening the privacy dialog might have been just a misclick
            if (optOutEnabled) {
                // optout needs to send the source because we need to tell if it came from consent metadata or gdpr banner
                this._privacyManager.sendGDPREvent(GDPREventAction.OPTOUT, GDPREventSource.USER);
            } else {
                this._privacyManager.sendGDPREvent(GDPREventAction.SKIP);
            }
        }
        const gamePrivacy = this._privacy.getGamePrivacy();
        const userPrivacy = this._privacy.getUserPrivacy();

        if (userPrivacy) {
            userPrivacy.update({
                method: gamePrivacy.getMethod(),
                version: 0,
                agreedAll: false,
                permissions: {
                    ads: !optOutEnabled,
                    external: gamePrivacy.getMethod() === PrivacyMethod.DEVELOPER_CONSENT ? !optOutEnabled : false,
                    gameExp: false
                }
            });
        }
    }

    public onPersonalizedConsent(permissions: IPermissions): void {
        const gamePrivacy = this._privacy.getGamePrivacy();
        if (gamePrivacy.isEnabled() && isUnityConsentPermissions(permissions)) {
            this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER, GDPREventAction.TODO_MISSING_ACTION, ConsentPage.MY_CHOICES, false);
        }
    }
}
