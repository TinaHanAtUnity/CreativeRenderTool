import { IValidator } from 'VAST/Validators/IValidator';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastLinearCreativeValidator } from 'VAST/Validators/VastLinearCreativeValidator';
import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Url } from 'Core/Utilities/Url';
import { VastCreativeCompanionAdValidator } from 'VAST/Validators/VastCreativeCompanionAdValidator';

export class VastAdValidator implements IValidator {

    private _errors: Error[] = [];

    constructor(vastAd: VastAd) {
        this.validate(vastAd);
    }

    public getErrors(): Error[] {
        return this._errors;
    }

    private validate(vastAd: VastAd) {
        vastAd.getCreatives().map((creative) => {
            if (creative instanceof VastCreativeLinear) {
                this._errors = this._errors.concat(new VastLinearCreativeValidator(creative).getErrors());
            } else {
                this._errors = this._errors.concat(new VastCreativeValidator(creative).getErrors());
            }
        });
        vastAd.getCompanionAds().map((companionAd) => {
            this._errors = this._errors.concat(new VastCreativeCompanionAdValidator(companionAd).getErrors());
        });
        vastAd.getErrorURLTemplates().map((url) => {
            if (!Url.isValid(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('VastAd errorURLTemplates', url));
            }
        });
        vastAd.getImpressionURLTemplates().map((url) => {
            if (!Url.isValid(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('VastAd impressionURLTemplates', url));
            }
        });
        vastAd.getWrapperURLs().map((url) => {
            if (!Url.isValid(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('VastAd wrapperURLs', url));
            }
        });
    }
}
