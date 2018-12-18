import { Model } from 'Core/Models/Model';
import { PromoAsset, IRawPromoAsset } from 'Promo/Models/PromoAsset';

export interface IPromoOrientationAsset {
    buttonAsset: PromoAsset;
    backgroundAsset: PromoAsset;
}

export interface IRawPromoOrientationAsset {
    button: IRawPromoAsset;
    background: IRawPromoAsset;
}

export class PromoOrientationAsset extends Model<IPromoOrientationAsset> {
    constructor(data: IPromoOrientationAsset) {
        super('PromoOrientationAsset', {
            buttonAsset: ['object'],
            backgroundAsset: ['object']
        }, data);
    }

    public getDTO() {
        return {
            'backgroundAsset': this.getBackgroundAsset(),
            'buttonAsset': this.getButtonAsset()
        };
    }

    public getBackgroundAsset(): PromoAsset {
        return this.get('backgroundAsset');
    }

    public getButtonAsset(): PromoAsset {
        return this.get('buttonAsset');
    }
}