import { MetaData } from 'Utilities/MetaData';
import {IProduct, PurchasingCatalog} from 'Models/PurchasingCatalog';

export class PurchasingUtilities {
    public static refresh(metaData: MetaData): Promise<string[]> {
        return metaData.getKeys('iap').then(keys => {
            const promises: any[] = [];
            keys.forEach((key) => {
                promises.push(metaData.get<IProduct[]>('iap.catalog', false).then(([found, value]: [boolean, IProduct[]]) => {
                    if(found && value) {
                        this._catalog = new PurchasingCatalog(value);
                    }
                }));
            });
            return Promise.all(promises);
        });
    }

    public static purchasesAvailable(): boolean {
        return PurchasingUtilities._catalog.getProducts().length !== 0;
    }

    private static _catalog: PurchasingCatalog;
}
