import { Asset } from 'Ads/Models/Assets/Asset';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
import { VastCreativeStaticResourceCompanionAd } from 'VAST/Models/VastCreativeStaticResourceCompanionAd';
import { VPAID } from 'VPAID/Models/VPAID';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

export interface IVPAIDCampaign extends IProgrammaticCampaign {
    vpaid: VPAID;
    appCategory: string | undefined;
    appSubcategory: string | undefined;
    advertiserDomain: string | undefined;
    advertiserCampaignId: string | undefined;
    advertiserBundleId: string | undefined;
    buyerId: string | undefined;
}

export class VPAIDCampaign extends ProgrammaticCampaign<IVPAIDCampaign> {

    constructor(campaign: IVPAIDCampaign) {
        super('VPAIDCampaign', {
            ... ProgrammaticCampaign.Schema,
            vpaid: ['object'],
            appCategory: ['string', 'undefined'],
            appSubcategory: ['string', 'undefined'],
            advertiserDomain: ['string', 'undefined'],
            advertiserCampaignId: ['string', 'undefined'],
            advertiserBundleId: ['string', 'undefined'],
            buyerId: ['string', 'undefined']
        }, campaign);

        this.addCustomTracking(campaign.trackingUrls);
    }

    public hasEndScreen(): boolean {
        return this.getVPAID().hasEndScreen();
    }

    public getCompanionAd(): VastCreativeStaticResourceCompanionAd | null {
        return this.getVPAID().getCompanion();
    }

    public getCompanionClickThroughURL(): string | null {
        return this.getVPAID().getCompanionClickThroughURL();
    }

    public getCompanionLandscapeUrl(): string | null {
        return this.getVPAID().getCompanionLandscapeUrl();
    }

    public getCompanionPortraitUrl(): string | null {
        return this.getVPAID().getCompanionPortraitUrl();
    }

    public hasCompanionAd(): boolean {
        return this.getVPAID().hasCompanionAd();
    }

    public getVPAID(): VPAID {
        return this.get('vpaid');
    }

    public getRequiredAssets(): Asset[] {
        return [];
    }
    public getOptionalAssets(): Asset[] {
        return [];
    }

    public getTrackingUrlsForEvent(event: TrackingEvent): string[] {
        return this.getVPAID().getTrackingEventUrls(event);
    }

    public getVideoClickTrackingURLs(): string[] {
        return this.getVPAID().getVideoClickTrackingURLs();
    }

    public getVideoClickThroughURL(): string | null {
        return this.getVPAID().getVideoClickThroughURL();
    }

    public isConnectionNeeded(): boolean {
        return true;
    }

    public getImpressionUrls(): string[] | null {
        return this.getVPAID().getImpressionUrls();
    }

    public getCategory(): string | undefined {
        return this.get('appCategory');
    }

    public getSubcategory(): string | undefined {
        return this.get('appSubcategory');
    }

    public getBuyerId(): string | undefined {
        return this.get('buyerId');
    }

    public getAdvertiserDomain(): string | undefined {
        return this.get('advertiserDomain');
    }

    public getAdvertiserCampaignId(): string | undefined {
        return this.get('advertiserCampaignId');
    }

    public getAdvertiserBundleId(): string | undefined {
        return this.get('advertiserBundleId');
    }

    public setTrackingUrls(trackingUrls: ICampaignTrackingUrls) {
        super.setTrackingUrls(trackingUrls);
        this.addCustomTracking(trackingUrls);
    }

    private addCustomTracking(trackingUrls: ICampaignTrackingUrls) {
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
