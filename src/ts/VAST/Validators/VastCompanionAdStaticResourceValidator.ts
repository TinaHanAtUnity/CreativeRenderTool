import { IValidator } from 'VAST/Validators/IValidator';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';

export class VastCompanionAdStaticResourceValidator implements IValidator {

    private static readonly _supportedCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    private static readonly _minPortraitHeight = 480;
    private static readonly _minPortraitWidth = 320;
    private static readonly _minLandscapeHeight = 320;
    private static readonly _minLandscapeWidth = 480;
    private static readonly _minSquareSize = 200;   // minimum size requirement

    private _errors: CampaignError[] = [];

    constructor(companionAd: VastCompanionAdStaticResource) {
        this.validate(companionAd);
    }

    public getErrors(): CampaignError[] {
        return this._errors;
    }

    private validate(companionAd: VastCompanionAdStaticResource) {
        this.validateStaticResourceUrl(companionAd);
        this.validateCreativeType(companionAd);
        this.validateCreativeDimensions(companionAd);
        this.validateCompanionClickThroughURLTemplate(companionAd);
        this.validateCompanionClickTrackingURLTemplates(companionAd);
        this.validateTrackingEvents(companionAd);
    }

    private validateStaticResourceUrl(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const staticResourceURL = companionAd.getStaticResourceURL();
        if (staticResourceURL === null) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) is missing required StaticResource Element`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, undefined));
        } else if (!Url.isValidProtocol(staticResourceURL)) {
            this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) staticResourceUrl`, staticResourceURL).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, staticResourceURL));
        }
    }

    private validateCreativeType(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const creativeType = companionAd.getCreativeType();
        const staticResourceURL = companionAd.getStaticResourceURL() || undefined;
        if (creativeType === null) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "StaticResource" is missing required "creativeType" attribute`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, staticResourceURL));
        } else if (VastCompanionAdStaticResourceValidator._supportedCreativeTypes.indexOf(creativeType.toLowerCase()) === -1) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "StaticResource" attribute "creativeType=${creativeType}" is not supported`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, staticResourceURL));
        }
    }

    private validateCreativeDimensions(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const height = companionAd.getHeight();
        const width = companionAd.getWidth();
        const staticResourceURL = companionAd.getStaticResourceURL() || undefined;
        if (height > width) {   // Portrait
            if (height < VastCompanionAdStaticResourceValidator._minSquareSize || width < VastCompanionAdStaticResourceValidator._minSquareSize) {
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "StaticResource" is not meeting minimum size ${VastCompanionAdStaticResourceValidator._minPortraitWidth} x ${VastCompanionAdStaticResourceValidator._minPortraitHeight} for Portrait display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, staticResourceURL));
            }
        } else {
            if (height < VastCompanionAdStaticResourceValidator._minSquareSize || width < VastCompanionAdStaticResourceValidator._minSquareSize) {
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "StaticResource" is not meeting minimum size ${VastCompanionAdStaticResourceValidator._minLandscapeWidth} x ${VastCompanionAdStaticResourceValidator._minLandscapeHeight} for Landscape display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, staticResourceURL));
            }
        }
    }

    private validateCompanionClickThroughURLTemplate(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const companionClickThroughURLTemplate = companionAd.getCompanionClickThroughURLTemplate();
        const staticResourceURL = companionAd.getStaticResourceURL() || undefined;
        if (companionClickThroughURLTemplate === null) {
            // Error level LOW: will reuse Video Click Through
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) is missing required CompanionClickThrough Element`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.COMPANION_NO_CLICKTHROUGH, undefined, staticResourceURL));
        } else if (!Url.isValidProtocol(companionClickThroughURLTemplate)) {
            this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickThroughURLTemplate`, companionClickThroughURLTemplate).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.COMPANION_NO_CLICKTHROUGH, undefined, staticResourceURL));
        }
    }

    private validateCompanionClickTrackingURLTemplates(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const companionClickTrackingURLTemplates = companionAd.getCompanionClickTrackingURLTemplates();
        for (const companionClickTrackingURLTemplate of companionClickTrackingURLTemplates) {
            if (!Url.isValidProtocol(companionClickTrackingURLTemplate)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickTrackingURLTemplates`, companionClickTrackingURLTemplate).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, companionClickTrackingURLTemplate));
            }
        }
    }

    private validateTrackingEvents(companionAd: VastCompanionAdStaticResource) {
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
