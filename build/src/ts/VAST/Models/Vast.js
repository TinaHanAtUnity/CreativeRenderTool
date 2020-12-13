import { Model } from 'Core/Models/Model';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
export class Vast extends Model {
    constructor(ads, parseErrorURLTemplates, campaignErrors) {
        super('Vast', {
            ads: ['array'],
            parseErrorURLTemplates: ['array'],
            additionalTrackingEvents: ['object']
        });
        this._isPublica = false;
        this.set('ads', ads);
        this.set('parseErrorURLTemplates', parseErrorURLTemplates);
        this.set('additionalTrackingEvents', {});
        this._campaignErrors = campaignErrors || [];
    }
    setIsPublicaTag(isPublica) {
        this._isPublica = isPublica;
    }
    isPublicaTag() {
        return this._isPublica;
    }
    getAdVerifications() {
        const vastAds = this.getAds();
        let verifications = [];
        vastAds.forEach((ad) => {
            const adVerifications = ad.getAdVerifications();
            if (adVerifications) {
                verifications = verifications.concat(adVerifications);
            }
        });
        return verifications;
    }
    getAds() {
        return this.get('ads');
    }
    getErrorURLTemplates() {
        const ad = this.getAd();
        if (ad) {
            const adErrorUrls = ad.getErrorURLTemplates();
            if (adErrorUrls instanceof Array) {
                return adErrorUrls.concat(this.get('parseErrorURLTemplates') || []);
            }
        }
        return this.get('parseErrorURLTemplates');
    }
    getErrorURLTemplate() {
        const errorUrls = this.getErrorURLTemplates();
        if (errorUrls.length > 0) {
            return errorUrls[0];
        }
        return null;
    }
    getAd() {
        if (this.getAds() && this.getAds().length > 0) {
            return this.getAds()[0];
        }
        return null;
    }
    getCampaignErrors() {
        return this._campaignErrors;
    }
    getVideoUrl() {
        const ad = this.getAd();
        if (ad) {
            for (const creative of ad.getCreatives()) {
                for (const mediaFile of creative.getMediaFiles()) {
                    const mimeType = mediaFile.getMIMEType();
                    const playable = mimeType && this.isSupportedMIMEType(mimeType);
                    const fileUrl = mediaFile.getFileURL();
                    if (fileUrl && playable) {
                        return fileUrl;
                    }
                }
            }
        }
        throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_URL_NOT_FOUND, this.getErrorURLTemplates());
    }
    getImpressionUrls() {
        const ad = this.getAd();
        if (ad) {
            return ad.getImpressionURLTemplates();
        }
        return [];
    }
    getTrackingEventUrls(eventName) {
        const ad = this.getAd();
        if (ad) {
            const adTrackingEventUrls = ad.getTrackingEventUrls(eventName);
            let additionalTrackingEventUrls = [];
            if (this.get('additionalTrackingEvents')) {
                additionalTrackingEventUrls = this.get('additionalTrackingEvents')[eventName] || [];
            }
            if (adTrackingEventUrls instanceof Array) {
                return adTrackingEventUrls.concat(additionalTrackingEventUrls);
            }
            else {
                return additionalTrackingEventUrls;
            }
        }
        return [];
    }
    addTrackingEventUrl(eventName, url) {
        if (!this.get('additionalTrackingEvents')) {
            this.set('additionalTrackingEvents', {});
        }
        if (!this.get('additionalTrackingEvents')[eventName]) {
            this.get('additionalTrackingEvents')[eventName] = [];
        }
        this.get('additionalTrackingEvents')[eventName].push(url);
    }
    getDuration() {
        const ad = this.getAd();
        if (ad) {
            return ad.getDuration();
        }
        return null;
    }
    getWrapperURL() {
        const ad = this.getAd();
        if (ad) {
            return ad.getWrapperURL();
        }
        return null;
    }
    getVideoClickThroughURL() {
        const ad = this.getAd();
        if (ad) {
            return ad.getVideoClickThroughURLTemplate();
        }
        return null;
    }
    getVideoClickTrackingURLs() {
        const ad = this.getAd();
        if (ad) {
            return ad.getVideoClickTrackingURLTemplates();
        }
        return null;
    }
    getLandscapeOrientedStaticCompanionAd() {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getStaticCompanionAds();
            if (companionAds) {
                for (const companionAd of companionAds) {
                    if (companionAd.getHeight() <= companionAd.getWidth()) {
                        return companionAd;
                    }
                }
            }
        }
        return null;
    }
    getStaticCompanionLandscapeUrl() {
        const companion = this.getLandscapeOrientedStaticCompanionAd();
        if (companion) {
            return companion.getStaticResourceURL();
        }
        return null;
    }
    getPortraitOrientedStaticCompanionAd() {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getStaticCompanionAds();
            if (companionAds) {
                for (const companionAd of companionAds) {
                    if (companionAd.getHeight() >= companionAd.getWidth()) {
                        return companionAd;
                    }
                }
            }
        }
        return null;
    }
    getStaticCompanionPortraitUrl() {
        const companion = this.getPortraitOrientedStaticCompanionAd();
        if (companion) {
            return companion.getStaticResourceURL();
        }
        return null;
    }
    getCompanionClickThroughUrl() {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getStaticCompanionAds();
            if (companionAds) {
                for (const companionAd of companionAds) {
                    const url = companionAd.getCompanionClickThroughURLTemplate();
                    if (url) {
                        return url;
                    }
                }
            }
        }
        return null;
    }
    getCompanionClickTrackingUrls() {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getStaticCompanionAds();
            if (companionAds) {
                for (const companionAd of companionAds) {
                    const urls = companionAd.getCompanionClickTrackingURLTemplates();
                    if (urls.length > 0) {
                        return urls;
                    }
                }
            }
        }
        return [];
    }
    getIframeCompanionResourceUrl() {
        const ad = this.getAd();
        if (ad) {
            const iframeCompanionAds = ad.getIframeCompanionAds();
            if (iframeCompanionAds.length > 0) {
                return iframeCompanionAds[0].getIframeResourceURL();
            }
        }
        return null;
    }
    getHtmlCompanionResourceContent() {
        const ad = this.getAd();
        if (ad) {
            const htmlCompanionAds = ad.getHtmlCompanionAds();
            if (htmlCompanionAds.length > 0) {
                return htmlCompanionAds[0].getHtmlResourceContent();
            }
        }
        return null;
    }
    getVideoMediaFiles() {
        const ad = this.getAd();
        const mediaFiles = [];
        if (ad) {
            for (const creative of ad.getCreatives()) {
                for (const mediaFile of creative.getMediaFiles()) {
                    const mimeType = mediaFile.getMIMEType();
                    const isSupported = mimeType && this.isSupportedMIMEType(mimeType);
                    const fileUrl = mediaFile.getFileURL();
                    if (isSupported && fileUrl) {
                        mediaFiles.push(mediaFile);
                    }
                }
            }
        }
        return mediaFiles;
    }
    getDTO() {
        const ads = [];
        for (const ad of this.get('ads')) {
            ads.push(ad.getDTO());
        }
        return {
            'ads': ads,
            'parseErrorURLTemplates': this.get('parseErrorURLTemplates'),
            'additionalTrackingEvents': this.get('additionalTrackingEvents')
        };
    }
    getCompanionCreativeViewTrackingUrls() {
        const ad = this.getAd();
        if (ad) {
            return ad.getCompanionCreativeViewTrackingUrls();
        }
        return [];
    }
    isVPAIDCampaign() {
        const ad = this.getAd();
        let vpaidMediaCount = 0;
        let mediaCount = 0;
        if (ad) {
            const creatives = ad.getCreatives();
            for (const creative of creatives) {
                const mediaFiles = creative.getMediaFiles();
                for (const mediaFile of mediaFiles) {
                    mediaCount += 1;
                    if (mediaFile.getApiFramework() === 'VPAID') {
                        vpaidMediaCount += 1;
                    }
                }
            }
        }
        if (vpaidMediaCount > 0 && vpaidMediaCount === mediaCount) {
            // then all mediaFiles are VPAID
            return true;
        }
        return false;
    }
    isSupportedMIMEType(MIMEType) {
        const playableMIMEType = 'video/mp4';
        MIMEType = MIMEType.toLowerCase();
        return MIMEType === playableMIMEType;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL01vZGVscy9WYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUkxQyxPQUFPLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDN0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUMzRixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQVUxRSxNQUFNLE9BQU8sSUFBSyxTQUFRLEtBQVk7SUFLbEMsWUFBWSxHQUFhLEVBQUUsc0JBQWdDLEVBQUUsY0FBZ0M7UUFDekYsS0FBSyxDQUFDLE1BQU0sRUFBRTtZQUNWLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUNkLHNCQUFzQixFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ2pDLHdCQUF3QixFQUFFLENBQUMsUUFBUSxDQUFDO1NBQ3ZDLENBQUMsQ0FBQztRQVBDLGVBQVUsR0FBRyxLQUFLLENBQUM7UUFTdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLElBQUksRUFBRSxDQUFDO0lBQ2hELENBQUM7SUFFTSxlQUFlLENBQUMsU0FBa0I7UUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDaEMsQ0FBQztJQUVNLFlBQVk7UUFDZixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVNLGtCQUFrQjtR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