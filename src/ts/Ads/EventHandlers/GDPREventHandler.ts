import { GDPREventAction, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import {PrivacyMethod} from '../Models/Privacy';

export interface IGDPREventHandler {
    onGDPRPopupSkipped(): void;
}

export abstract class GDPREventHandler implements IGDPREventHandler {

    private _privacyManager: UserPrivacyManager;
    protected _coreConfig: CoreConfiguration;
    protected _adsConfig: AdsConfiguration;

    constructor(privacyManager: UserPrivacyManager, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration) {
        this._privacyManager = privacyManager;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
    }

    public onGDPRPopupSkipped(): void {
        if (!this._adsConfig.isOptOutRecorded()) {
            this._adsConfig.setOptOutRecorded(true);
            this._privacyManager.sendGDPREvent(GDPREventAction.SKIP);
            const userPrivacy = this._adsConfig.getUserPrivacy();
            if (userPrivacy) {
                userPrivacy.update({
                    method: PrivacyMethod.LEGITIMATE_INTEREST,
                    version: 0,
                    permissions: {
                        all: false,
                        ads: true,
                        external: false,
                        gameExp: false}});
            }
        }
    }
}
