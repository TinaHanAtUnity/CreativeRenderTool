import { PurchasingCatalog } from 'Models/PurchasingCatalog';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from './Diagnostics';
import { Configuration } from 'Models/Configuration';
import { ClientInfo } from 'Models/ClientInfo';

export enum IPromoRequest {
    SETIDS = 'setids',
    PURCHASE = 'purchase',
    CLOSE = 'close'
}

export interface IPromoPayload {
    gamerId?: string;
    gameId?: string;
    abGroup?: number;
    productId?: string;
    iapPromo: boolean;
    request: IPromoRequest;
    purchaseTrackingUrls: string[];
}

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
                return Promise.reject(this.logIssue(nativeBridge, 'promo_not_ready', 'Promo was not ready'));
            }
            return new Promise<boolean>((resolve, reject) => {
                const promoVersionObserver = nativeBridge.Purchasing.onGetPromoVersion.subscribe((promoVersion) => {
                    nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                    resolve(PurchasingUtilities.supportsVersion(promoVersion));
                });
                nativeBridge.Purchasing.getPromoVersion().catch(() => {
                    nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                    reject(this.logIssue(nativeBridge, 'promo_version_check_failed', 'Promo version check failed'));
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
                    reject(this.logIssue(nativeBridge, 'catalog_json_parse_failure', 'Promo catalog JSON failed to parse'));
                }
                resolve();
            });
            nativeBridge.Purchasing.getPromoCatalog().catch(reject);
        }).catch((reject) => {
            reject(this.logIssue(nativeBridge, 'catalog_refresh_failed', 'Purchasing Catalog failed to refresh'));
        });
    }

    public static isPromoReady(nativeBridge: NativeBridge): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const observer = nativeBridge.Purchasing.onInitialize.subscribe((isReady) => {
                nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                if (isReady !== 'True') {
                    reject(this.logIssue(nativeBridge, 'promo_not_ready', 'Promo was not ready'));
                }
                resolve(isReady === 'True');
            });
            nativeBridge.Purchasing.initializePurchasing().catch(() => {
                nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                reject(this.logIssue(nativeBridge, 'purchase_initilization_failed', 'Purchase initialization failed'));
            });
        });
    }

    public static beginPurchaseEvent(nativeBridge: NativeBridge, iapPayload: string): Promise<void> {
        if (!PurchasingUtilities._didSuccessfullyInitiatePurchaseEvent) {
            this.logIssue(nativeBridge, 'purchase_never_intitialized', 'IAP Promo initialization never happened.');
            return PurchasingUtilities.sendPurchaseInitializationEvent(nativeBridge).then(() => {
                return this.sendPurchasingCommandIfReady(nativeBridge, iapPayload);
            });
        } else {
            return this.sendPurchasingCommandIfReady(nativeBridge, iapPayload);
        }
    }

    public static sendPurchaseInitializationEvent(nativeBridge: NativeBridge): Promise<void> {
        if (!this.configurationIncludesPromoPlacement()) {
            return Promise.resolve();
        }
        return this.checkPromoVersion(nativeBridge).then((isValid) => {
            if (!isValid) {
                return Promise.reject(this.logIssue(nativeBridge, 'purchasing_version_invalid', 'Purchasing version is invalid'));
            }
            return new Promise<void>((resolve, reject) => {
                const observer = nativeBridge.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                    if (isCommandSuccessful === 'False') {
                        reject(this.logIssue(nativeBridge, 'purchase_command_result_false', 'Purchase command result was false'));
                    } else if (isCommandSuccessful === 'True') {
                        PurchasingUtilities._didSuccessfullyInitiatePurchaseEvent = true;
                        resolve();
                    }
                });
                nativeBridge.Purchasing.initiatePurchasingCommand(JSON.stringify(this.loadInitializationPayloads())).catch(() => {
                    nativeBridge.Purchasing.onCommandResult.unsubscribe(observer);
                    reject(this.logIssue(nativeBridge, 'send_purchase_event_failed', 'Purchase event failed to send'));
                });
            });
        });
    }

    public static handleSendIAPEvent(nativeBridge: NativeBridge, iapPayload: string): void {
        // TODO: Handle IAPPayload/send event/do something with the payload
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
    private static _didSuccessfullyInitiatePurchaseEvent: boolean = false;

    // Returns true if version is 1.16.0 or newer
    private static supportsVersion(version: string): boolean {
        const promoVersionSplit: string[] = version.split('.', 2);
        return (parseInt(promoVersionSplit[0], 10) >= 2 || (parseInt(promoVersionSplit[0], 10) >= 1 && parseInt(promoVersionSplit[1], 10) >= 16));
    }

    private static logIssue(nativeBridge: NativeBridge, errorType: string, errorMessage: string): Error {
        nativeBridge.Sdk.logError(errorMessage);
        Diagnostics.trigger(errorType, { message: errorMessage });
        return new Error(errorMessage);
    }

    private static configurationIncludesPromoPlacement(): boolean {
        if (PurchasingUtilities._configuration) {
            const placements = PurchasingUtilities._configuration.getPlacements();
            const placementIds = PurchasingUtilities._configuration.getPlacementIds();
            for (const placementId of placementIds) {
                const adTypes = placements[placementId].getAdTypes();
                if (adTypes && adTypes.indexOf('IAP') > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    private static loadInitializationPayloads(): IPromoPayload {
        const iapPayload = <IPromoPayload>{};
        if (PurchasingUtilities._configuration && PurchasingUtilities._clientInfo) {
            iapPayload.gamerId = PurchasingUtilities._configuration.getGamerId();
            iapPayload.iapPromo = true;
            iapPayload.abGroup = PurchasingUtilities._configuration.getAbGroup();
            iapPayload.gameId = PurchasingUtilities._clientInfo.getGameId() + '|' + PurchasingUtilities._configuration.getToken();
            iapPayload.request = IPromoRequest.SETIDS;
        }
        return iapPayload;
    }

    private static sendPurchasingCommandIfReady(nativeBridge: NativeBridge, iapPayload: string): Promise<void> {
        return this.isPromoReady(nativeBridge).then((ready) => {
            if (!ready) {
                return Promise.reject(this.logIssue(nativeBridge, 'purchasing_command_not_ready', 'Purchasing command was not ready'));
            }
            return new Promise<void>((resolve, reject) => {
                const observer = nativeBridge.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                    if (isCommandSuccessful === 'False') {
                        reject(this.logIssue(nativeBridge, 'purchase_command_attempt_failed', 'Purchase command attempt failed'));
                    } else if (isCommandSuccessful === 'True') {
                        resolve();
                    }
                });
                nativeBridge.Purchasing.initiatePurchasingCommand(iapPayload).catch(() => {
                    nativeBridge.Purchasing.onCommandResult.unsubscribe(observer);
                    reject(this.logIssue(nativeBridge, 'send_purchase_event_failed', 'Purchase event failed to send'));
                });
            });
        });
    }
}
