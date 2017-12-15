import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';

interface IDisplayInterstitialCampaign extends ICampaign {
    dynamicMarkup: string | undefined;
    clickThroughUrl: string | undefined;
    tracking: object | undefined;
    markupUrl: string | undefined;
    markupBaseUrl: string | undefined;
}

export class DisplayInterstitialCampaign extends Campaign<IDisplayInterstitialCampaign> {
    constructor(markup: string | undefined, markupUrl: string | undefined, markupBaseUrl: string | undefined, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, tracking?: { [eventName: string]: string[] }, clickThroughUrl?: string, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('DisplayInterstitialCampaign', {
            ... Campaign.Schema,
            dynamicMarkup: ['string', 'undefined'],
            clickThroughUrl: ['string', 'undefined'],
            tracking: ['object', 'undefined'],
            markupUrl: ['string', 'undefined'],
            markupBaseUrl: ['string', 'undefined']
        });
        if(cacheTTL) {
            this.set('willExpireAt', Date.now() + cacheTTL * 1000);
        }
        this.set('dynamicMarkup', markup || undefined);
        this.set('markupUrl', markupUrl || undefined);
        this.set('markupBaseUrl', markupBaseUrl || undefined);
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

    public getDynamicMarkup(): string | undefined {
        return this.get('dynamicMarkup');
    }

    public getMarkupUrl(): string | undefined {
        return this.get('markupUrl');
    }

    public getMarkupBaseUrl(): string | undefined {
        return this.get('markupBaseUrl');
    }

    public getClickThroughUrl(): string | undefined {
        return this.get('clickThroughUrl');
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
