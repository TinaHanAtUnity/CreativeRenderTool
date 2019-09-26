import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';

export class VastVideoOverlay extends VideoOverlay implements IPrivacyHandlerView {

    private _seatId: number | undefined;
    private _hasEndcard: boolean;

    constructor(parameters: IVideoOverlayParameters<VastCampaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean) {
        super(parameters, privacy, showGDPRBanner, true);

        this._seatId = parameters.campaign.getSeatId();
        this._hasEndcard = parameters.campaign.hasStaticEndscreen();
    }

    protected cleanUpPrivacy() {
        // Only delete if control of privacy doesn't need to be transferred to endscreen
        if (!this._hasEndcard && this._privacy) {
            this._privacy.hide();
            document.body.removeChild(this._privacy.container());
            delete this._privacy;
        }
    }

    protected onPrivacyEvent(event: Event) {
        super.onPrivacyEvent(event);

        const popup = <HTMLElement>document.querySelector('.pop-up');
        const rect = popup.getBoundingClientRect();
        const x = rect.left;
        const y = rect.top;
        const width = rect.width;
        const height = rect.height;
        const omRect = OpenMeasurementUtilities.createRectangle(x, y, width, height);

        this._handlers.forEach(handler => handler.onShowPrivacyPopUp(x, y, width, height));
    }

    public onPrivacyClose(): void {
        super.onPrivacyClose();
        this._handlers.forEach(handler => handler.onClosePrivacyPopUp());
    }
}
