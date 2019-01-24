import { Model } from 'Core/Models/Model';

export interface IPromoCoordinates {
    top: string;
    left: string;
}

export class PromoCoordinates extends Model<IPromoCoordinates> {
    constructor(data: IPromoCoordinates) {
        super('PromoAsset', {
            top: ['string'],
            left: ['string']
        }, data);
    }

    public getDTO() {
        return {
            'top': this.getTop(),
            'left': this.getLeft()
        };
    }

    public getTop(): string {
        return this.get('top');
    }

    public getLeft(): string {
        return this.get('left');
    }
}
