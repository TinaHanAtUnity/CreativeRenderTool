import { ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
export class VPAIDCampaign extends ProgrammaticCampaign {
    constructor(campaign) {
        super('VPAIDCampaign', Object.assign({}, ProgrammaticCampaign.Schema, { vpaid: ['object'], appCategory: ['string', 'undefined'], appSubcategory: ['string', 'undefined'], advertiserDomain: ['string', 'undefined'], advertiserCampaignId: ['string', 'undefined'], advertiserBundleId: ['string', 'undefined'], buyerId: ['string', 'undefined'] }), campaign);
        this.addCustomTracking(campaign.trackingUrls);
    }
    hasEndScreen() {
        return this.getVPAID().hasEndScreen();
    }
    getCompanionAd() {
        return this.getVPAID().getCompanion();
    }
    getCompanionClickThroughURL() {
        return this.getVPAID().getCompanionClickThroughURL();
    }
    getCompanionLandscapeUrl() {
        return this.getVPAID().getCompanionLandscapeUrl();
    }
    getCompanionPortraitUrl() {
        return this.getVPAID().getCompanionPortraitUrl();
    }
    hasCompanionAd() {
        return this.getVPAID().hasCompanionAd();
    }
    getVPAID() {
        return this.get('vpaid');
    }
    getRequiredAssets() {
        return [];
    }
    getOptionalAssets() {
        return [];
    }
    getTrackingUrlsForEvent(event) {
        return this.getVPAID().getTrackingEventUrls(event);
    }
    getVideoClickTrackingURLs() {
        return this.getVPAID().getVideoClickTrackingURLs();
    }
    getVideoClickThroughURL() {
        return this.getVPAID().getVideoClickThroughURL();
    }
    isConnectionNeeded() {
        return true;
    }
    getImpressionUrls() {
        return this.getVPAID().getImpressionUrls();
    }
    getCategory() {
        return this.get('appCategory');
    }
    getSubcategory() {
        return this.get('appSubcategory');
    }
    getBuyerId() {
        return this.get('buyerId');
    }
    getAdvertiserDomain() {
        return this.get('advertiserDomain');
    }
    getAdvertiserCampaignId() {
        return this.get('advertiserCampaignId');
    }
    getAdvertiserBundleId() {
        return this.get('advertiserBundleId');
    }
    setTrackingUrls(trackingUrls) {
        super.setTrackingUrls(trackingUrls);
        this.addCustomTracking(trackingUrls);
    }
    addCustomTracking(trackingUrls) {
        if (trackingUrls) {
            Object.keys(trackingUrls).forEach((event) => {
                const eventUrls = trackingUrls[event];
                if (eventUrls) {
                    eventUrls.forEach((eventUrl) => {
                        this.getVPAID().addTrackingEventUrl(event, eventUrl);
                    });
                }
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURDYW1wYWlnbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WUEFJRC9Nb2RlbHMvVlBBSURDYW1wYWlnbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQXlCLG9CQUFvQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFnQnhHLE1BQU0sT0FBTyxhQUFjLFNBQVEsb0JBQW9DO0lBRW5FLFlBQVksUUFBd0I7UUFDaEMsS0FBSyxDQUFDLGVBQWUsb0JBQ2Isb0JBQW9CLENBQUMsTUFBTSxJQUMvQixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDakIsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUNwQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ3ZDLGdCQUFnQixFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUN6QyxvQkFBb0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDN0Msa0JBQWtCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQzNDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsS0FDakMsUUFBUSxDQUFDLENBQUM7UUFFYixJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxZQUFZO1FBQ2YsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVNLGNBQWM7UUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDMUMsQ0FBQztJQUVNLDJCQUEyQjtRQUM5QixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0lBQ3pELENBQUM7SUFFTSx3QkFBd0I7UUFDM0IsT0FBTyxJQUFJLENB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