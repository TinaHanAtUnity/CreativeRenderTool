import { MetaData } from 'Utilities/MetaData';
import { PurchasingCatalog } from 'Models/PurchasingCatalog';
import { JsonParser } from 'Utilities/JsonParser';

export class PurchasingUtilities {
    public static refresh(metaData: MetaData): Promise<void> {
        return metaData.get<string>('iap.catalog', false).then(([found, value]: [boolean, string]) => {
            if(found && value) {
                this._catalog = new PurchasingCatalog(JsonParser.parse(value));
            }
        });
    }

    public static productAvailable(productId: string): boolean {
        if(this.purchasesAvailable()) {
            return this._catalog.getProducts().has(productId);
        }
        return false;
    }

    public static productPrice(productId: string): string {
        if(this.productAvailable(productId)) {
            return this._catalog.getProducts().get(productId)!.getPrice();
        }
        throw new Error('Attempting to get price of invalid product: ' + productId);
    }

    public static productDescription(productId: string): string {
        if(this.productAvailable(productId)) {
            return this._catalog.getProducts().get(productId)!.getDescription();
        }
        throw new Error('Attempting to get description of invalid product: ' + productId);
    }

    public static purchasesAvailable(): boolean {
        return this._catalog.getProducts() !== undefined;
    }

    private static _catalog: PurchasingCatalog;
}
