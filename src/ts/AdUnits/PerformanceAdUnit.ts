import { NativeBridge } from 'Native/NativeBridge';
import { IVideoAdUnitParameters, VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { EndScreen, IEndScreenHandler } from 'Views/EndScreen';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
// import { PerformanceOverlayEventHandlers } from 'EventHandlers/PerformanceOverlayEventHandlers';
import { IOverlayHandler } from 'Views/Overlay';

export interface IPerformanceAdUnitParameters<T extends IEndScreenHandler, T2 extends IOverlayHandler> extends IVideoAdUnitParameters {
    endScreen: EndScreen;
    endScreenEventHandler: { new(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, parameters: IAdUnitParameters): T; };
    overlayEventHandler: { new(nativeBridge: NativeBridge, adUnit: VideoAdUnit, parameters: IAdUnitParameters): T2; };
}

export class PerformanceAdUnit extends VideoAdUnit {

    private _endScreen: EndScreen | undefined;
    private _endScreenEventHandler: IEndScreenHandler;
    private _overlayEventHandler: IOverlayHandler;

    constructor(nativeBridge: NativeBridge, parameters: IPerformanceAdUnitParameters<IEndScreenHandler, IOverlayHandler>) {
        parameters.overlay.render();
        document.body.appendChild(parameters.overlay.container());

        parameters.endScreen.render();
        parameters.endScreen.hide();
        document.body.appendChild(parameters.endScreen.container());

        const campaign = <PerformanceCampaign>parameters.campaign;
        const landscapeVideo = campaign.getVideo();
        const landscapeVideoCached = landscapeVideo && landscapeVideo.isCached();
        const portraitVideo = campaign.getPortraitVideo();
        const portraitVideoCached = portraitVideo && portraitVideo.isCached();

        parameters.overlay.setSpinnerEnabled(!landscapeVideoCached && !portraitVideoCached);

        super(nativeBridge, parameters);
        this._endScreen = parameters.endScreen;

        this._endScreenEventHandler = new parameters.endScreenEventHandler(nativeBridge, this, parameters);
        this._endScreen.addHandler(this._endScreenEventHandler);

        if(!this.getPlacement().allowSkip()) {
            parameters.overlay.setSkipEnabled(false);
        } else {
            parameters.overlay.setSkipEnabled(true);
            parameters.overlay.setSkipDuration(this.getPlacement().allowSkipInSeconds());
        }

        this.onClose.subscribe(() => {
            this.hide();
        });

        this._overlayEventHandler = new parameters.overlayEventHandler(nativeBridge, this, parameters);
        parameters.overlay.addHandler(this._overlayEventHandler);
        // parameters.overlay.onSkip.subscribe((videoProgress) => OverlayEventHandlers.onSkip(nativeBridge, parameters.operativeEventManager, this));
        // parameters.overlay.onSkip.subscribe((videoProgress) => PerformanceOverlayEventHandlers.onSkip(this));
        // parameters.overlay.onMute.subscribe((muted) => OverlayEventHandlers.onMute(nativeBridge, muted));
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();

        if (endScreen) {
            endScreen.removeHandler(this._endScreenEventHandler);
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
        }
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
