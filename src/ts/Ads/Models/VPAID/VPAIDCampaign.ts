import { VPAID } from 'Ads/Models/VPAID/VPAID';
import { Asset } from 'Ads/Models/Assets/Asset';
import { VastCreativeCompanionAd } from 'Ads/Models/Vast/VastCreativeCompanionAd';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';

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

        this.addTrackingToVAST(campaign.trackingUrls);
    }

    public hasEndScreen(): boolean {
        return this.getVPAID().hasEndScreen();
    }

    public getCompanionAd(): VastCreativeCompanionAd | null {
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

    public getRequiredAssets(): Array<Asset> {
        return [];
    }
    public getOptionalAssets(): Array<Asset> {
        return [];
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        return this.getVPAID().getTrackingEventUrls(eventName);
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

    private addTrackingToVAST(tracking: any) {
        if (tracking) {
            for (const trackingEventName in tracking) {
                if (tracking.hasOwnProperty(trackingEventName)) {
                    const urls = tracking[trackingEventName];
                    if (urls) {
                        urls.forEach((url: string) => {
                            this.getVPAID().addTrackingEventUrl(trackingEventName, url);
                        });
                    }
                }
            }
        }
    }
}
