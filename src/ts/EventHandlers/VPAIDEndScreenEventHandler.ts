import { IVPAIDEndScreenHandler } from 'Views/VPAIDEndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { IVPAIDHandler } from 'Views/VPAID';
import { IOverlayHandler } from 'Views/Overlay';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';

export class VPAIDEndScreenEventHandler implements IVPAIDEndScreenHandler {
    private _adUnit: VPAIDAdUnit;
    private _vpaidCampaign: VPAIDCampaign;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters<IVPAIDEndScreenHandler, IVPAIDHandler, IOverlayHandler>) {
        this._adUnit = adUnit;
        this._vpaidCampaign = <VPAIDCampaign>parameters.campaign;
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
