import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Session } from 'Models/Session';

export class TestAdUnit extends AbstractAdUnit {

    constructor(nativeBridge: NativeBridge, session: Session, container: AdUnitContainer, placement: Placement, campaign: Campaign) {
        super(nativeBridge, session, ForceOrientation.NONE, container, placement, campaign);
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

    public isCached(): boolean {
        return false;
    }
}
