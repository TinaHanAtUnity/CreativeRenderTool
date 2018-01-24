import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';

interface IDisplayInterstitialCampaign extends ICampaign {
    dynamicMarkup: string;
    tracking: object | undefined;
}

export class DisplayInterstitialCampaign extends Campaign<IDisplayInterstitialCampaign> {
    constructor(markup: string, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, tracking?: { [eventName: string]: string[] }, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('DisplayInterstitialCampaign', {
            ... Campaign.Schema,
            dynamicMarkup: ['string', 'undefined'],
            tracking: ['object', 'undefined']
        });
        if(cacheTTL) {
            this.set('willExpireAt', Date.now() + cacheTTL * 1000);
        }
        this.set('dynamicMarkup', markup);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('seatId', seatId || undefined);
        this.set('tracking', tracking || undefined);
        this.set('session', session);
    }

    public getDynamicMarkup(): string {
        return this.get('dynamicMarkup');
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        const tracking = this.get('tracking');
        if (tracking) {
            return (<any>tracking)[eventName] || [];
        }
        return [];
    }

    public getRequiredAssets(): Asset[] {
        return [];
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }

    public isConnectionNeeded(): boolean {
        return false;
    }
}
