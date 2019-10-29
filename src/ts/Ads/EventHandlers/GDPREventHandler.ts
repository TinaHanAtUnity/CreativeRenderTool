import { GDPREventAction, GDPREventSource, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { PrivacyMethod } from 'Privacy/Privacy';
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
            this._privacySDK.setOptOutRecorded(true);
            // todo: add age gate choice
            this._privacyManager.updateUserPrivacy({ads: true, external: false, gameExp: false}, GDPREventSource.USER_INDIRECT, GDPREventAction.SKIP);
        }
    }
}
