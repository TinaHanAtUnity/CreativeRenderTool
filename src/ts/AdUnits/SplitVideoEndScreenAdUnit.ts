import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { SplitVideoEndScreen } from 'Views/SplitVideoEndScreen';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Placement } from 'Models/Placement';

export class SplitVideoEndScreenAdUnit extends VideoAdUnit {

    private _splitVideoEndScreen: SplitVideoEndScreen | undefined;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: PerformanceCampaign, options: any, splitVideoEndScreen: SplitVideoEndScreen) {
        super(nativeBridge, container, placement, campaign, campaign.getVideo().isCached() ? campaign.getVideo() : campaign.getStreamingVideo(), splitVideoEndScreen.getOverlay(), options);

        this._splitVideoEndScreen = splitVideoEndScreen;
    }

    public hide(): Promise<void> {
        const endScreen = this.getSplitVideoEndScreen();
        if (endScreen) {
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
        }
        return super.hide();
    }

    public description(): string {
        return 'performanceSplitVideoEndScreen';
    }

    public getSplitVideoEndScreen(): SplitVideoEndScreen | undefined {
        return this._splitVideoEndScreen;
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._splitVideoEndScreen;
    }

}
