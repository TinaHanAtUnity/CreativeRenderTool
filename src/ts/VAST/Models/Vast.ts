import { Model } from 'Core/Models/Model';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCreativeCompanionAd } from 'VAST/Models/VastCreativeCompanionAd';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';

interface IVast {
    ads: VastAd[];
    errorURLTemplates: string[];
    additionalTrackingEvents: { [eventName: string]: string[] };
}

export class Vast extends Model<IVast> {

    constructor(ads: VastAd[], errorURLTemplates: any[]) {
        super('Vast', {
            ads: ['array'],
            errorURLTemplates: ['array'],
            additionalTrackingEvents: ['object']
        });

        this.set('ads', ads);
        this.set('errorURLTemplates', errorURLTemplates);
        this.set('additionalTrackingEvents', {});
    }

    public getAds(): VastAd[] {
        return this.get('ads');
    }

    public getErrorURLTemplates(): string[] {
        const ad = this.getAd();
        if (ad) {
            const adErrorUrls = ad.getErrorURLTemplates();
            if (adErrorUrls instanceof Array) {
                return adErrorUrls.concat(this.get('errorURLTemplates') || []);
            }
        }

        return this.get('errorURLTemplates');
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

        throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND], CampaignContentTypes.ProgrammaticVast);
    }

    public getMediaVideoUrl(): string | null {
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

        return null;
    }

    public getImpressionUrls(): string[] {
        const ad = this.getAd();
        if (ad) {
            return ad.getImpressionURLTemplates();
        }
        return [];
    }

    public getTrackingEventUrls(eventName: string): string[] {
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

    public getLandscapeOrientedCompanionAd(): VastCreativeCompanionAd | null {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getCompanionAds();

            if (companionAds) {
                for(const companionAd of companionAds) {
                    if (this.isValidLandscapeCompanion(companionAd.getCreativeType(), companionAd.getHeight(), companionAd.getWidth())) {
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

    public getPortraitOrientedCompanionAd(): VastCreativeCompanionAd | null {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getCompanionAds();

            if (companionAds) {
                for(const companionAd of companionAds) {
                    if (this.isValidPortraitCompanion(companionAd.getCreativeType(), companionAd.getHeight(), companionAd.getWidth())) {
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
            const companionAds = ad.getCompanionAds();

            if (companionAds) {
                for(const companionAd of companionAds) {
                    const url = companionAd.getCompanionClickThroughURLTemplate();
                    const height = companionAd.getHeight();
                    const width = companionAd.getWidth();
                    const creativeType = companionAd.getCreativeType();
                    const validCompanion = this.isValidPortraitCompanion(creativeType, height, width) || this.isValidLandscapeCompanion(creativeType, height, width);
                    if (url && validCompanion) {
                        return url;
                    }
                }
            }
        }

        return null;
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

    public getDTO(): { [key: string]: any } {
        const ads = [];
        for (const ad of this.get('ads')) {
            ads.push(ad.getDTO());
        }

        return {
            'ads': ads,
            'errorURLTemplates': this.get('errorURLTemplates'),
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

    private isValidLandscapeCompanion(creativeType: string | null, height: number, width: number): boolean {
        const minHeight = 320;
        const minWidth = 480;
        return this.isValidCompanionCreativeType(creativeType) && (height < width) && (height >= minHeight) && (width >= minWidth);
    }

    private isValidPortraitCompanion(creativeType: string | null, height: number, width: number): boolean {
        const minHeight = 480;
        const minWidth = 320;
        return this.isValidCompanionCreativeType(creativeType) && (height > width) && (height >= minHeight) && (width >= minWidth);
    }

    private isValidCompanionCreativeType(creativeType: string | null): boolean {
        const reg = new RegExp('(jpe?g|gif|png)', 'gi');
        return !!creativeType && reg.test(creativeType);
    }

    private isSupportedMIMEType(MIMEType: string): boolean {
        const playableMIMEType = 'video/mp4';
        return MIMEType.toLowerCase() === playableMIMEType;
    }
}
