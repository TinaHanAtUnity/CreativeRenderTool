import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastLinearCreativeValidator } from 'VAST/Validators/VastLinearCreativeValidator';
import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Url } from 'Core/Utilities/Url';
import { VastCompanionAdStaticResourceValidator } from 'VAST/Validators/VastCompanionAdStaticResourceValidator';
import { VastCompanionAdIframeResourceValidator } from 'VAST/Validators/VastCompanionAdIframeResourceValidator';
import { VastCompanionAdHTMLResourceValidator } from 'VAST/Validators/VastCompanionAdHTMLResourceValidator';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
export class VastAdValidator {
    constructor(vastAd) {
        this._errors = [];
        this.validate(vastAd);
    }
    getErrors() {
        return this._errors;
    }
    validate(vastAd) {
        this.validateCreatives(vastAd);
        this.validateCompanionAds(vastAd);
        this.validateErrorURLTemplates(vastAd);
        this.validateImpressionURLTemplates(vastAd);
        this.validateWrapperURLs(vastAd);
    }
    validateCreatives(vastAd) {
        vastAd.getCreatives().forEach((creative) => {
            if (creative instanceof VastCreativeLinear) {
                this._errors = this._errors.concat(new VastLinearCreativeValidator(creative).getErrors());
            }
            else {
                this._errors = this._errors.concat(new VastCreativeValidator(creative).getErrors());
            }
        });
    }
    validateCompanionAds(vastAd) {
        vastAd.getStaticCompanionAds().forEach((companionAd) => {
            this._errors = this._errors.concat(new VastCompanionAdStaticResourceValidator(companionAd).getErrors());
        });
        vastAd.getIframeCompanionAds().forEach((companionAd) => {
            this._errors = this._errors.concat(new VastCompanionAdIframeResourceValidator(companionAd).getErrors());
        });
        vastAd.getHtmlCompanionAds().forEach((companionAd) => {
            this._errors = this._errors.concat(new VastCompanionAdHTMLResourceValidator(companionAd).getErrors());
        });
    }
    validateErrorURLTemplates(vastAd) {
        vastAd.getErrorURLTemplates().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('VastAd errorURLTemplates', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, vastAd.getErrorURLTemplates(), url));
            }
        });
    }
    validateImpressionURLTemplates(vastAd) {
        vastAd.getImpressionURLTemplates().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('VastAd impressionURLTemplates', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, vastAd.getErrorURLTemplates(), url));
            }
        });
    }
    validateWrapperURLs(vastAd) {
        vastAd.getWrapperURLs().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level HIGH
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('VastAd wrapperURLs', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.INVALID_URL_ERROR, vastAd.getErrorURLTemplates(), url));
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvVmFsaWRhdG9ycy9WYXN0QWRWYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDMUYsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDbEYsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxzQ0FBc0MsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQ2hILE9BQU8sRUFBRSxzQ0FBc0MsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQ2hILE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBQzVHLE9BQU8sRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUM3RSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMxRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFFNUUsTUFBTSxPQUFPLGVBQWU7SUFJeEIsWUFBWSxNQUFjO1FBRmxCLFlBQU8sR0FBb0IsRUFBRSxDQUFDO1FBR2xDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVPLFFBQVEsQ0FBQyxNQUFjO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsb0JB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