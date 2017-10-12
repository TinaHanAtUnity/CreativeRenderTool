import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';

interface IGlyphCampaign extends ICampaign {
    dynamicMarkup: string;
    clickThroughUrl: string | undefined;
    tracking: object | undefined;
}

export class GlyphCampaign extends Campaign<IGlyphCampaign> {
    constructor(markup: string, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, tracking?: { [eventName: string]: string[] }, clickThroughUrl?: string, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('GlyphCampaign', {
            ... Campaign.Schema,
            dynamicMarkup: ['string'],
            clickThroughUrl: ['string', 'undefined'],
            tracking: ['object', 'undefined']
        });
        if(cacheTTL) {
            this.set('willExpireAt', Date.now() + cacheTTL * 1000);
        }
        this.set('dynamicMarkup', markup);
        this.set('clickThroughUrl', clickThroughUrl || undefined);
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

    public getClickThroughUrl(): string | undefined {
        return this.get('clickThroughUrl');
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        const tracking = this.get('tracking');
        if (tracking) {
            return tracking[eventName] || [];
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
