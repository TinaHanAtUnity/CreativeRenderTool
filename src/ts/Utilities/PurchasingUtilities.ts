import { PurchasingCatalog } from 'Models/PurchasingCatalog';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from './Diagnostics';
import { Configuration } from 'Models/Configuration';
import { ClientInfo } from 'Models/ClientInfo';

export class PurchasingUtilities {
    public static setClientInfo(clientInfo?: ClientInfo) {
        PurchasingUtilities._clientInfo = clientInfo;
    }

    public static setConfiguration(configuration?: Configuration) {
        PurchasingUtilities._configuration = configuration;
    }

    public static checkPromoVersion(nativeBridge: NativeBridge): Promise<boolean> {
        return this.isPromoReady(nativeBridge).then((ready) => {
            if (!ready) {
                return Promise.reject(new Error('Promo was not ready'));
            }
            return new Promise<boolean>((resolve, reject) => {
                const promoVersionObserver = nativeBridge.Purchasing.onGetPromoVersion.subscribe((promoVersion) => {
                    nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                    resolve(PurchasingUtilities.supportsVersion(promoVersion));
                });
                nativeBridge.Purchasing.getPromoVersion().catch(() => {
                    nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                    reject(new Error('Unsuccessful promo version check'));
                });
            });
        });
    }

    public static refreshCatalog(nativeBridge: NativeBridge): Promise<void | {}> {
        return new Promise((resolve, reject) => {
            const observer = nativeBridge.Purchasing.onGetPromoCatalog.subscribe((promoCatalogJSON) => {
                nativeBridge.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                try {
                    this._catalog = new PurchasingCatalog(JSON.parse(promoCatalogJSON));
                } catch(err) {
                    reject();
                }
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

    public static requestPurchase(nativeBridge: NativeBridge, iapPayload: string): Promise<void> {
        if (!PurchasingUtilities._didSuccessfullySendInitializationCommand) {
            return PurchasingUtilities.sendInitializationCommand(nativeBridge).then(() => {
                return this.sendPurchaseAttempt(nativeBridge, iapPayload);
            });
        } else {
            return this.sendPurchaseAttempt(nativeBridge, iapPayload);
        }
    }

    public static sendPurchaseAttempt(nativeBridge: NativeBridge, iapPayload: string): Promise<void> {
        return this.isPromoReady(nativeBridge).then((ready) => {
            if (!ready) {
                return Promise.reject(new Error('Promo was not ready'));
            }
            return new Promise<void>((resolve, reject) => {
                const observer = nativeBridge.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                    if (isCommandSuccessful === 'False') {
                        nativeBridge.Sdk.logError("PurchasingUtilities: Purchase attempt unsuccessful");
                        Diagnostics.trigger("purchase_attempt_unsuccessful", { message: "Purchase attempt unsuccessful" });
                        reject(new Error('Unsuccessful purchase attempt'));
                    } else if (isCommandSuccessful === 'True') {
                        resolve();
                    }
                });
                nativeBridge.Purchasing.initiatePurchasingCommand(iapPayload).catch(() => {
                    nativeBridge.Purchasing.onCommandResult.unsubscribe(observer);
                    reject(new Error('Unsuccessful purchase attempt'));
                });
            });
        });
    }

    public static sendInitializationCommand(nativeBridge: NativeBridge): Promise<void> {
        let configurationIncludesPromoPlacement = false;
        if (PurchasingUtilities._configuration) {
            const placements = PurchasingUtilities._configuration.getPlacements();
            const placementIds = PurchasingUtilities._configuration.getPlacementIds();
            for (const placementId of placementIds) {
                const adTypes = placements[placementId].getAdTypes();
                if (adTypes && adTypes.indexOf('IAP') > -1) {
                    configurationIncludesPromoPlacement = true;
                }
            }
        }
        if (!configurationIncludesPromoPlacement) {
            return Promise.resolve();
        }
        return this.checkPromoVersion(nativeBridge).then((isValid) => {
            if (!isValid) {
                return Promise.reject(new Error('Purchasing version is not valid'));
            }
            return new Promise<void>((resolve, reject) => {
                const observer = nativeBridge.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                    if (isCommandSuccessful === 'False') {
                        nativeBridge.Sdk.logError("PurchasingUtilities: Purchase command unsuccessful");
                        Diagnostics.trigger("initilization_command_unsuccessful", { message: "Purchase initialization command unsuccessful" });
                        reject(new Error('Unsuccessful purchase initialization command'));
                    } else if (isCommandSuccessful === 'True') {
                        PurchasingUtilities._didSuccessfullySendInitializationCommand = true;
                        resolve();
                    }
                });
                const iapPayload = <any>{};
                if (PurchasingUtilities._configuration && PurchasingUtilities._clientInfo) {
                    iapPayload.gamerId = PurchasingUtilities._configuration.getGamerId();
                    iapPayload.iapPromo = true;
                    iapPayload.abGroup = PurchasingUtilities._configuration.getAbGroup();
                    iapPayload.gameId = PurchasingUtilities._clientInfo.getGameId();
                    iapPayload.request = "setids";
                }
                nativeBridge.Purchasing.initiatePurchasingCommand(JSON.stringify(iapPayload)).catch(() => {
                    nativeBridge.Purchasing.onCommandResult.unsubscribe(observer);
                    reject(new Error('Unsuccessful initialization command'));
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
    private static _clientInfo: ClientInfo | undefined;
    private static _configuration: Configuration | undefined;
    private static _didSuccessfullySendInitializationCommand: boolean = false;

    // Returns true if version is 1.16.0 or newer
    private static supportsVersion(version: string): boolean {
        const promoVersionSplit: string[] = version.split('.', 2);
        return (parseInt(promoVersionSplit[0], 10) >= 2 || (parseInt(promoVersionSplit[0], 10) >= 1 && parseInt(promoVersionSplit[1], 10) >= 16));
    }
}
