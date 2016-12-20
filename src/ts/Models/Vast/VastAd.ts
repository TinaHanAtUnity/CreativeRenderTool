import { VastCreative } from 'Models/Vast/VastCreative';
import { VastCreativeLinear } from 'Models/Vast/VastCreativeLinear';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';

export class VastAd {

    private _id: string | undefined;
    private _creatives: VastCreative[];
    private _companionAds: VastCreativeCompanionAd[];
    private _errorURLTemplates: string[];
    private _impressionURLTemplates: string[];
    private _wrapperURLs: string[];

    constructor();
    constructor(id?: string, creatives?: VastCreative[], errorURLTemplates?: string[], impressionURLTemplates?: string[], wrapperURLs?: string[], companionAds?: VastCreativeCompanionAd[]) {
        this._id = id || undefined;
        this._creatives = creatives || [];
        this._companionAds = companionAds || [];
        this._errorURLTemplates = errorURLTemplates || [];
        this._impressionURLTemplates = impressionURLTemplates || [];
        this._wrapperURLs = wrapperURLs || [];
    }

    public getId(): string | undefined {
        return this._id;
    }

    public setId(id: string) {
        this._id = id;
    }

    public getCreatives(): VastCreative[] {
        return this._creatives;
    }

    public getCreative(): VastCreative | null {
        if (this.getCreatives() && this.getCreatives().length > 0) {
            return this.getCreatives()[0];
        }
        return null;
    }

    public addCreative(creative: VastCreative) {
        this._creatives.push(creative);
    }

    public getCompanionAds(): VastCreativeCompanionAd[] {
        return this._companionAds;
    }

    public addCompanionAd(companionAd: VastCreativeCompanionAd) {
        this._companionAds.push(companionAd);
    }

    public getErrorURLTemplates(): string[] {
        return this._errorURLTemplates;
    }

    public addErrorURLTemplate(errorURLTemplate: string) {
        this._errorURLTemplates.push(errorURLTemplate);
    }

    public getImpressionURLTemplates(): string[] {
        return this._impressionURLTemplates;
    }

    public addImpressionURLTemplate(impressionURLTemplate: string) {
        this._impressionURLTemplates.push(impressionURLTemplate);
    }

    public getWrapperURL(): string {
        return this._wrapperURLs[0];
    }

    public addWrapperURL(url: string) {
        this._wrapperURLs.push(url);
    }

    public getTrackingEventUrls(eventName: string) {
        const creative = this.getCreative();
        if (creative) {
            if (creative.getTrackingEvents()) {
                return creative.getTrackingEvents()[eventName];
            }
        }
        return null;
    }

    public getDuration(): number | null {
        const creative = this.getCreative();
        if (creative) {
            return creative.getDuration();
        } else {
            return null;
        }
    }

    public getVideoClickThroughURLTemplate(): string | null {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            return creative.getVideoClickThroughURLTemplate();
        }
        return null;
    }

    public getVideoClickTrackingURLTemplates(): string[] {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            return creative.getVideoClickTrackingURLTemplates();
        }
        return [];
    }

    public addVideoClickTrackingURLTemplate(videoClickTrackingURL: string) {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            creative.addVideoClickTrackingURLTemplate(videoClickTrackingURL);
        }
    }
}
