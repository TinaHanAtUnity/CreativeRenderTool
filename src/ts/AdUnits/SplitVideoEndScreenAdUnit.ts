import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { SplitVideoEndScreen } from 'Views/SplitVideoEndScreen';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Placement } from 'Models/Placement';

export class SplitVideoEndScreenAdUnit extends VideoAdUnit {

    private _splitVideoEndScreen: SplitVideoEndScreen | undefined;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: PerformanceCampaign, options: any, splitVideoEndScreen: SplitVideoEndScreen) {
        super(nativeBridge, container, placement, campaign, campaign.getVideo().isCached() ? campaign.getVideo() : campaign.getStreamingVideo(), splitVideoEndScreen.getOverlay(), options);

        this._splitVideoEndScreen = splitVideoEndScreen;
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
