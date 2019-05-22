import { IValidator } from 'VAST/Validators/IValidator';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastLinearCreativeValidator } from 'VAST/Validators/VastLinearCreativeValidator';
import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Url } from 'Core/Utilities/Url';
import { VastCompanionAdStaticResourceValidator } from 'VAST/Validators/VastCompanionAdStaticResourceValidator';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

export class VastAdValidator implements IValidator {

    private _errors: CampaignError[] = [];

    constructor(vastAd: VastAd) {
        this.validate(vastAd);
    }

    public getErrors(): CampaignError[] {
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
            this._errors = this._errors.concat(new VastCompanionAdStaticResourceValidator(companionAd).getErrors());
        });
    }

    private validateErrorURLTemplates(vastAd: VastAd) {
        vastAd.getErrorURLTemplates().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('VastAd errorURLTemplates', url).message, CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, vastAd.getErrorURLTemplates(), url));
            }
        });
    }

    private validateImpressionURLTemplates(vastAd: VastAd) {
        vastAd.getImpressionURLTemplates().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level LOW
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('VastAd impressionURLTemplates', url).message, CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, vastAd.getErrorURLTemplates(), url));
            }
        });
    }

    private validateWrapperURLs(vastAd: VastAd) {
        vastAd.getWrapperURLs().forEach((url) => {
            if (!Url.isValidProtocol(url)) {
                // Error level HIGH
                this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('VastAd wrapperURLs', url).message, CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.HIGH, VastErrorCode.INVALID_URL_ERROR, vastAd.getErrorURLTemplates(), url));
            }
        });
    }
}
