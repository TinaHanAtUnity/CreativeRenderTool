import { Campaign } from 'Models/Campaign';
import { Vast } from 'Models/Vast';

export class VastCampaign extends Campaign {

    private _vast: Vast;

    constructor(vast: Vast, gamerId: string, abGroup: number) {
        super({}, gamerId, abGroup);
        this._vast = vast;
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

}