import { IValidator } from 'VAST/Validators/IValidator';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastLinearCreativeValidator } from 'VAST/Validators/VastLinearCreativeValidator';
import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Url } from 'Core/Utilities/Url';
import { VastCreativeStaticResourceCompanionAdValidator } from 'VAST/Validators/VastCreativeStaticResourceCompanionAdValidator';

export class VastAdValidator implements IValidator {

    private _errors: Error[] = [];

    constructor(vastAd: VastAd) {
        this.validate(vastAd);
    }

    public getErrors(): Error[] {
        return this._errors;
    }

    private validate(vastAd: VastAd) {
        this.validateCreatives(vastAd);
        this.validateCompanionAds(vastAd);
        this.validateErrorURLTemplates(vastAd);
        this.validateImpressionURLTemplates(vastAd);
        this.validateWrapperURLs(vastAd);
    }

    private validateCreatives(vastAd: VastAd) {
        vastAd.getCreatives().forEach((creative) => {
            if (creative instanceof VastCreativeLinear) {
                this._errors = this._errors.concat(new VastLinearCreativeValidator(creative).getErrors());
            } else {
                this._errors = this._errors.concat(new VastCreativeValidator(creative).getErrors());
            }
        });
    }

    private validateCompanionAds(vastAd: VastAd) {
        vastAd.getCompanionAds().forEach((companionAd) => {
            this._errors = this._errors.concat(new VastCreativeStaticResourceCompanionAdValidator(companionAd).getErrors());
        });
    }

    private validateErrorURLTemplates(vastAd: VastAd) {
        vastAd.getErrorURLTemplates().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('VastAd errorURLTemplates', url));
            }
        });
    }

    private validateImpressionURLTemplates(vastAd: VastAd) {
        vastAd.getImpressionURLTemplates().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('VastAd impressionURLTemplates', url));
            }
        });
    }

    private validateWrapperURLs(vastAd: VastAd) {
        vastAd.getWrapperURLs().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('VastAd wrapperURLs', url));
            }
        });
    }
}
