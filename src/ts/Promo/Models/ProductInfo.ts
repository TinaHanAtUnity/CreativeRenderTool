import { Model } from 'Core/Models/Model';

export enum ProductInfoType {
    VIRTUAL                = 'VIRTUAL',
    PREMIUM                = 'PREMIUM'
}

export interface IProductInfo {
    productId: string;
    type: ProductInfoType;
    quantity: number;
}

export class ProductInfo extends Model<IProductInfo> {
    constructor(data: IProductInfo) {
        super('ProductInfo', {
            productId: ['string'],
            type: ['string'],
            quantity: ['number', 'undefined']
        }, data);
    }

    public getDTO() {
        return {
            'itemId': this.getId(),
            'type': this.getType(),
            'quantity': this.getQuantity()
        };
    }

    public getId(): string {
        return this.get('productId');
    }

    public getType(): ProductInfoType {
        return this.get('type');
    }

    public getQuantity(): number {
        return this.get('quantity');
    }
}
