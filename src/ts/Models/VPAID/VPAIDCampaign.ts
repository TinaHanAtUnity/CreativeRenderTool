import { ICampaign, Campaign } from 'Models/Campaign';
import { VPAID } from 'Models/VPAID/VPAID';
import { IAsset, Asset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';

interface IVPAIDCampaign extends ICampaign {
    vpaid: VPAID;
}

export class VPAIDCampaign extends Campaign<IVPAIDCampaign> {

    constructor(vpaid: VPAID, session: Session, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any, adType?: string, creativeId?: string, seatId?: number, correlationId?: string, appCategory?: string, appSubCategory?: string) {
        super('VPAIDCampaign', {
            ... Campaign.Schema,
            vpaid: ['object']
        });
        this.set('vpaid', vpaid);
        this.set('session', session);

        this.set('id', campaignId);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
        const timeout = cacheTTL || 3600;
        this.set('willExpireAt', Date.now() + timeout * 1000);
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('appCategory', appCategory || undefined);
        this.set('appSubCategory', appSubCategory || undefined);
        this.set('seatId', seatId || undefined);

        this.addTrackingToVAST(tracking);
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
