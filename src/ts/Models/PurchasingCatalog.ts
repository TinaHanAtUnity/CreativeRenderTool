import { Model } from 'Models/Model';
import { Product } from 'Models/Product';

interface IPurchasingCatalog {
    products: { [productId: string]: Product };
}

export class PurchasingCatalog extends Model<IPurchasingCatalog> {
    constructor(data: any[]) {
        super('PurchasingCatalog', {
            products: ['object']
        });

        const products: { [productId: string]: Product } = {};
        for (const productData of data) {
            const product = new Product(productData);
            products[product.getId()] = product;
        }
        this.set('products', products);
    }

    public getProducts(): { [productId: string]: Product } {
        return this.get('products');
    }

    public getSize(): number {
        return Object.keys(this.getProducts()).length;
    }

    public getDTO() {
        return {
            'purchases': this.getProducts()
        };
    }
}
