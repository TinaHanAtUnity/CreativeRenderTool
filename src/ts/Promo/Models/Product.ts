import { Model } from 'Core/Models/Model';

export interface IProduct {
    id: string;
    price: string;
    localizedTitle: string;
    productType: string | undefined;
    isoCurrencyCode: string | undefined;
    localizedPrice: number | undefined;
}

export interface IProductData {
    localizedPriceString: string;
    localizedTitle: string;
    productId: string;
    productType: string | undefined;
    isoCurrencyCode: string | undefined;
    localizedPrice: number | undefined;
}

export class Product extends Model<IProduct> {

    constructor(data: IProductData) {
        super('Product', {
            id: ['string'],
            price: ['string'],
            productType: ['string', 'undefined'],
            localizedTitle: ['string'],
            isoCurrencyCode: ['string', 'undefined'],
            localizedPrice: ['number', 'undefined']
        });

        this.set('id', data.productId);
        this.set('price', data.localizedPriceString);
        this.set('localizedTitle', data.localizedTitle);
        if (data.productType) {
            this.set('productType', data.productType);
        } else {
            this.set('productType', undefined);
        }
        if (data.isoCurrencyCode) {
            this.set('isoCurrencyCode', data.isoCurrencyCode);
        } else {
            this.set('isoCurrencyCode', undefined);
        }
        if (data.localizedPrice) {
            this.set('localizedPrice', data.localizedPrice);
        } else {
            this.set('localizedPrice', undefined);
        }
    }

    public getId(): string {
        return this.get('id');
    }

    public getProductType(): string | undefined {
        return this.get('productType');
    }

    public getIsoCurrencyCode(): string | undefined {
        return this.get('isoCurrencyCode');
    }

    public getLocalizedPrice(): number | undefined {
        return this.get('localizedPrice');
    }

    public getPrice(): string {
        return this.get('price');
    }

    public getLocalizedTitle(): string {
        return this.get('localizedTitle');
    }
    public getDTO() {
        return {
            'id': this.getId(),
            'price': this.getPrice(),
            'localizedTitle': this.getLocalizedTitle()
        };
    }
}
