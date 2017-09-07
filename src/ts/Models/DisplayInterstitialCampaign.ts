import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';

interface IDisplayInterstitialCampaign extends ICampaign {
    dynamicMarkup: string;
    clickThroughUrl: string | undefined;
}

export class DisplayInterstitialCampaign extends Campaign<IDisplayInterstitialCampaign> {
    constructor(markup: string, gamerId: string, abGroup: number, clickThroughUrl?: string, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('ProgrammaticImageCampaign', {
            ... Campaign.Schema,
            dynamicMarkup: ['string'],
            clickThroughUrl: ['string', 'undefined']
        });
        this.set('dynamicMarkup', markup);
        this.set('clickThroughUrl', clickThroughUrl || undefined);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('seatId', seatId || undefined);
    }

    public getDynamicMarkup(): string {
        return this.get('dynamicMarkup');
    }

    public getClickThroughUrl(): string | undefined {
        return this.get('clickThroughUrl');
    }

    public getRequiredAssets(): Asset[] {
        return [];
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }
}
