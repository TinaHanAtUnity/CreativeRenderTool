import { PurchasingCatalog } from 'Models/PurchasingCatalog';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from './Diagnostics';

export class PurchasingUtilities {

    public static refreshCatalog(nativeBridge: NativeBridge): Promise<void | {}> {
        return new Promise((resolve, reject) => {
            const observer = nativeBridge.Purchasing.onGetPromoCatalog.subscribe((promoCatalogJSON) => {
                nativeBridge.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                this._catalog = new PurchasingCatalog(JSON.parse(promoCatalogJSON));
                resolve();
            });
            nativeBridge.Purchasing.getPromoCatalog().catch(reject);
        }).catch(() => {
            nativeBridge.Sdk.logError("PurchasingUtilities: Catalog refresh failed.");
            Diagnostics.trigger("catalog_refresh_failed", { message: "purchasing catalog failed to refresh" });
        });
    }

    public static isPromoReady(nativeBridge: NativeBridge): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const observer = nativeBridge.Purchasing.onInitialize.subscribe((isReady) => {
                nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                if (isReady !== 'True') {
                    nativeBridge.Sdk.logError("PurchasingUtilities: Promo was not ready.");
                    Diagnostics.trigger("promo_not_ready", { message: "Promo was not ready" });
                }
                resolve(isReady === 'True');
            });
            nativeBridge.Purchasing.initialize().catch(() => {
                nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                reject();
            });
        });
    }

    public static initiatePurchaseRequest(nativeBridge: NativeBridge, iapPayload: string): Promise<void> {
        return this.isPromoReady(nativeBridge).then((ready) => {
            if (!ready) {
                return Promise.reject(new Error('Promo was not ready'));
            }
            return new Promise<void>((resolve, reject) => {
                const observer = nativeBridge.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                    if (isCommandSuccessful === 'False') {
                        nativeBridge.Sdk.logError("PurchasingUtilities: Purchase command unsuccessful");
                        Diagnostics.trigger("purchase_command_unsuccessful", { message: "Purchase command unsuccessful" });
                        reject(new Error('Unsuccessful purchase command'));
                    } else if (isCommandSuccessful === 'True') {
                        resolve();
                    }
                });
                nativeBridge.Purchasing.initiatePurchasingCommand(iapPayload).catch(() => {
                    nativeBridge.Purchasing.onCommandResult.unsubscribe(observer);
                    reject(new Error('Unsuccessful purchase command'));
                });
            });
        });
    }

    public static productAvailable(productId: string): boolean {
        if (this.purchasesAvailable()) {
            return (productId in this._catalog.getProducts());
        }
        return false;
    }

    public static productPrice(productId: string): string {
        if (this.productAvailable(productId)) {
            return this._catalog.getProducts()[productId]!.getPrice();
        }
        throw new Error('Attempting to get price of invalid product: ' + productId);
    }

    public static productDescription(productId: string): string {
        if (this.productAvailable(productId)) {
            return this._catalog.getProducts()[productId]!.getDescription();
        }
        throw new Error('Attempting to get description of invalid product: ' + productId);
    }

    public static purchasesAvailable(): boolean {
        return (this._catalog !== undefined && this._catalog.getProducts() !== undefined && this._catalog.getSize() !== 0);
    }

    private static _catalog: PurchasingCatalog = new PurchasingCatalog([]);
}
