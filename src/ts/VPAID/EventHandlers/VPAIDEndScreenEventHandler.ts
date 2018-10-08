import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { IVPAIDEndScreenHandler } from 'VPAID/Views/VPAIDEndScreen';

export class VPAIDEndScreenEventHandler implements IVPAIDEndScreenHandler {
    private _adUnit: VPAIDAdUnit;
    private _vpaidCampaign: VPAIDCampaign;

    constructor(adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
        this._adUnit = adUnit;
        this._vpaidCampaign = parameters.campaign;
    }

    public onVPAIDEndScreenClick(): void {
        const url = this.getCompanionClickThroughURL() || this.getClickThroughURL();
        this._adUnit.openUrl(url);
    }

    public onVPAIDEndScreenClose(): void {
        this._adUnit.hide();
    }

    public onVPAIDEndScreenShow(): void {
        // EMPTY?
    }

    private getCompanionClickThroughURL(): string | null {
        return this._vpaidCampaign.getCompanionClickThroughURL();
    }

    private getClickThroughURL(): string | null {
        return this._vpaidCampaign.getVideoClickThroughURL();
    }
}
