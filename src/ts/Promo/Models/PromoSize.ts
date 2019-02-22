import { Model } from 'Core/Models/Model';

export interface IPromoSize {
    width: string;
    height: string;
}

export class PromoSize extends Model<IPromoSize> {
    constructor(data: IPromoSize) {
        super('PromoAsset', {
            width: ['string'],
            height: ['string']
        }, data);
    }

    public getDTO() {
        return {
            'width': this.getWidth(),
            'height': this.getHeight()
        };
    }

    public getWidth(): string {
        return this.get('width');
    }

    public getHeight(): string {
        return this.get('height');
    }
}
