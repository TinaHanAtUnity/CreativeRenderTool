import { Campaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast/Vast';

export class VastCampaign extends Campaign {

    private _cacheTTL: number;
    private _campaignId: string;
    private _vast: Vast;

    constructor(vast: Vast, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number) {
        super({}, gamerId, abGroup);
        this._campaignId = campaignId;
        this._vast = vast;
        this._cacheTTL = cacheTTL || 3600;
    }

    public getId(): string {
        return this._campaignId;
    }

    public getVast(): Vast {
        return this._vast;
    }

    public getVideoUrl(): string {
        const videoUrl = super.getVideoUrl();
        if (videoUrl) {
            return videoUrl;
        } else {
            return this._vast.getVideoUrl();
        }
    }

    public getCacheTTL(): number {
        return this._cacheTTL;
    }

}
