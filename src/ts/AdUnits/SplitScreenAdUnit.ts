import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { SplitScreen } from 'Views/SplitScreen';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Placement } from 'Models/Placement';

export class SplitScreenAdUnit extends VideoAdUnit {

    private _splitScreen: SplitScreen | undefined;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: PerformanceCampaign, options: any, splitScreen: SplitScreen) {
        super(nativeBridge, container, placement, campaign, campaign.getVideo().isCached() ? campaign.getVideo() : campaign.getStreamingVideo(), splitScreen.getOverlay(), options);

        this._splitScreen = splitScreen;
    }

    public show(): Promise<void> {
        this.setShowing(true);
        this.onStart.trigger();
        this.getVideo().setActive(true);

        this._onShowObserver = this._container.onShow.subscribe(() => this.onShow());
        this._onSystemKillObserver = this._container.onSystemKill.subscribe(() => this.onSystemKill());
        this._onSystemInterruptObserver = this._container.onSystemInterrupt.subscribe(() => this.onSystemInterrupt());

        return this._container.open(this, true, true, ForceOrientation.PORTRAIT, this._placement.disableBackButton(), this._options);
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
        return 'performanceSplitScreen';
    }

    public getSplitVideoEndScreen(): SplitScreen | undefined {
        return this._splitScreen;
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._splitScreen;
    }

}
