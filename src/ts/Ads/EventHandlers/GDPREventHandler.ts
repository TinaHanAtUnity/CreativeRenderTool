import { GDPREventAction, GdprManager } from 'Ads/Managers/GdprManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';

export interface IGDPREventHandler {
    onGDPRPopupSkipped(): void;
}

export abstract class GDPREventHandler implements IGDPREventHandler {

    private _gdprManager: GdprManager;
    protected _coreConfig: CoreConfiguration;
    protected _adsConfig: AdsConfiguration;

    constructor(gdprManager: GdprManager, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration) {
        this._gdprManager = gdprManager;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
    }

    public onGDPRPopupSkipped(): void {
        if (!this._adsConfig.isOptOutRecorded()) {
            this._adsConfig.setOptOutRecorded(true);
            this._gdprManager.sendGDPREvent(GDPREventAction.SKIP);
        }
    }
}
