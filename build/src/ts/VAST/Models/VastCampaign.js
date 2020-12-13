import { Video } from 'Ads/Models/Assets/Video';
import { ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
export class VastCampaign extends ProgrammaticCampaign {
    constructor(campaign) {
        super('VastCampaign', Object.assign({}, ProgrammaticCampaign.Schema, { vast: ['object'], video: ['object'], hasStaticEndscreen: ['boolean'], hasIframeEndscreen: ['boolean'], hasHtmlEndscreen: ['boolean'], staticPortrait: ['object', 'undefined'], staticLandscape: ['object', 'undefined'], appCategory: ['string', 'undefined'], appSubcategory: ['string', 'undefined'], advertiserDomain: ['string', 'undefined'], advertiserCampaignId: ['string', 'undefined'], advertiserBundleId: ['string', 'undefined'], buyerId: ['string', 'undefined'], impressionUrls: ['array'], isMoatEnabled: ['boolean', 'undefined'], isOMEnabled: ['boolean'], omVendors: ['array'] }), campaign);
        this.addCustomTracking(campaign.trackingUrls);
    }
    getVast() {
        return this.get('vast');
    }
    getVideo() {
        if (!this.get('video')) {
            this.set('video', new Video(this.get('vast').getVideoUrl(), this.getSession()));
        }
        return this.get('video');
    }
    getRequiredAssets() {
        return [
            this.get('video')
        ];
    }
    getOptionalAssets() {
        return [];
    }
    hasStaticEndscreen() {
        return this.get('hasStaticEndscreen');
    }
    hasIframeEndscreen() {
        return this.get('hasIframeEndscreen');
    }
    hasHtmlEndscreen() {
        return this.get('hasHtmlEndscreen');
    }
    getStaticLandscape() {
        return this.get('staticLandscape');
    }
    getStaticPortrait() {
        return this.get('staticPortrait');
    }
    isConnectionNeeded() {
        return false;
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
    getImpressionUrls() {
        return this.get('impressionUrls');
    }
    isMoatEnabled() {
        return this.get('isMoatEnabled');
    }
    isOMEnabled() {
        return this.get('isOMEnabled');
    }
    getOMVendors() {
        return this.get('omVendors');
    }
    setOmEnabled(isOMEnabled) {
        this.set('isOMEnabled', isOMEnabled);
    }
    setOMVendors(omVendors) {
        this.set('omVendors', omVendors);
    }
    setTrackingUrls(trackingUrls) {
        super.setTrackingUrls(trackingUrls);
        this.addCustomTracking(trackingUrls);
    }
    getDTO() {
        let staticPortrait;
        const staticPortraitAsset = this.get('staticPortrait');
        if (staticPortraitAsset) {
            staticPortrait = staticPortraitAsset.getDTO();
        }
        let staticLandscape;
        const staticLandscapeAsset = this.get('staticLandscape');
        if (staticLandscapeAsset) {
            staticLandscape = staticLandscapeAsset.getDTO();
        }
        return {
            'campaign': super.getDTO(),
            'vast': this.getVast().getDTO(),
            'video': this.getVast().getDTO(),
            'hasStaticEndscreen': this.hasStaticEndscreen(),
            'hasIframeEndscreen': this.hasIframeEndscreen(),
            'hasHtmlEndscreen': this.hasHtmlEndscreen(),
            'staticPortrait': staticPortrait,
            'staticLandscape': staticLandscape
        };
    }
    addCustomTracking(trackingUrls) {
        if (trackingUrls) {
            Object.keys(trackingUrls).forEach((event) => {
                const eventUrls = trackingUrls[event];
                if (eventUrls) {
                    eventUrls.forEach((eventUrl) => {
                        this.getVast().addTrackingEventUrl(event, eventUrl);
                    });
                }
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENhbXBhaWduLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvTW9kZWxzL1Zhc3RDYW1wYWlnbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDaEQsT0FBTyxFQUF5QixvQkFBb0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBd0J4RyxNQUFNLE9BQU8sWUFBYSxTQUFRLG9CQUFtQztJQUNqRSxZQUFZLFFBQXVCO1FBQy9CLEtBQUssQ0FBQyxjQUFjLG9CQUNaLG9CQUFvQixDQUFDLE1BQU0sSUFDL0IsSUFBSSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ2hCLEtBQUssRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUNqQixrQkFBa0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUMvQixrQkFBa0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUMvQixnQkFBZ0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUM3QixjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ3ZDLGVBQWUsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDeEMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUNwQyxjQUFjLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQ3ZDLGdCQUFnQixFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUN6QyxvQkFBb0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDN0Msa0JBQWtCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQzNDLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsRUFDaEMsY0FBYyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQ3pCLGFBQWEsRUFBRSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsRUFDdkMsV0FB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