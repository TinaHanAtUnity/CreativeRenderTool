import { NativeBridge } from 'Native/NativeBridge';
import { IVideoAdUnitParameters, VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { XPromoEndScreen } from 'Views/XPromoEndScreen';
import { CampaignAssetInfo } from 'Utilities/CampaignAssetInfo';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';

export interface IXPromoAdUnitParameters extends IVideoAdUnitParameters<XPromoCampaign> {
    endScreen: XPromoEndScreen;
    privacy: AbstractPrivacy;
}

export class XPromoAdUnit extends VideoAdUnit<XPromoCampaign> {

    private _endScreen: XPromoEndScreen;
    private _privacy: AbstractPrivacy;

    constructor(nativeBridge: NativeBridge, parameters: IXPromoAdUnitParameters) {
        super(nativeBridge, parameters);

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

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
        delete this._privacy;
    }
}
