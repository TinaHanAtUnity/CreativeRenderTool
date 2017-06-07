import { Campaign, ICampaign} from "Models/Campaign";
import { Image } from "Models/Assets/Image";

interface IPromoCampaign extends ICampaign {
    iapProductId: string;
    landscapeImage: Image;
    portraitImage: Image;
    buttonImage: Image;
}

export class PromoCampaign extends Campaign<IPromoCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number) {
        super('PromoCampaign', {
            ... Campaign.Schema,
            iapProductId: ['string'],
            landscapeImage: ['object'],
            portraitImage: ['object'],
            buttonImage: ['object']
        });
        this.set('id', campaign.id);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);

        this.set('iapProductId', campaign.iapProductId);
        this.set('landscapeImage', new Image(campaign.landscapeUrl));
        this.set('portraitImage', new Image(campaign.portraitUrl));
        this.set('buttonImage', new Image(campaign.buttonUrl));
    }

    public getPortrait(): Image {
        return this.get('portraitImage');
    }

    public getLandscape(): Image {
        return this.get('landscapeImage');
    }

    public getButton(): Image {
        return this.get('buttonImage');
    }

    public getIapProductId(): string {
        return this.get('iapProductId');
    }

    public getRequiredAssets() {
        return [
            this.getLandscape(),
            this.getPortrait(),
            this.getButton()
        ];
    }

    public getOptionalAssets() {
        return [];
    }
}
