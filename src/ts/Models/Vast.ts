import { VastAd } from 'Models/VastAd';
import { VastMediaFile } from 'Models/VastMediaFile';
import { VastCreativeLinear } from 'Models/VastCreativeLinear';

export class Vast {

    private _ads: VastAd[];
    private _errorURLTemplates: string[];
    private _gamerId: string;
    private _abGroup: number;

    constructor(ads: VastAd[], errorURLTemplates: any[], gamerId: string, abGroup: number) {
        this._ads = ads;
        this._errorURLTemplates = errorURLTemplates;
        this._gamerId = gamerId;
        this._abGroup = abGroup;
    }

    public getAds(): VastAd[] {
        return this._ads;
    }

    public getErrorURLTemplates(): string[] {
        return this._errorURLTemplates;
    }

    public getGamerId(): string {
        return this._gamerId;
    }

    public getAbGroup(): number {
        return this._abGroup;
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
            return ad.getTrackingEventUrls(eventName);
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
