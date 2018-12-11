import { Model } from 'Core/Models/Model';
import { Image } from 'Ads/Models/Assets/Image';
import { Font, IFont } from 'Ads/Models/Assets/Font';

export interface IPromoAsset {
    image: Image;
    font: Font | undefined;
}

export interface IRawPromoAsset {
    url: string;
    font: IFont | undefined;
}

export class PromoAsset extends Model<IPromoAsset> {
    constructor(data: IPromoAsset) {
        super('PromoAsset', {
            image: ['object'],
            font: ['object', 'undefined']
        }, data);
    }

    public getDTO() {
        return {
            'image': this.getImage(),
            'font': this.getFont()
        };
    }

    public getImage(): Image {
        return this.get('image');
    }

    public getFont(): Font | undefined {
        return this.get('font');
    }
}
