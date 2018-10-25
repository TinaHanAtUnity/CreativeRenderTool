import { Model } from 'Core/Models/Model';

export interface IAuctionPlacement {
    placementId: string;
    mediaId: string;
    trackingId: string | undefined;
}

export class AuctionPlacement extends Model<IAuctionPlacement> {
    constructor(placementId: string, mediaId: string, trackingId?: string) {
        super('AuctionPlacement', {
            placementId: ['string'],
            mediaId: ['string'],
            trackingId: ['string', 'undefined']
        });

        this.set('placementId', placementId);
        this.set('mediaId', mediaId);
        this.set('trackingId', trackingId);
    }

    public getPlacementId(): string {
        return this.get('placementId');
    }

    public getMediaId(): string {
        return this.get('mediaId');
    }

    public getTrackingId(): string | undefined {
        return this.get('trackingId');
    }

    public getDTO(): { [key: string]: any } {
        return {
            placementId: this.getPlacementId(),
            mediaId: this.getMediaId(),
            trackingId: this.getTrackingId()
        };
    }
}
