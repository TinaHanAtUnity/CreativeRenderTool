import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';

export class TestAdUnit extends AbstractAdUnit {

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: Campaign) {
        super(nativeBridge, container, placement, campaign);
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
