import { IVideoAdUnitParameters, VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';

export interface IXPromoAdUnitParameters extends IVideoAdUnitParameters<XPromoCampaign> {
    endScreen: XPromoEndScreen;
}

export class XPromoAdUnit extends VideoAdUnit<XPromoCampaign> {

    private _endScreen: XPromoEndScreen;
    private _privacy: AbstractPrivacy;

    constructor(parameters: IXPromoAdUnitParameters) {
        super(parameters);

        parameters.overlay.setSpinnerEnabled(!CampaignAssetInfo.isCached(parameters.campaign));

        this._endScreen = parameters.endScreen;
        this._endScreen.render();
        this._endScreen.hide();
        document.body.appendChild(this._endScreen.container());

        this._privacy = parameters.privacy;
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if(endScreen) {
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
        }

        this._privacy.hide();
        this._privacy.container().parentElement!.removeChild(this._privacy.container());

        return super.hide();
    }

    public description(): string {
        return 'xpromo';
    }

    public getEndScreen(): XPromoEndScreen | undefined {
        return this._endScreen;
    }

    public onVideoError(): void {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
        delete this._privacy;
    }
}
