import { NativeBridge } from 'Native/NativeBridge';
import { IVideoAdUnitParameters, VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';

export interface IPerformanceAdUnitParameters extends IVideoAdUnitParameters<PerformanceCampaign> {
    endScreen: PerformanceEndScreen;
}

export class PerformanceAdUnit extends VideoAdUnit<PerformanceCampaign> {

    private _endScreen: PerformanceEndScreen;

    constructor(nativeBridge: NativeBridge, parameters: IPerformanceAdUnitParameters) {
        parameters.endScreen.render();
        parameters.endScreen.hide();
        document.body.appendChild(parameters.endScreen.container());

        const campaign = parameters.campaign;
        const landscapeVideo = campaign.getVideo();
        const landscapeVideoCached = landscapeVideo && landscapeVideo.isCached();
        const portraitVideo = campaign.getPortraitVideo();
        const portraitVideoCached = portraitVideo && portraitVideo.isCached();

        super(nativeBridge, parameters);

        this._endScreen = parameters.endScreen;
        parameters.overlay.setSpinnerEnabled(!landscapeVideoCached && !portraitVideoCached);
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if(endScreen) {
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
        }

        return super.hide();
    }

    public description(): string {
        return 'performance';
    }

    public getEndScreen(): PerformanceEndScreen | undefined {
        return this._endScreen;
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
    }
}
