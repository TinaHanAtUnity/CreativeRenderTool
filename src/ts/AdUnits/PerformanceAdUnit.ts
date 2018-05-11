import { NativeBridge } from 'Native/NativeBridge';
import { IVideoAdUnitParameters, VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { CampaignAssetInfo } from 'Utilities/CampaignAssetInfo';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';

export interface IPerformanceAdUnitParameters extends IVideoAdUnitParameters<PerformanceCampaign> {
    endScreen: PerformanceEndScreen;
    adUnitStyle?: AdUnitStyle;
    privacy: AbstractPrivacy;
}

export class PerformanceAdUnit extends VideoAdUnit<PerformanceCampaign> {

    private _endScreen: PerformanceEndScreen;
    private _privacy: AbstractPrivacy;

    constructor(nativeBridge: NativeBridge, parameters: IPerformanceAdUnitParameters) {
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
        if (this._privacy) {
            this._privacy.hide();
            this._privacy.container().parentElement!.removeChild(this._privacy.container());
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
        delete this._privacy;
    }
}
