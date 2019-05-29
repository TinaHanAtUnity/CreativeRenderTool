
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Url } from 'Core/Utilities/Url';
import { IValidator } from 'VAST/Validators/IValidator';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';

export class VastLinearCreativeValidator implements IValidator {

    private _errors: CampaignError[] = [];

    constructor(linearCreative: VastCreativeLinear) {
        this.validate(linearCreative);
    }

    public getErrors(): CampaignError[] {
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
            // Error level HIGH
            this._errors.push(new CampaignError(VastErrorInfo.errorMap[VastErrorCode.DURATION_UNSUPPORTED], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.DURATION_UNSUPPORTED));
        }
    }

    private validateVideoClickThroughURLTemplate(linearCreative: VastCreativeLinear) {
        const videoClickThroughURLTemplate = linearCreative.getVideoClickThroughURLTemplate();
        if (videoClickThroughURLTemplate && !Url.isValidProtocol(videoClickThroughURLTemplate)) {
            // Error level HIGH
            this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('linear creative videoClickThroughURLTemplate', videoClickThroughURLTemplate).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_NO_CLICKTHROUGH_URL, undefined, videoClickThroughURLTemplate));
        }
    }

    private validateVideoClickTrackingURLTemplates(linearCreative: VastCreativeLinear) {
        const videoClickTrackingURLTemplates = linearCreative.getVideoClickTrackingURLTemplates();
        videoClickTrackingURLTemplates.map((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('linear creative videoClickTrackingURLTemplates', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, url));
            }
        });
    }

    private validateVideoCustomClickURLTemplates(linearCreative: VastCreativeLinear) {
        const videoCustomClickURLTemplates = linearCreative.getVideoCustomClickURLTemplates();
        videoCustomClickURLTemplates.map((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('linear creative videoCustomClickURLTemplates', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, url));
            }
        });
    }
}
