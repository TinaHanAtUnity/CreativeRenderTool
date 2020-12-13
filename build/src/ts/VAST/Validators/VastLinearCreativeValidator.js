import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Url } from 'Core/Utilities/Url';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
export class VastLinearCreativeValidator {
    constructor(linearCreative) {
        this._errors = [];
        this.validate(linearCreative);
    }
    getErrors() {
        return this._errors;
    }
    validate(linearCreative) {
        this._errors = this._errors.concat(new VastCreativeValidator(linearCreative).getErrors());
        this.validateDuration(linearCreative);
        this.validateVideoClickThroughURLTemplate(linearCreative);
        this.validateVideoClickTrackingURLTemplates(linearCreative);
        this.validateVideoCustomClickURLTemplates(linearCreative);
        // Currently we are not doing any validation on VastMediaFiles, but in the future if we want to this is where we would do that.
    }
    validateDuration(linearCreative) {
        if (linearCreative.getDuration() === -1) {
            // Error level HIGH
            this._errors.push(new CampaignError(VastErrorInfo.errorMap[VastErrorCode.DURATION_UNSUPPORTED], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.DURATION_UNSUPPORTED));
        }
    }
    validateVideoClickThroughURLTemplate(linearCreative) {
        const videoClickThroughURLTemplate = linearCreative.getVideoClickThroughURLTemplate();
        if (videoClickThroughURLTemplate && !Url.isValidProtocol(videoClickThroughURLTemplate)) {
            // Error level HIGH
            this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('linear creative videoClickThroughURLTemplate', videoClickThroughURLTemplate).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_NO_CLICKTHROUGH_URL, undefined, videoClickThroughURLTemplate));
        }
    }
    validateVideoClickTrackingURLTemplates(linearCreative) {
        const videoClickTrackingURLTemplates = linearCreative.getVideoClickTrackingURLTemplates();
        videoClickTrackingURLTemplates.map((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('linear creative videoClickTrackingURLTemplates', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, url));
            }
        });
    }
    validateVideoCustomClickURLTemplates(linearCreative) {
        const videoCustomClickURLTemplates = linearCreative.getVideoCustomClickURLTemplates();
        videoCustomClickURLTemplates.map((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('linear creative videoCustomClickURLTemplates', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, url));
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdExpbmVhckNyZWF0aXZlVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvVmFsaWRhdG9ycy9WYXN0TGluZWFyQ3JlYXRpdmVWYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDbEYsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXpDLE9BQU8sRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUM3RSxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQzNGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRTFFLE1BQU0sT0FBTywyQkFBMkI7SUFJcEMsWUFBWSxjQUFrQztRQUZ0QyxZQUFPLEdBQW9CLEVBQUUsQ0FBQztRQUdsQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFTyxRQUFRLENBQUMsY0FBa0M7UUFDL0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFDMUYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsc0NBQXNDLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUQsSUFBSSxD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