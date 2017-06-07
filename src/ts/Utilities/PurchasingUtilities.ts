import { MetaData } from 'Utilities/MetaData';
import { IProduct, PurchasingCatalog } from 'Models/PurchasingCatalog';

export class PurchasingUtilities {
    public static refresh(metaData: MetaData): Promise<void> {
        return metaData.getKeys('iap').then(keys => {
             return metaData.get<IProduct[]>('iap.catalog', false).then(([found, value]: [boolean, IProduct[]]) => {
                if(found && value) {
                    this._catalog = new PurchasingCatalog(value);
                }
            });
        });
    }

    public static productAvailable(productId: string): boolean {
        if(this._catalog.getProducts().length !== 0) {
            for(const product of this._catalog.getProducts()) {
                if(product.getId() === productId) {
                    return true;
                }
            }
        }
        return false;
    }

    public static productPrice(productId: string): string {
        if(this._catalog.getProducts().length !== 0) {
            for(const product of this._catalog.getProducts()) {
                if(product.getId() === productId) {
                    return product.getPrice();
                }
            }
        }
        return "";
    }

    public static productDescription(productId: string): string {
        if(this._catalog.getProducts().length !== 0) {
            for(const product of this._catalog.getProducts()) {
                if(product.getId() === productId) {
                    return product.getDescription();
                }
            }
        }
        return "";
    }

    public static purchasesAvailable(): boolean {
        return this._catalog.getProducts().length !== 0;
    }

    private static _catalog: PurchasingCatalog;
}
