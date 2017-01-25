import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { AdUnit } from 'Utilities/AdUnit';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';

export class TestAdUnit extends AbstractAdUnit {
    constructor(nativeBridge: NativeBridge, adUnit: AdUnit, placement: Placement, campaign: Campaign) {
        super(nativeBridge, adUnit, placement, campaign);
    }

    public show(): Promise<void> {
        return Promise.resolve();
    }

    public hide(): Promise<void> {
        return Promise.resolve();
    }

    public isShowing(): boolean {
        return false;
    }

    public description(): string {
        return 'test';
    }
}
