import { GDPREventAction, GDPREventSource, LegalFramework, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { UserPrivacy } from 'Privacy/Privacy';
import { PrivacySDK } from 'Privacy/PrivacySDK';

export interface IGDPREventHandler {
    onGDPRPopupSkipped(): void;
}

export abstract class GDPREventHandler implements IGDPREventHandler {

    private _privacyManager: UserPrivacyManager;
    private _privacySDK: PrivacySDK;
    protected _coreConfig: CoreConfiguration;
    protected _adsConfig: AdsConfiguration;

    constructor(privacyManager: UserPrivacyManager, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, privacy: PrivacySDK) {
        this._privacyManager = privacyManager;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._privacySDK = privacy;
    }

    public onGDPRPopupSkipped(): void {
        if (!this._privacySDK.isOptOutRecorded()) {
            // todo: add age gate choice
            const legalFramework = this._privacySDK.getLegalFramework();
            const permissions = legalFramework === LegalFramework.GDPR ? UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST_GDPR : UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST;
            this._privacyManager.updateUserPrivacy(permissions, GDPREventSource.USER_INDIRECT, GDPREventAction.SKIPPED_BANNER);
        }
    }
}
