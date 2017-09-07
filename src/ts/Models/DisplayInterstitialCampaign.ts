import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';

interface IDisplayInterstitialCampaign extends ICampaign {
    dynamicMarkup: string;
    clickThroughUrl: string | undefined;
    tracking: object | undefined;
}

export class DisplayInterstitialCampaign extends Campaign<IDisplayInterstitialCampaign> {
    constructor(markup: string, gamerId: string, abGroup: number, tracking?: { [eventName: string]: string[] }, clickThroughUrl?: string, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('ProgrammaticImageCampaign', {
            ... Campaign.Schema,
            dynamicMarkup: ['string'],
            clickThroughUrl: ['string', 'undefined'],
            tracking: ['object', 'undefined']
        });
        this.set('dynamicMarkup', markup);
        this.set('clickThroughUrl', clickThroughUrl || undefined);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('seatId', seatId || undefined);
        this.set('tracking', tracking || undefined);
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
}
