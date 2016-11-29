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
                    const id = companionAd.getId();
                    if (id && id.toLocaleLowerCase() === 'unity_brand_endcard_landscape') {
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
                    const id = companionAd.getId();
                    if (id && id.toLocaleLowerCase() === 'unity_brand_endcard_portrait') {
                        return companionAd.getStaticResourceURL();
                    }
                }
            }
        }

        return null;
    }

    private isPlayableMIMEType(MIMEType: string): boolean {
        const playableMIMEType = 'video/mp4';
        MIMEType = MIMEType.toLowerCase();
        return MIMEType === playableMIMEType;
    }
}
