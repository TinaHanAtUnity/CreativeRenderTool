import { Model } from 'Core/Models/Model';

export interface IAuctionPlacement {
    placementId: string;
    mediaId: string;
    trackingUrls: { [eventName: string]: string[] } | undefined;
}

export class AuctionPlacement extends Model<IAuctionPlacement> {
    constructor(placementId: string, mediaId: string, trackingUrls?: { [eventName: string]: string[] }) {
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

    public getTrackingUrls(): { [eventName: string]: string[] } | undefined {
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
