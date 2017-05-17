import { Campaign, ICampaign} from "Models/Campaign";

interface IPromoCampaign extends ICampaign {
    appStoreId: string;
}

export class PromoCampaign extends Campaign<IPromoCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number, appStoreId: string) {
        super({
            ... Campaign.Schema,
            appStoreId: ['string']
        });
        this.set('id', campaign.id);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
    }
    public getRequiredAssets() {
        return [];
    }

    public getOptionalAssets() {
        return [];
    }
}
