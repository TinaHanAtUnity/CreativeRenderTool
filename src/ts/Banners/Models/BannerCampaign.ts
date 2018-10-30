import { Asset } from 'Ads/Models/Assets/Asset';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';

export interface IBannerCampaign extends IProgrammaticCampaign {
    markup: string | undefined;
    width: number;
    height: number;
}

export class BannerCampaign extends ProgrammaticCampaign<IBannerCampaign> {
    constructor(campaign: IBannerCampaign) {
        super('BannerCampaign', {
            ... ProgrammaticCampaign.Schema,
            markup: ['string', 'undefined'],
            width: ['number'],
            height: ['number']
        }, campaign);

        if (campaign.willExpireAt) {
            this.set('willExpireAt', Date.now() + (campaign.willExpireAt * 1000));
        } else {
            this.set('willExpireAt', undefined);
        }
    }
    public getRequiredAssets(): Asset[] {
        return [];
    }
    public getOptionalAssets(): Asset[] {
        return [];
    }
    public isConnectionNeeded(): boolean {
        return true;
    }
    public getWidth(): number {
        return this.get('width');
    }
    public getHeight(): number {
        return this.get('height');
    }
    public getMarkup(): string | undefined {
        return this.get('markup');
    }
}
