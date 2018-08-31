import { Model } from 'Common/Models/Model';

export interface IProduct {
    id: string;
    price: string;
    description: string;
    productType: string | undefined;
}

export interface IProductData {
    localizedPriceString: string;
    localizedTitle: string;
    productId: string;
    productType: string | undefined;
}

export class Product extends Model<IProduct> {

    constructor(data: IProductData) {
        super('Product', {
            id: ['string'],
            price: ['string'],
            productType: ['string', 'undefined'],
            description: ['string']
        });

        this.set('id', data.productId);
        this.set('price', data.localizedPriceString);
        this.set('description', data.localizedTitle);
        this.set('productType', data.productType);
    }

    public getId(): string {
        return this.get('id');
    }

    public getProductType(): string | undefined {
        return this.get('productType');
    }

    public getPrice(): string {
        return this.get('price');
    }

    public getDescription(): string {
        return this.get('description');
    }
    public getDTO() {
        return {
            'id': this.getId(),
            'price': this.getPrice(),
            'description': this.getDescription()
        };
    }
}
