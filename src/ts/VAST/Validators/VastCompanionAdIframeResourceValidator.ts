import { IValidator } from 'VAST/Validators/IValidator';
import { VastCompanionAdIframeResource } from 'VAST/Models/VastCompanionAdIframeResource';
import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';

export class VastCompanionAdIframeResourceValidator implements IValidator {

    private static readonly _minPortraitHeight = 480;
    private static readonly _minPortraitWidth = 320;
    private static readonly _minLandscapeHeight = 320;
    private static readonly _minLandscapeWidth = 480;
    private static readonly _minSquareSize = 200;   // minimum size requirement

    private _errors: CampaignError[] = [];

    constructor(companionAd: VastCompanionAdIframeResource) {
        this.validate(companionAd);
    }

    public getErrors(): CampaignError[] {
        return this._errors;
    }

    private validate(companionAd: VastCompanionAdIframeResource) {
        this.validateIframeResourceUrl(companionAd);
        this.validateCreativeDimensions(companionAd);
    }

    private validateIframeResourceUrl(companionAd: VastCompanionAdIframeResource) {
        const adId = companionAd.getId();
        const IframeResourceURL = companionAd.getIframeResourceURL();
        if (IframeResourceURL === null) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) is missing required IframeResource Element`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, undefined));
        } else if (!Url.isValidProtocol(IframeResourceURL)) {
            this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) IframeResourceUrl`, IframeResourceURL).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, IframeResourceURL));
        }
    }

    private validateCreativeDimensions(companionAd: VastCompanionAdIframeResource) {
        const adId = companionAd.getId();
        const height = companionAd.getHeight();
        const width = companionAd.getWidth();
        const IframeResourceURL = companionAd.getIframeResourceURL() || undefined;

        // Check minimum square size but notify minimum Portrait/Landscape as suggestion
        // minimum square size 200 px will be the limit to cuoff rendering
        if (height < VastCompanionAdIframeResourceValidator._minSquareSize || width < VastCompanionAdIframeResourceValidator._minSquareSize) {
            if (height > width) { // Portrait
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "IframeResource" is not meeting minimum size ${VastCompanionAdIframeResourceValidator._minPortraitWidth} x ${VastCompanionAdIframeResourceValidator._minPortraitHeight} for Portrait display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, IframeResourceURL));
            } else { // Landscape
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "IframeResource" is not meeting minimum size ${VastCompanionAdIframeResourceValidator._minLandscapeWidth} x ${VastCompanionAdIframeResourceValidator._minLandscapeHeight} for Landscape display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, IframeResourceURL));
            }
        }
    }
}
