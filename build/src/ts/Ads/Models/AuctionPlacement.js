import { Model } from 'Core/Models/Model';
export class AuctionPlacement extends Model {
    // todo: once auction v5 is unconditionally adopoted, trackingUrls should no longer be optional
    constructor(placementId, mediaId, trackingUrls) {
        super('AuctionPlacement', {
            placementId: ['string'],
            mediaId: ['string'],
            trackingUrls: ['object', 'undefined']
        });
        this.set('placementId', placementId);
        this.set('mediaId', mediaId);
        this.set('trackingUrls', trackingUrls);
    }
    getPlacementId() {
        return this.get('placementId');
    }
    getMediaId() {
        return this.get('mediaId');
    }
    getTrackingUrls() {
        return this.get('trackingUrls');
    }
    getDTO() {
        return {
            placementId: this.getPlacementId(),
            mediaId: this.getMediaId(),
            trackingUrls: this.getTrackingUrls()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVjdGlvblBsYWNlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTW9kZWxzL0F1Y3Rpb25QbGFjZW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUzFDLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxLQUF3QjtJQUMxRCwrRkFBK0Y7SUFDL0YsWUFBWSxXQUFtQixFQUFFLE9BQWUsRUFBRSxZQUFvQztRQUNsRixLQUFLLENBQUMsa0JBQWtCLEVBQUU7WUFDdEIsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNuQixZQUFZLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDO1NBQ3hDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTSxjQUFjO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sVUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sZUFBZTtRQUNsQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLE1BQU07UUFDVCxPQUFPO1lBQ0gsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDbEMsT0FBTyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDMUIsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7U0FDdkMsQ0FBQztJQUNOLENBQUM7Q0FDSiJ9