import { VastCreative } from 'VAST/Models/VastCreative';
import { Url } from 'Core/Utilities/Url';
import { IValidator } from 'VAST/Validators/IValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Warning } from 'Ads/Errors/Warning';

export class VastCreativeValidator implements IValidator {

    private _errors: Error[] = [];

    constructor(creative: VastCreative) {
        this.validate(creative);
    }

    public getErrors(): Error[] {
        return this._errors;
    }

    public getWarnings(): Warning[] {
        return [];
    }

    private validate(creative: VastCreative) {
        const trackingEvents = creative.getTrackingEvents();
        Object.keys(trackingEvents).map((key) => {
            trackingEvents[key].map((url) => {
                if (!Url.isValidProtocol(url)) {
                    this._errors.push(VastValidationUtilities.invalidUrlError('creative trackingEvents', url));
                }
            });
        });
    }

}
