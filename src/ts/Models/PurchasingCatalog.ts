import { Model } from 'Models/Model';

export interface IProduct {
    id: string;
    price: string;
    description: string;
}

export class Product extends Model<IProduct> {

    constructor(data: any) {
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

interface IPurchasingCatalog {
    products: Product[];
}

export class PurchasingCatalog extends Model<IPurchasingCatalog> {
    constructor(data: IProduct[]) {
        super('PurchasingCatalog', {
            products: ['array']
        });

        const products: Product[] = [];
        for (const product of data) {
            products.push(new Product(product));
        }
        this.set('products', products);
    }

    public getProducts(): Product[] {
        return this.get('products');
    }

    public getDTO() {
        return {
            'purchases': this.getProducts()
        };
    }
}
