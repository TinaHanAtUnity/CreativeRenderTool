import { Model } from 'Core/Models/Model';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';

export interface IAuctionPlacement {
    placementId: string;
    mediaId: string;
    trackingUrls: ICampaignTrackingUrls | undefined;
}

export class AuctionPlacement extends Model<IAuctionPlacement> {
    // todo: once auction v5 is unconditionally adopoted, trackingUrls should no longer be optional
    constructor(placementId: string, mediaId: string, trackingUrls?: ICampaignTrackingUrls) {
        super('AuctionPlacement', {
            placementId: ['string'],
            mediaId: ['string'],
            trackingUrls: ['object', 'undefined']
        });

        this.set('placementId', placementId);
        this.set('mediaId', mediaId);
        this.set('trackingUrls', trackingUrls);
    }

    public getPlacementId(): string {
        return this.get('placementId');
    }

    public getMediaId(): string {
        return this.get('mediaId');
    }

    public getTrackingUrls(): ICampaignTrackingUrls | undefined {
        return this.get('trackingUrls');
    }

    public getDTO(): { [key: string]: any } {
        return {
            placementId: this.getPlacementId(),
            mediaId: this.getMediaId(),
            trackingUrls: this.getTrackingUrls()
        };
    }
}
