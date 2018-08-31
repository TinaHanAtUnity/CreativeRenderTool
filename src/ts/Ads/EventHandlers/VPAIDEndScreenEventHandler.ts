import { IVPAIDEndScreenHandler } from 'Ads/Views/VPAIDEndScreen';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'Ads/AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'Ads/Models/VPAID/VPAIDCampaign';

export class VPAIDEndScreenEventHandler implements IVPAIDEndScreenHandler {
    private _adUnit: VPAIDAdUnit;
    private _vpaidCampaign: VPAIDCampaign;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
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
