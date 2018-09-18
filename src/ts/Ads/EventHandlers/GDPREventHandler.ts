import { GDPREventAction, GdprManager } from 'Ads/Managers/GdprManager';
import { Configuration } from 'Core/Models/Configuration';

export interface IGDPREventHandler {
    onGDPRPopupSkipped(): void;
}

export abstract class GDPREventHandler implements IGDPREventHandler {

    private _gdprManager: GdprManager;
    protected _configuration: Configuration;

    constructor(gdprManager: GdprManager, configuration: Configuration) {
        this._gdprManager = gdprManager;
        this._configuration = configuration;
    }

    public onGDPRPopupSkipped(): void {
        if (!this._configuration.isOptOutRecorded()) {
            this._configuration.setOptOutRecorded(true);
            this._gdprManager.sendGDPREvent(GDPREventAction.SKIP);
        }
    }
}
