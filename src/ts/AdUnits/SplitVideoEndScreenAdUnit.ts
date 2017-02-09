import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { SplitVideoEndScreen } from 'Views/SplitVideoEndScreen';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Placement } from 'Models/Placement';
import { Overlay } from 'Views/Overlay';

export class SplitVideoEndScreenAdUnit extends VideoAdUnit {

    private _endScreen: SplitVideoEndScreen | undefined;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: PerformanceCampaign, overlay: Overlay, options: any, endScreen: SplitVideoEndScreen) {
        super(nativeBridge, container, placement, campaign, campaign.getVideo().isCached() ? campaign.getVideo() : campaign.getStreamingVideo(), overlay, options);

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
        return 'performanceSplitVideoEndScreen';
    }

    public getEndScreen(): SplitVideoEndScreen | undefined {
        return this._endScreen;
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
    }

}
