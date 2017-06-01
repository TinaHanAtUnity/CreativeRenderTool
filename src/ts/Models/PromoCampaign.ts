import { Campaign, ICampaign} from "Models/Campaign";
import { Image } from "Models/Assets/Image";

interface IPromoCampaign extends ICampaign {
    iapProductId: string;
    landscapeImage: Image;
    portraitImage: Image;
    buttonImage: Image;
}

export class PromoCampaign extends Campaign<IPromoCampaign> {
    constructor(campaign: any, gamerId: string, abGroup: number, appStoreId: string) {
        super({
            ... Campaign.Schema,
            iapProductId: ['string'],
            landscapeImage: ['object'],
            portraitImage: ['object'],
            buttonImage: ['object']
        });
        this.set('id', campaign.id);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);

        this.set('landscapeImage', new Image(campaign.endScreenLandscape));
        this.set('portraitImage', new Image(campaign.endScreenPortrait));
        this.set('buttonImage', new Image(campaign.buttonImage));
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
