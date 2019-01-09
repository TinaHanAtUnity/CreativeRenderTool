import { Model } from 'Core/Models/Model';
import { Image } from 'Ads/Models/Assets/Image';
import { Font, IFont } from 'Ads/Models/Assets/Font';
import { IPromoCoordinates, PromoCoordinates } from 'Promo/Models/PromoCoordinatesAsset';
import { IPromoSize, PromoSize } from 'Promo/Models/PromoSize';

export interface IPromoAsset {
    image: Image;
    font: Font | undefined;
    coordinates: PromoCoordinates | undefined;
    size: PromoSize;
}

export interface IRawPromoAsset {
    url: string;
    font: IFont | undefined;
    coordinates: IPromoCoordinates | undefined;
    size: IPromoSize;
}

export class PromoAsset extends Model<IPromoAsset> {
    constructor(data: IPromoAsset) {
        super('PromoAsset', {
            image: ['object'],
            font: ['object', 'undefined'],
            coordinates: ['object', 'undefined'],
            size: ['object']
        }, data);
    }

    public getDTO() {
        return {
            'image': this.getImage(),
            'font': this.getFont(),
            'coordinates': this.getCoordinates(),
            'size': this.getSize()
        };
    }

    public getImage(): Image {
        return this.get('image');
    }

    public getFont(): Font | undefined {
        return this.get('font');
    }

    public getCoordinates(): PromoCoordinates | undefined {
        return this.get('coordinates');
    }

    public getSize(): PromoSize {
        return this.get('size');
    }
}
