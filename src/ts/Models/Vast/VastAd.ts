import { VastCreative } from 'Models/Vast/VastCreative';
import { VastCreativeLinear } from 'Models/Vast/VastCreativeLinear';

export class VastAd {

    private _id: string | undefined;
    private _creatives: VastCreative[];
    private _errorURLTemplates: string[];
    private _impressionURLTemplates: string[];
    private _wrapperURLs: string[];

    constructor();
    constructor(id?: string, creatives?: VastCreative[], errorURLTemplates?: string[], impressionURLTemplates?: string[], wrapperURLs?: string[]) {
        this._id = id || undefined;
        this._creatives = creatives || [];
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
        let creative = this.getCreative();
        if (creative) {
            if (creative.getTrackingEvents()) {
                return creative.getTrackingEvents()[eventName];
            }
        }
        return null;
    }

    public getDuration(): number | null {
        let creative = this.getCreative();
        if (creative) {
            return creative.getDuration();
        } else {
            return null;
        }
    }

    public getVideoClickThroughURLTemplate(): string | null {
        let creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            return creative.getVideoClickThroughURLTemplate();
        }
        return null;
    }

    public getVideoClickTrackingURLTemplates(): string[] {
        let creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            return creative.getVideoClickTrackingURLTemplates();
        }
        return [];
    }

    public addVideoClickTrackingURLTemplate(videoClickTrackingURL: string) {
        let creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            creative.addVideoClickTrackingURLTemplate(videoClickTrackingURL);
        }
    }
}
