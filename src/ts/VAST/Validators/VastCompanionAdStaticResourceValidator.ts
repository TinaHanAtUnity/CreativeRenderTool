import { IValidator } from 'VAST/Validators/IValidator';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { Warning } from 'Ads/Errors/Warning';

export class VastCompanionAdStaticResourceValidator implements IValidator {

    private static readonly _supportedCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    private static readonly _minPortraitHeight = 480;
    private static readonly _minPortraitWidth = 320;
    private static readonly _minLandscapeHeight = 320;
    private static readonly _minLandscapeWidth = 480;

    private _errors: Error[] = [];

    constructor(companionAd: VastCompanionAdStaticResource) {
        this.validate(companionAd);
    }

    public getErrors(): Error[] {
        return this._errors;
    }

    public getWarnings(): Warning[] {
        return [];
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
            this._errors.push(new Error(`VAST Companion ad(${adId}) is missing required StaticResource Element`));
        } else if (!Url.isValidProtocol(staticResourceURL)) {
            this._errors.push(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) staticResourceUrl`, staticResourceURL));
        }
    }

    private validateCreativeType(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const creativeType = companionAd.getCreativeType();
        if (creativeType === null) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" is missing required "creativeType" attribute`));
        } else if (VastCompanionAdStaticResourceValidator._supportedCreativeTypes.indexOf(creativeType.toLowerCase()) === -1) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" attribute "creativeType=${creativeType}" is not supported`));
        }
    }

    private validateCreativeDimensions(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const height = companionAd.getHeight();
        const width = companionAd.getWidth();
        if (height > width) {   // Portrait
            if (height < VastCompanionAdStaticResourceValidator._minPortraitHeight || width < VastCompanionAdStaticResourceValidator._minPortraitWidth) {
                this._errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" is not meeting minimum size 320 x 480`));
            }
        } else {
            if (height < VastCompanionAdStaticResourceValidator._minLandscapeHeight || width < VastCompanionAdStaticResourceValidator._minLandscapeWidth) {
                this._errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" is not meeting minimum size 480 x 320`));
            }
        }
    }

    private validateCompanionClickThroughURLTemplate(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const companionClickThroughURLTemplate = companionAd.getCompanionClickThroughURLTemplate();
        if (companionClickThroughURLTemplate === null) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) is missing required CompanionClickThrough Element`));
        } else if (!Url.isValidProtocol(companionClickThroughURLTemplate)) {
            this._errors.push(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickThroughURLTemplate`, companionClickThroughURLTemplate));
        }
    }

    private validateCompanionClickTrackingURLTemplates(companionAd: VastCompanionAdStaticResource) {
        const adId = companionAd.getId();
        const companionClickTrackingURLTemplates = companionAd.getCompanionClickTrackingURLTemplates();
        for (const companionClickTrackingURLTemplate of companionClickTrackingURLTemplates) {
            if (!Url.isValidProtocol(companionClickTrackingURLTemplate)) {
                this._errors.push(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickTrackingURLTemplates`, companionClickTrackingURLTemplate));
            }
        }
    }

    private validateTrackingEvents(companionAd: VastCompanionAdStaticResource) {
        const trackingEvents = companionAd.getTrackingEvents();
        Object.keys(trackingEvents).map((key) => {
            const urls = trackingEvents[key];
            urls.map((url) => {
                if (!Url.isValidProtocol(url)) {
                    this._errors.push(VastValidationUtilities.invalidUrlError('companion ad trackingEvents', url));
                }
            });
        });
    }
}
