import { VastCreative } from 'Models/Vast/VastCreative';

export class VastAd {

    private _id: string;
    private _creatives: VastCreative[];
    private _errorURLTemplates: string[];
    private _impressionURLTemplates: string[];
    private _wrapperURLs: string[];

    constructor();
    constructor(id?: string, creatives?: VastCreative[], errorURLTemplates?: string[], impressionURLTemplates?: string[], wrapperURLs?: string[]) {
        this._id = id;
        this._creatives = creatives || [];
        this._errorURLTemplates = errorURLTemplates || [];
        this._impressionURLTemplates = impressionURLTemplates || [];
        this._wrapperURLs = wrapperURLs || [];
    }

    public getId(): string {
        return this._id;
    }

    public setId(id: string) {
        this._id = id;
    }

    public getCreatives(): VastCreative[] {
        return this._creatives;
    }

    public getCreative(): VastCreative {
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

    public getDuration(): number {
        let creative = this.getCreative();
        if (creative) {
            return creative.getDuration();
        } else {
            return null;
        }
    }

}
