import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { EndScreen } from 'Views/EndScreen';
import { AdUnitContainer } from 'AdUnits/AdUnitContainer';
import { AbstractVideoOverlay } from 'Views/AbstractVideoOverlay';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Placement } from 'Models/Placement';

export class PerformanceAdUnit extends VideoAdUnit {

    private _endScreen: EndScreen | undefined;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: PerformanceCampaign, overlay: AbstractVideoOverlay, options: any, endScreen: EndScreen) {
        super(nativeBridge, container, placement, campaign, overlay, options);

        this._endScreen = endScreen;
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
        }
        this.unsetReferences();
        return super.hide();
    }

    public description(): string {
        return 'performance';
    }

    public getEndScreen(): EndScreen | undefined {
        return this._endScreen;
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
    }

}
