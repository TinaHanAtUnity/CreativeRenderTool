import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastCreativeCompanionAd } from 'VAST/Models/VastCreativeCompanionAd';
import { VastCreative } from 'VAST/Models/VastCreative';
import { Url } from 'Core/Utilities/Url';
import { VastAd } from 'VAST/Models/VastAd';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';

export class VastValidator {
    private static _supportedCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    public static formatErrors(errors: Error[]): string {
        return errors.map((error) => {
            return error.message;
        }).join('\n    ');
    }

    public static validateMediaFile(mediaFile: VastMediaFile): Error[] {
        return [];
    }

    public static validateCompanionAd(companionAd: VastCreativeCompanionAd): Error[] {
        const errors: Error[] = [];
        const adId = companionAd.getId();
        const staticResourceURL = companionAd.getStaticResourceURL();
        if (staticResourceURL === null) {
            errors.push(new Error(`VAST Companion ad(${adId}) is missing required StaticResource Element!`));
        } else if (!Url.isValid(staticResourceURL)) {
            errors.push(this.invalidUrlError(`companion ad(${adId}) staticResourceUrl`, staticResourceURL));
        }
        const creativeType = companionAd.getCreativeType();
        if (creativeType === null) {
            errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" is missing required "creativeType" attribute!`));
        } else if (VastValidator._supportedCreativeTypes.indexOf(creativeType) === -1) {
            errors.push(new Error(`VAST Companion ad(${adId}) "StaticResource" attribute "creativeType=${creativeType}" is not supported!`));
        }
        const companionClickThroughURLTemplate = companionAd.getCompanionClickThroughURLTemplate();
        if (companionClickThroughURLTemplate === null) {
            errors.push(new Error(`VAST Companion ad(${adId}) is missing required CompanionClickThrough Element!`));
        } else if (!Url.isValid(companionClickThroughURLTemplate)) {
            errors.push(this.invalidUrlError(`companion ad(${adId}) companionClickThroughURLTemplate`, companionClickThroughURLTemplate));
        }
        const trackingEvents = companionAd.getTrackingEvents();
        Object.keys(trackingEvents).map((key) => {
            const urls = trackingEvents[key];
            urls.map((url) => {
                if (!Url.isValid(url)) {
                    errors.push(this.invalidUrlError('companion ad trackingEvents', url));
                }
            });
        });
        return errors;
    }

    public static validateCreative(creative: VastCreative): Error[] {
        const errors: Error[] = [];
        const trackingEvents = creative.getTrackingEvents();
        Object.keys(trackingEvents).map((key) => {
            trackingEvents[key].map((url) => {
                if (!Url.isValid(url)) {
                    errors.push(this.invalidUrlError('creative trackingEvents', url));
                }
            });
        });
        return errors;
    }

    public static validateLinearCreative(linearCreative: VastCreativeLinear): Error[] {
        let errors: Error[] = this.validateCreative(linearCreative);
        if (linearCreative.getDuration() === -1) {
            errors.push(new Error('VAST linear creative is missing valid duration'));
        }
        const videoClickThroughURLTemplate = linearCreative.getVideoClickThroughURLTemplate();
        if (videoClickThroughURLTemplate && !Url.isValid(videoClickThroughURLTemplate)) {
            errors.push(this.invalidUrlError('linear creative videoClickThroughURLTemplate', videoClickThroughURLTemplate));
        }
        const videoClickTrackingURLTemplates = linearCreative.getVideoClickTrackingURLTemplates();
        videoClickTrackingURLTemplates.map((url) => {
            if (!Url.isValid(url)) {
                errors.push(this.invalidUrlError('linear creative videoClickTrackingURLTemplates', url));
            }
        });
        const videoCustomClickURLTemplates = linearCreative.getVideoCustomClickURLTemplates();
        videoCustomClickURLTemplates.map((url) => {
            if (!Url.isValid(url)) {
                errors.push(this.invalidUrlError('linear creative videoCustomClickURLTemplates', url));
            }
        });
        const mediaFiles = linearCreative.getMediaFiles();
        mediaFiles.map((mediaFile) => {
            errors = errors.concat(this.validateMediaFile(mediaFile));
        });

        return errors;
    }

    public static validateVastAd(vastAd: VastAd): Error[] {
        let errors: Error[] = [];
        vastAd.getCreatives().map((creative) => {
            if (creative instanceof VastCreativeLinear) {
                errors = errors.concat(this.validateLinearCreative(creative));
            } else {
                errors = errors.concat(this.validateCreative(creative));
            }
        });
        vastAd.getCompanionAds().map((companionAd) => {
            errors = errors.concat(this.validateCompanionAd(companionAd));
        });
        vastAd.getErrorURLTemplates().map((url) => {
            if (!Url.isValid(url)) {
                errors.push(this.invalidUrlError('VastAd errorURLTemplates', url));
            }
        });
        vastAd.getImpressionURLTemplates().map((url) => {
            if (!Url.isValid(url)) {
                errors.push(this.invalidUrlError('VastAd impressionURLTemplates', url));
            }
        });
        vastAd.getWrapperURLs().map((url) => {
            if (!Url.isValid(url)) {
                errors.push(this.invalidUrlError('VastAd wrapperURLs', url));
            }
        });
        return errors;
    }

    private static invalidUrlError(description: string, url: string): Error {
        return new Error(`VAST ${description} contains invalid url("${url}")`);
    }

}
