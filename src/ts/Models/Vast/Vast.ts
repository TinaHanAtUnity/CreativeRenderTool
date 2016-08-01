import { VastAd } from 'Models/Vast/VastAd';

export class Vast {

    private _ads: VastAd[];
    private _errorURLTemplates: string[];
    private _additionalTrackingEvents: { [eventName: string]: string[] };

    constructor(ads: VastAd[], errorURLTemplates: any[], additionalTrackingEvents: { [eventName: string]: string[] }) {
        this._ads = ads;
        this._errorURLTemplates = errorURLTemplates;
        this._additionalTrackingEvents = additionalTrackingEvents;
    }

    public getAds(): VastAd[] {
        return this._ads;
    }

    public getErrorURLTemplates(): string[] {
        let ad = this.getAd();
        if (ad) {
            let adErrorUrls = ad.getErrorURLTemplates();
            if (adErrorUrls instanceof Array) {
                return adErrorUrls.concat(this._errorURLTemplates || []);
            }
        }
        return this._errorURLTemplates;
    }

    public getAd(): VastAd {
        if (this.getAds() && this.getAds().length > 0) {
            return this.getAds()[0];
        }
        return null;
    }

    public getVideoUrl(): string {
        let ad = this.getAd();
        if (ad) {
            for (let creative of ad.getCreatives()) {
                for (let mediaFile of creative.getMediaFiles()) {
                    let playable = this.isPlayableMIMEType(mediaFile.getMIMEType());
                    if (mediaFile.getFileURL() && playable) {
                        return mediaFile.getFileURL();
                    }
                }
            }
        }

        return null;
    }

    public getImpressionUrls(): string[] {
        let ad = this.getAd();
        if (ad) {
            return ad.getImpressionURLTemplates();
        }
        return [];
    }

    public getTrackingEventUrls(eventName: string): string[] {
        let ad = this.getAd();
        if (ad) {
            let adTrackingEventUrls = ad.getTrackingEventUrls(eventName);
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
        return null;
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

    public getDuration(): number {
        let ad = this.getAd();
        if (ad) {
            return ad.getDuration();
        }
        return null;
    }

    public getWrapperURL(): string {
        let ad = this.getAd();
        if (ad) {
            return ad.getWrapperURL();
        }
        return null;
    }

    public getVideoClickThroughURL(): string {
        let ad = this.getAd();
        if (ad) {
            return ad.getVideoClickThroughURLTemplate();
        }
        return null;
    }

    public getVideoClickTrackingURLs(): string[] {
        let ad = this.getAd();
        if (ad) {
            return ad.getVideoClickTrackingURLTemplates();
        }
        return null;
    }

    public addVideoClickTrackingURLTemplate(videoClickTrackingURL: string) {
        let ad = this.getAd();
        if (ad) {
            ad.addVideoClickTrackingURLTemplate(videoClickTrackingURL);
        }
    }

    private isPlayableMIMEType(MIMEType: string): boolean {
        let playableMIMEType = 'video/mp4';
        return MIMEType === playableMIMEType;
    }
}
