import { IValidator } from 'VAST/Validators/IValidator';
import { VastCompanionAdHTMLResource } from 'VAST/Models/VastCompanionAdHTMLResource';
import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';

export class VastCompanionAdHTMLResourceValidator implements IValidator {

    private static readonly _minPortraitHeight = 480;
    private static readonly _minPortraitWidth = 320;
    private static readonly _minLandscapeHeight = 320;
    private static readonly _minLandscapeWidth = 480;
    private static readonly _minSquareSize = 200;   // minimum size requirement

    private _errors: CampaignError[] = [];

    constructor(companionAd: VastCompanionAdHTMLResource) {
        this.validate(companionAd);
    }

    public getErrors(): CampaignError[] {
        return this._errors;
    }

    private validate(companionAd: VastCompanionAdHTMLResource) {
        this.validateHTMLResourceUrl(companionAd);
        this.validateCreativeDimensions(companionAd);
    }

    private validateHTMLResourceUrl(companionAd: VastCompanionAdHTMLResource) {
        const adId = companionAd.getId();
        const HTMLResourceContent = companionAd.getHtmlResourceContent();
        if (HTMLResourceContent === null) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) is missing required HTMLResource Element`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, undefined));
        }
    }

    private validateCreativeDimensions(companionAd: VastCompanionAdHTMLResource) {
        const adId = companionAd.getId();
        const height = companionAd.getHeight();
        const width = companionAd.getWidth();
        const HTMLResourceContent = companionAd.getHtmlResourceContent() || undefined;

        // Check minimum square size but notify minimum Portrait/Landscape as suggestion
        // minimum square size 200 px will be the limit to cuoff rendering
        if (height < VastCompanionAdHTMLResourceValidator._minSquareSize || width < VastCompanionAdHTMLResourceValidator._minSquareSize) {
            if (height > width) { // Portrait
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "HTMLResource" is not meeting minimum size ${VastCompanionAdHTMLResourceValidator._minPortraitWidth} x ${VastCompanionAdHTMLResourceValidator._minPortraitHeight} for Portrait display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, HTMLResourceContent));
            } else { // Landscape
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "HTMLResource" is not meeting minimum size ${VastCompanionAdHTMLResourceValidator._minLandscapeWidth} x ${VastCompanionAdHTMLResourceValidator._minLandscapeHeight} for Landscape display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, HTMLResourceContent));
            }
        }
    }
}
