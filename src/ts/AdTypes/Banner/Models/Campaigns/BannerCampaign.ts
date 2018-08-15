import { Asset } from 'Models/Assets/Asset';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Models/Campaigns/ProgrammaticCampaign';

export interface IBannerCampaign extends IProgrammaticCampaign {
    markup: string | undefined;
}

export class BannerCampaign extends ProgrammaticCampaign<IBannerCampaign> {
    constructor(campaign: IBannerCampaign) {
        super('BannerCampaign', {
            ... ProgrammaticCampaign.Schema,
            markup: ['string', 'undefined']
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

    public getMarkup(): string | undefined {
        return this.get('markup');
    }
}
