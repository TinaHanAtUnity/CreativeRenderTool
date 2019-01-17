import { IValidator } from 'VAST/Validators/IValidator';
import { VastCreativeCompanionAd } from 'VAST/Models/VastCreativeCompanionAd';
import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';

export class VastCreativeCompanionAdValidator implements IValidator {

    private static readonly _supportedCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    private _errors: Error[] = [];

    constructor(companionAd: VastCreativeCompanionAd) {
        this.validate(companionAd);
    }

    public getErrors(): Error[] {
        return this._errors;
    }

    private validate(companionAd: VastCreativeCompanionAd) {
        this.validateStaticResourceUrl(companionAd);
        this.validateCreativeType(companionAd);
        this.validateCompanionClickThroughURLTemplate(companionAd);
        this.validateTrackingEvents(companionAd);
    }

    private validateStaticResourceUrl(companionAd: VastCreativeCompanionAd) {
        const adId = companionAd.getId();
        const staticResourceURL = companionAd.getStaticResourceURL();
        if (staticResourceURL === null) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) is missing required StaticResource Element`));
        } else if (!Url.isValidProtocol(staticResourceURL)) {
            this._errors.push(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) staticResourceUrl`, staticResourceURL));
        }
    }

    private validateCreativeType(companionAd: VastCreativeCompanionAd) {
        const adId = companionAd.getId();
        const creativeType = companionAd.getCreativeType();
        if (creativeType === null) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" is missing required "creativeType" attribute`));
        } else if (VastCreativeCompanionAdValidator._supportedCreativeTypes.indexOf(creativeType) === -1) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" attribute "creativeType=${creativeType}" is not supported`));
        }
    }

    private validateCompanionClickThroughURLTemplate(companionAd: VastCreativeCompanionAd) {
        const adId = companionAd.getId();
        const companionClickThroughURLTemplate = companionAd.getCompanionClickThroughURLTemplate();
        if (companionClickThroughURLTemplate === null) {
            this._errors.push(new Error(`VAST Companion ad(${adId}) is missing required CompanionClickThrough Element`));
        } else if (!Url.isValidProtocol(companionClickThroughURLTemplate)) {
            this._errors.push(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) companionClickThroughURLTemplate`, companionClickThroughURLTemplate));
        }
    }

    private validateTrackingEvents(companionAd: VastCreativeCompanionAd) {
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
