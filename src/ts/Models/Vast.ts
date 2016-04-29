import { VastAd } from 'Models/VastAd';
import { VastMediaFile } from 'Models/VastMediaFile';
import { VastCreativeLinear } from 'Models/VastCreativeLinear';

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
                    if (mediaFile.getFileURL()) {
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
        return null;
    }

    public getTrackingEventUrls(eventName: string) {
        let ad = this.getAd();
        if (ad) {
            return ad.getTrackingEventUrls(eventName).concat(this._additionalTrackingEvents[eventName] || []);
        }
        return null;
    }

    public getDuration(): number {
        let ad = this.getAd();
        if (ad) {
            return ad.getDuration();
        }
        return null;
    }

}
