import { ICampaign, Campaign } from 'Models/Campaign';
import { VPAID } from 'Models/VPAID/VPAID';
import { IAsset, Asset } from 'Models/Assets/Asset';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';

export interface IVPAIDCampaign extends ICampaign {
    vpaid: VPAID;
    tracking: any | undefined;
}

export class VPAIDCampaign extends Campaign<IVPAIDCampaign> {

    constructor(campaign: IVPAIDCampaign) {
        super('VPAIDCampaign', {
            ... Campaign.Schema,
            vpaid: ['object'],
            tracking: ['object', 'undefined']
        });
        this.set('vpaid', campaign.vpaid);
        this.set('session', campaign.session);

        this.set('id', campaign.id);
        this.set('gamerId', campaign.gamerId);
        this.set('abGroup', campaign.abGroup);
        this.set('useWebViewUserAgentForTracking', campaign.useWebViewUserAgentForTracking);
        this.set('willExpireAt', campaign.willExpireAt);
        this.set('adType', campaign.adType || undefined);
        this.set('correlationId', campaign.correlationId || undefined);
        this.set('creativeId', campaign.creativeId || undefined);
        this.set('appCategory', campaign.appCategory || undefined);
        this.set('appSubCategory', campaign.appSubCategory || undefined);
        this.set('seatId', campaign.seatId || undefined);

        this.addTrackingToVAST(campaign.tracking);
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

    public getRequiredAssets(): Array<Asset<IAsset>> {
        return [];
    }
    public getOptionalAssets(): Array<Asset<IAsset>> {
        return [];
    }

    public getTrackingEventUrls(eventName: string): string[] {
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
