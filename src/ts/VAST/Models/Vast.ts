import { Model } from 'Core/Models/Model';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

interface IVast {
    ads: VastAd[];
    parseErrorURLTemplates: string[];
    additionalTrackingEvents: { [eventName: string]: string[] };
}

export class Vast extends Model<IVast> {

    private _campaignErrors: CampaignError[];

    constructor(ads: VastAd[], parseErrorURLTemplates: string[], campaignErrors?: CampaignError[]) {
        super('Vast', {
            ads: ['array'],
            parseErrorURLTemplates: ['array'],
            additionalTrackingEvents: ['object']
        });

        this.set('ads', ads);
        this.set('parseErrorURLTemplates', parseErrorURLTemplates);
        this.set('additionalTrackingEvents', {});

        this._campaignErrors = campaignErrors || [];
    }

    public getAds(): VastAd[] {
        return this.get('ads');
    }

    public getErrorURLTemplates(): string[] {
        const ad = this.getAd();
        if (ad) {
            const adErrorUrls = ad.getErrorURLTemplates();
            if (adErrorUrls instanceof Array) {
                return adErrorUrls.concat(this.get('parseErrorURLTemplates') || []);
            }
        }

        return this.get('parseErrorURLTemplates');
    }

    public getErrorURLTemplate(): string | null {
        const errorUrls = this.getErrorURLTemplates();
        if (errorUrls.length > 0) {
            return errorUrls[0];
        }
        return null;
    }

    public getAd(): VastAd | null {
        if (this.getAds() && this.getAds().length > 0) {
            return this.getAds()[0];
        }

        return null;
    }

    public getCampaignErrors(): CampaignError[] {
        return this._campaignErrors;
    }

    public getVideoUrl(): string {
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

    public getImpressionUrls(): string[] {
        const ad = this.getAd();
        if (ad) {
            return ad.getImpressionURLTemplates();
        }
        return [];
    }

    public getTrackingEventUrls(eventName: TrackingEvent): string[] {
        const ad = this.getAd();
        if (ad) {
            const adTrackingEventUrls = ad.getTrackingEventUrls(eventName);
            let additionalTrackingEventUrls: string[] = [];
            if (this.get('additionalTrackingEvents')) {
                additionalTrackingEventUrls = this.get('additionalTrackingEvents')[eventName] || [];
            }
            if (adTrackingEventUrls instanceof Array) {
                return adTrackingEventUrls.concat(additionalTrackingEventUrls);
            } else {
                return additionalTrackingEventUrls;
            }
        }
        return [];
    }

    public addTrackingEventUrl(eventName: string, url: string) {
        if (!this.get('additionalTrackingEvents')) {
            this.set('additionalTrackingEvents', {});
        }
        if (!this.get('additionalTrackingEvents')[eventName]) {
            this.get('additionalTrackingEvents')[eventName] = [];
        }
        this.get('additionalTrackingEvents')[eventName].push(url);
    }

    public getDuration(): number | null {
        const ad = this.getAd();
        if (ad) {
            return ad.getDuration();
        }
        return null;
    }

    public getWrapperURL(): string | null {
        const ad = this.getAd();
        if (ad) {
            return ad.getWrapperURL();
        }
        return null;
    }

    public getVideoClickThroughURL(): string | null {
        const ad = this.getAd();
        if (ad) {
            return ad.getVideoClickThroughURLTemplate();
        }
        return null;
    }

    public getVideoClickTrackingURLs(): string[] | null {
        const ad = this.getAd();
        if (ad) {
            return ad.getVideoClickTrackingURLTemplates();
        }
        return null;
    }

    public getLandscapeOrientedCompanionAd(): VastCompanionAdStaticResource | null {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getStaticCompanionAds();

            if (companionAds) {
                for(const companionAd of companionAds) {
                    if (companionAd.getHeight() <= companionAd.getWidth()) {
                        return companionAd;
                    }
                }
            }
        }

        return null;
    }

    public getCompanionLandscapeUrl(): string | null {
        const companion = this.getLandscapeOrientedCompanionAd();
        if (companion) {
            return companion.getStaticResourceURL();
        }
        return null;
    }

    public getPortraitOrientedCompanionAd(): VastCompanionAdStaticResource | null {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getStaticCompanionAds();

            if (companionAds) {
                for(const companionAd of companionAds) {
                    if (companionAd.getHeight() >= companionAd.getWidth()) {
                        return companionAd;
                    }
                }
            }
        }

        return null;
    }

    public getCompanionPortraitUrl(): string | null {
        const companion = this.getPortraitOrientedCompanionAd();
        if (companion) {
            return companion.getStaticResourceURL();
        }
        return null;
    }

    public getCompanionClickThroughUrl(): string | null {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getStaticCompanionAds();

            if (companionAds) {
                for(const companionAd of companionAds) {
                    const url = companionAd.getCompanionClickThroughURLTemplate();
                    if (url) {
                        return url;
                    }
                }
            }
        }

        return null;
    }

    public getCompanionClickTrackingUrls(): string[] {
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

    public getVideoMediaFiles(): VastMediaFile[] {
        const ad = this.getAd();
        const mediaFiles: VastMediaFile[] = [];
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

    public getDTO(): { [key: string]: unknown } {
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

    public getCompanionCreativeViewTrackingUrls(): string[] {
        const ad = this.getAd();
        if (ad) {
            return ad.getCompanionCreativeViewTrackingUrls();
        }
        return [];
    }

    public isVPAIDCampaign(): boolean {
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

    private isSupportedMIMEType(MIMEType: string): boolean {
        const playableMIMEType = 'video/mp4';
        MIMEType = MIMEType.toLowerCase();
        return MIMEType === playableMIMEType;
    }
}
