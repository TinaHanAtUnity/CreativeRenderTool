import { Model } from 'Models/Model';

export interface IProduct {
    id: string;
    price: string;
    description: string;
}

export interface IProductData {
    localizedPriceString: string;
    localizedTitle: string;
    productId: string;
}

export class Product extends Model<IProduct> {

    constructor(data: IProductData) {
        super('Product', {
            id: ['string'],
            price: ['string'],
            description: ['string']
        });

        this.set('id', data.productId);
        this.set('price', data.localizedPriceString);
        this.set('description', data.localizedTitle);
    }

    public getId(): string {
        return this.get('id');
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
