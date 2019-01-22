
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
        this.validateDuration(linearCreative);
        this.validateVideoClickThroughURLTemplate(linearCreative);
        this.validateVideoClickTrackingURLTemplates(linearCreative);
        this.validateVideoCustomClickURLTemplates(linearCreative);
        // Currently we are not doing any validation on VastMediaFiles, but in the future if we want to this is where we would do that.
    }

    private validateDuration(linearCreative: VastCreativeLinear) {
        if (linearCreative.getDuration() === -1) {
            this._errors.push(new Error('VAST linear creative is missing valid duration'));
        }
    }

    private validateVideoClickThroughURLTemplate(linearCreative: VastCreativeLinear) {
        const videoClickThroughURLTemplate = linearCreative.getVideoClickThroughURLTemplate();
        if (videoClickThroughURLTemplate && !Url.isValidProtocol(videoClickThroughURLTemplate)) {
            this._errors.push(VastValidationUtilities.invalidUrlError('linear creative videoClickThroughURLTemplate', videoClickThroughURLTemplate));
        }
    }

    private validateVideoClickTrackingURLTemplates(linearCreative: VastCreativeLinear) {
        const videoClickTrackingURLTemplates = linearCreative.getVideoClickTrackingURLTemplates();
        videoClickTrackingURLTemplates.map((url) => {
            if (!Url.isValidProtocol(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('linear creative videoClickTrackingURLTemplates', url));
            }
        });
    }

    private validateVideoCustomClickURLTemplates(linearCreative: VastCreativeLinear) {
        const videoCustomClickURLTemplates = linearCreative.getVideoCustomClickURLTemplates();
        videoCustomClickURLTemplates.map((url) => {
            if (!Url.isValidProtocol(url)) {
                this._errors.push(VastValidationUtilities.invalidUrlError('linear creative videoCustomClickURLTemplates', url));
            }
        });
    }
}
