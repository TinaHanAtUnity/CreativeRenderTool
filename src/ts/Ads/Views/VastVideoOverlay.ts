import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { NewVideoOverlay, IVideoOverlayParameters } from 'Ads/Views/NewVideoOverlay';
import { VastCampaign } from 'VAST/Models/VastCampaign';

export class VastVideoOverlay extends NewVideoOverlay implements IPrivacyHandler {

    private _seatId: number | undefined;
    private _hasEndcard: boolean;

    constructor(parameters: IVideoOverlayParameters<VastCampaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean) {
        super(parameters, privacy, showGDPRBanner, true);

        this._seatId = parameters.campaign.getSeatId();
        this._hasEndcard = parameters.campaign.hasEndscreen();
    }

    public render(): void {
        super.render();
        this.choosePrivacyShown();
    }

    protected cleanUpPrivacy() {
        // Only delete if control of privacy doesn't need to be transferred to endscreen
        if (!this._hasEndcard && this._privacy) {
            this._privacy.hide();
            document.body.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }
}