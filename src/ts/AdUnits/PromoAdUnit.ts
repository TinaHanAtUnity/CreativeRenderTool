import { AbstractAdUnit } from "AdUnits/AbstractAdUnit";
import { NativeBridge } from "Native/NativeBridge";
import {AdUnitContainer, ForceOrientation} from "AdUnits/Containers/AdUnitContainer";
import { SessionManager } from "Managers/SessionManager";
import { Placement } from "Models/Placement";
import { Campaign } from "Models/Campaign";

export class PromoAdUnit extends AbstractAdUnit {
    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, sessionManager: SessionManager, placement: Placement, campaign: Campaign, options: any) {
        super(nativeBridge, container, placement, campaign);
    }
    public show(): Promise<void> {
        return this._container.open(this, false, false, ForceOrientation.NONE, true, true, {} );
    }

    public hide(): Promise<void> {
        return this._container.close();
    }

    public description(): string {
        return 'mraid';
    }
}
