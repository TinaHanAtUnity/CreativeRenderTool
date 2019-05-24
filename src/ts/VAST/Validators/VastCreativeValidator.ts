import { VastCreative } from 'VAST/Models/VastCreative';
import { Url } from 'Core/Utilities/Url';
import { IValidator } from 'VAST/Validators/IValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

export class VastCreativeValidator implements IValidator {

    private _errors: CampaignError[] = [];

    constructor(creative: VastCreative) {
        this.validate(creative);
    }

    public getErrors(): CampaignError[] {
        return this._errors;
    }

    private validate(creative: VastCreative) {
        const trackingEvents = creative.getTrackingEvents();
        Object.keys(trackingEvents).map((key) => {
            trackingEvents[key].map((url) => {
                if (!Url.isValidProtocol(url)) {
                    // Error level LOW
                    this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('creative trackingEvents', url).message, CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, url));
                }
            });
        });
    }

}
