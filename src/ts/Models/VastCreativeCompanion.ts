import { VastCreative } from 'Models/VastCreative';
import { VastCompanionAd } from 'Models/VastCompanionAd';
import { VastMediaFile } from 'Models/VastMediaFile';

export class VastCreativeCompanion extends VastCreative {

    private _variations: VastCompanionAd[];
    private _videoClickTrackingURLTemplates: string[];

    constructor();
    constructor(variations?: any[], videoClickTrackingURLTemplates?: string[]) {
        super('companion');
        this._variations = variations || [];
        this._videoClickTrackingURLTemplates = videoClickTrackingURLTemplates || [];
    }

    public addVariation(variation: VastCompanionAd) {
        this._variations.push(variation);
    }

    public getMediaFiles(): VastMediaFile[] {
        return [];
    }

    public getDuration(): number {
        return 0;
    }

}
