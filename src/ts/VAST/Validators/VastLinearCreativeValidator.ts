
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Url } from 'Core/Utilities/Url';
import { IValidator } from 'VAST/Validators/IValidator';

export class VastLinearCreativeValidator implements IValidator {

    private _errors: Error[] = [];

    constructor(linearCreative: VastCreativeLinear) {
        this.validate(linearCreative);
    }

    public getErrors(): Error[] {
        return this._errors;
    }

    private validate(linearCreative: VastCreativeLinear) {
        this._errors = this._errors.concat(new VastCreativeValidator(linearCreative).getErrors());
        if (linearCreative.getDuration() === -1) {
            this._errors.push(new Error('VAST linear creative is missing valid duration'));
        }
        const videoClickThroughURLTemplate = linearCreative.getVideoClickThroughURLTemplate();
        if (videoClickThroughURLTemplate && !Url.isValid(videoClickThroughURLTemplate)) {
            this._errors.push(VastValidationUtilities.invalidUrlError('linear creative videoClickThroughURLTemplate', videoClickThroughURLTemplate));
        }
        const videoClickTrackingURLTemplates = linearCreative.getVideoClickTrackingURLTemplates();
        videoClickTrackingURLTemplates.map((url) => {
            if (!Url.isValid(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('linear creative videoClickTrackingURLTemplates', url));
            }
        });
        const videoCustomClickURLTemplates = linearCreative.getVideoCustomClickURLTemplates();
        videoCustomClickURLTemplates.map((url) => {
            if (!Url.isValid(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('linear creative videoCustomClickURLTemplates', url));
            }
        });
        // Currently we are not doing any validation on VastMediaFiles, but in the future if we want to this is where we would do that.
    }
}
