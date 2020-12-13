import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
export class VastCompanionAdStaticResourceValidator {
    constructor(companionAd) {
        this._errors = [];
        this.validate(companionAd);
    }
    getErrors() {
        return this._errors;
    }
    validate(companionAd) {
        this.validateStaticResourceUrl(companionAd);
        this.validateCreativeType(companionAd);
        this.validateCreativeDimensions(companionAd);
        this.validateCompanionClickThroughURLTemplate(companionAd);
        this.validateCompanionClickTrackingURLTemplates(companionAd);
        this.validateTrackingEvents(companionAd);
    }
    validateStaticResourceUrl(companionAd) {
        const adId = companionAd.getId();
        const staticResourceURL = companionAd.getStaticResourceURL();
        if (staticResourceURL === null) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) is missing required StaticResource Element`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, undefined));
        }
        else if (!Url.isValidProtocol(staticResourceURL)) {
            this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) staticResourceUrl`, staticResourceURL).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, staticResourceURL));
        }
    }
    validateCreativeType(companionAd) {
        const adId = companionAd.getId();
        const creativeType = companionAd.getCreativeType();
        const staticResourceURL = companionAd.getStaticResourceURL() || undefined;
        if (creativeType === null) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "StaticResource" is missing required "creativeType" attribute`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, staticResourceURL));
        }
        else if (VastCompanionAdStaticResourceValidator._supportedCreativeTypes.indexOf(creativeType.toLowerCase()) === -1) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "StaticResource" attribute "creativeType=${creativeType}" is not supported`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, staticResourceURL));
        }
    }
    validateCreativeDimensions(companionAd) {
        const adId = companionAd.getId();
        const height = companionAd.getHeight();
        const width = companionAd.getWidth();
        const staticResourceURL = companionAd.getStaticResourceURL() || undefined;
        // Check minimum square size but notify minimum Portrait/Landscape as suggestion
        // minimum square size 200 px will be the limit to cuoff rendering
        if (height < VastCompanionAdStaticResourceValidator._minSquareSize || width < VastCompanionAdStaticResourceValidator._minSquareSize) {
            if (height > width) { // Portrait
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "StaticResource" is not meeting minimum size ${VastCompanionAdStaticResourceValidator._minPortraitWidth} x ${VastCompanionAdStaticResourceValidator._minPortraitHeight} for Portrait display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, staticResourceURL));
            }
            else { // Landscape
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "StaticResource" is not meeting minimum size ${VastCompanionAdStaticResourceValidator._minLandscapeWidth} x ${VastCompanionAdStaticResourceValidator._minLandscapeHeight} for Landscape display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, staticResourceURL));
            }
        }
    }
    validateCompanionClickThroughURLTemplate(companionAd) {
        const adId = companionAd.getId();
        const companionClickThroughURLTemplate = companionAd.getCompanionClickThroughURLTemplate();
        const staticResourceURL = companionAd.getStaticResourceURL() || undefined;
        if (companionClickThroughURLTemplate === null) {
            // Error level LOW: will reuse Video Click Through
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) is missing required CompanionClickThrough Element`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.COMPANION_NO_CLICKTHROUGH, undefined, staticResourceURL));
        }
        else if (!Url.isValidProtocol(companionClickThroughURLTemplate)) {
            this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickThroughURLTemplate`, companionClickThroughURLTemplate).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.COMPANION_NO_CLICKTHROUGH, undefined, staticResourceURL));
        }
    }
    validateCompanionClickTrackingURLTemplates(companionAd) {
        const adId = companionAd.getId();
        const companionClickTrackingURLTemplates = companionAd.getCompanionClickTrackingURLTemplates();
        for (const companionClickTrackingURLTemplate of companionClickTrackingURLTemplates) {
            if (!Url.isValidProtocol(companionClickTrackingURLTemplate)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickTrackingURLTemplates`, companionClickTrackingURLTemplate).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, companionClickTrackingURLTemplate));
            }
        }
    }
    validateTrackingEvents(companionAd) {
        const trackingEvents = companionAd.getTrackingEvents();
        Object.keys(trackingEvents).map((key) => {
            const urls = trackingEvents[key];
            urls.map((url) => {
                if (!Url.isValidProtocol(url)) {
                    // Error level LOW
                    this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('companion ad trackingEvents', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, url));
                }
            });
        });
    }
}
VastCompanionAdStaticResourceValidator._supportedCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
VastCompanionAdStaticResourceValidator._minPortraitHeight = 480;
VastCompanionAdStaticResourceValidator._minPortraitWidth = 320;
VastCompanionAdStaticResourceValidator._minLandscapeHeight = 320;
VastCompanionAdStaticResourceValidator._minLandscapeWidth = 480;
VastCompanionAdStaticResourceValidator._minSquareSize = 200; // minimum size requirement
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkU3RhdGljUmVzb3VyY2VWYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9WYWxpZGF0b3JzL1Zhc3RDb21wYW5pb25BZFN0YXRpY1Jlc291cmNlVmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNsRixPQUFPLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDN0UsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDMUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBRTVFLE1BQU0sT0FBTyxzQ0FBc0M7SUFXL0MsWUFBWSxXQUEwQztRQUY5QyxZQUFPLEdBQW9CLEVBQUUsQ0FBQztRQUdsQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFTyxRQUFRLENBQUMsV0FBMEM7UUFDdkQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQywwQ0FBMEMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVPLHlCQUF5QixD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