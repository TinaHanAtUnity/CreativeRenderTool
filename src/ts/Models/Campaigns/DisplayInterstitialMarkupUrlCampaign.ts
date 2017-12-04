import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';
import { HTML } from 'Models/Assets/HTML';

interface IDisplayInterstitialCampaign extends ICampaign {
    tracking: object | undefined;
    resourceAsset: HTML | undefined;
}

export class DisplayInterstitialMarkupUrlCampaign extends Campaign<IDisplayInterstitialCampaign> {
    constructor(markupUrl: string, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, tracking?: { [eventName: string]: string[] }, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('DisplayInterstitialMarkupUrlCampaign', {
            ... Campaign.Schema,
            resourceAsset: ['object', 'undefined'],
            tracking: ['object', 'undefined']
        });
        if(cacheTTL) {
            this.set('willExpireAt', Date.now() + cacheTTL * 1000);
        }
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        const tracking = this.get('tracking');
        if (tracking) {
            return tracking[eventName] || [];
        }
        return [];
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }

    public isConnectionNeeded(): boolean {
        return false;
    }

    public getRequiredAssets(): Asset[] {
        return [];
    }
}
