import { VastAd } from 'Models/Vast/VastAd';

export class Vast {

    private _ads: VastAd[];
    private _errorURLTemplates: string[];
    private _additionalTrackingEvents: { [eventName: string]: string[] };

    constructor(ads: VastAd[], errorURLTemplates: any[]) {
        this._ads = ads;
        this._errorURLTemplates = errorURLTemplates;
        this._additionalTrackingEvents = {};
    }

    public getAds(): VastAd[] {
        return this._ads;
    }

    public getErrorURLTemplates(): string[] {
        const ad = this.getAd();
        if (ad) {
            const adErrorUrls = ad.getErrorURLTemplates();
            if (adErrorUrls instanceof Array) {
                return adErrorUrls.concat(this._errorURLTemplates || []);
            }
        }
        return this._errorURLTemplates;
    }

    public getAd(): VastAd | null {
        if (this.getAds() && this.getAds().length > 0) {
            return this.getAds()[0];
        }
        return null;
    }

    public getVideoUrl(): string | null {
        const ad = this.getAd();
        if (ad) {
            for (const creative of ad.getCreatives()) {
                for (const mediaFile of creative.getMediaFiles()) {
                    const mimeType = mediaFile.getMIMEType();
                    const playable = mimeType && this.isPlayableMIMEType(mimeType);
                    if (mediaFile.getFileURL() && playable) {
                        return mediaFile.getFileURL();
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
            if (this._additionalTrackingEvents) {
                additionalTrackingEventUrls = this._additionalTrackingEvents[eventName] || [];
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
        if (!this._additionalTrackingEvents) {
            this._additionalTrackingEvents = {};
        }
        if (!this._additionalTrackingEvents[eventName]) {
            this._additionalTrackingEvents[eventName] = [];
        }
        this._additionalTrackingEvents[eventName].push(url);
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

    public getCompanionLandscapeUrl(): string | null {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getCompanionAds();

            if (companionAds) {
                for (let i = 0; i < companionAds.length; i++) {
                    const companionAd = companionAds[i];
                    if (this.isValidLandscapeCompanion(companionAd.getCreativeType(), companionAd.getHeight(), companionAd.getWidth())) {
                        return companionAd.getStaticResourceURL();
                    }
                }
            }
        }

        return null;
    }

    public getCompanionPortraitUrl(): string | null {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getCompanionAds();

            if (companionAds) {
                for (let i = 0; i < companionAds.length; i++) {
                    const companionAd = companionAds[i];
                    if (this.isValidPortraitCompanion(companionAd.getCreativeType(), companionAd.getHeight(), companionAd.getWidth())) {
                        return companionAd.getStaticResourceURL();
                    }
                }
            }
        }

        return null;
    }

    public getCompanionClickThroughUrl(): string | null {
        const ad = this.getAd();
        if (ad) {
            const companionAds = ad.getCompanionAds();

            if (companionAds) {
                for (let i = 0; i < companionAds.length; i++) {
                    const companionAd = companionAds[i];
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

    private isPlayableMIMEType(MIMEType: string): boolean {
        const playableMIMEType = 'video/mp4';
        MIMEType = MIMEType.toLowerCase();
        return MIMEType === playableMIMEType;
    }
}
