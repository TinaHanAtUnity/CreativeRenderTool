import { IValidator } from 'VAST/Validators/IValidator';
import { VastCreativeStaticResourceCompanionAd } from 'VAST/Models/VastCreativeStaticResourceCompanionAd';
import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';

export class VastCreativeStaticResourceCompanionAdValidator implements IValidator {

    private static readonly _supportedCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    private _errors: Error[] = [];

    constructor(companionAd: VastCreativeStaticResourceCompanionAd) {
        this.validate(companionAd);
    }

    public getErrors(): Error[] {
        return this._errors;
    }

    private validate(companionAd: VastCreativeStaticResourceCompanionAd) {
        this.validateStaticResourceUrl(companionAd);
        this.validateCreativeType(companionAd);
        this.validateCompanionClickThroughURLTemplate(companionAd);
        this.validateCompanionClickTrackingURLTemplates(companionAd);
        this.validateTrackingEvents(companionAd);
    }

    private validateStaticResourceUrl(companionAd: VastCreativeStaticResourceCompanionAd) {
        const adId = companionAd.getId();
        const staticResourceURL = companionAd.getStaticResourceURL();
        if (staticResourceURL === null) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) is missing required StaticResource Element`));
        } else if (!Url.isValidProtocol(staticResourceURL)) {
            this._errors.push(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) staticResourceUrl`, staticResourceURL));
        }
    }

    private validateCreativeType(companionAd: VastCreativeStaticResourceCompanionAd) {
        const adId = companionAd.getId();
        const creativeType = companionAd.getCreativeType();
        if (creativeType === null) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" is missing required "creativeType" attribute`));
        } else if (VastCreativeStaticResourceCompanionAdValidator._supportedCreativeTypes.indexOf(creativeType.toLowerCase()) === -1) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" attribute "creativeType=${creativeType}" is not supported`));
        }
    }

    private validateCompanionClickThroughURLTemplate(companionAd: VastCreativeStaticResourceCompanionAd) {
        const adId = companionAd.getId();
        const companionClickThroughURLTemplate = companionAd.getCompanionClickThroughURLTemplate();
        if (companionClickThroughURLTemplate === null) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) is missing required CompanionClickThrough Element`));
        } else if (!Url.isValidProtocol(companionClickThroughURLTemplate)) {
            this._errors.push(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickThroughURLTemplate`, companionClickThroughURLTemplate));
        }
    }

    private validateCompanionClickTrackingURLTemplates(companionAd: VastCreativeStaticResourceCompanionAd) {
        const adId = companionAd.getId();
        const companionClickTrackingURLTemplates = companionAd.getCompanionClickTrackingURLTemplates();
        for (const companionClickTrackingURLTemplate of companionClickTrackingURLTemplates) {
            if (!Url.isValidProtocol(companionClickTrackingURLTemplate)) {
                this._errors.push(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickTrackingURLTemplates`, companionClickTrackingURLTemplate));
            }
        }
    }

    private validateTrackingEvents(companionAd: VastCreativeStaticResourceCompanionAd) {
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
