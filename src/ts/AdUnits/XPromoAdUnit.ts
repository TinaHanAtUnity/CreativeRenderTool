import { NativeBridge } from 'Native/NativeBridge';
import { IVideoAdUnitParameters, VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { XPromoEndScreen } from 'Views/XPromoEndScreen';

export interface IXPromoAdUnitParameters extends IVideoAdUnitParameters<XPromoCampaign> {
    endScreen: XPromoEndScreen;
}

export class XPromoAdUnit extends VideoAdUnit<XPromoCampaign> {

    private _endScreen: XPromoEndScreen;

    constructor(nativeBridge: NativeBridge, parameters: IXPromoAdUnitParameters) {
        super(nativeBridge, parameters);

        const campaign = parameters.campaign;
        const landscapeVideo = campaign.getVideo();
        const landscapeVideoCached = landscapeVideo && landscapeVideo.isCached();
        const portraitVideo = campaign.getPortraitVideo();
        const portraitVideoCached = portraitVideo && portraitVideo.isCached();

        parameters.overlay.setSpinnerEnabled(!landscapeVideoCached && !portraitVideoCached);

        this._endScreen = parameters.endScreen;
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());
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
        return 'xpromo';
    }

    public getEndScreen(): XPromoEndScreen | undefined {
        return this._endScreen;
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
    }
}
