import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';
import { HTML } from 'Models/Assets/HTML';

interface IDisplayInterstitialMarkupUrlCampaign extends ICampaign {
    markupUrl: string;
    tracking: object | undefined;
    resourceAsset: HTML | undefined;
}

export class DisplayInterstitialMarkupUrlCampaign extends Campaign<IDisplayInterstitialMarkupUrlCampaign> {
    constructor(markupUrl: string, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, tracking?: { [eventName: string]: string[] }, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('DisplayInterstitialMarkupUrlCampaign', {
            ... Campaign.Schema,
            markupUrl: ['string'],
            resourceAsset: ['object', 'undefined'],
            tracking: ['object', 'undefined']
        });
        if(cacheTTL) {
            this.set('willExpireAt', Date.now() + cacheTTL * 1000);
        }
        this.set('markupUrl', markupUrl);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('seatId', seatId || undefined);
        this.set('tracking', tracking || undefined);
        this.set('session', session);
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        const tracking = this.get('tracking');
        if (tracking) {
            return tracking[eventName] || [];
        }
        return [];
    }

    public getMarkupUrl(): string {
        return this.get('markupUrl');
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
