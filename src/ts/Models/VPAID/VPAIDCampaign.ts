import { ICampaign, Campaign } from "Models/Campaign";
import { VPAID } from "Models/VPAID/VPAID";
import { IAsset, Asset } from "Models/Assets/Asset";

interface IVPAIDCampaign extends ICampaign {
    vpaid: VPAID;
}

export class VPAIDCampaign extends Campaign<IVPAIDCampaign> {

    constructor(vpaid: VPAID, campaignId: string, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('VPAIDCampaign', {
            ... Campaign.Schema,
            vpaid: ['object']
        });
        this.set('vpaid', vpaid);

        this.set('id', campaignId);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
        const timeout = cacheTTL || 3600;
        this.set('willExpireAt', Date.now() + timeout * 1000);
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('seatId', seatId || undefined);

        this.addTrackingToVAST(tracking);
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
