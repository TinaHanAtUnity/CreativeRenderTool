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
    gamerToken?: string;
    gameId?: string;
    abGroup?: number;
    productId?: string;
    iapPromo: boolean;
    request: IPromoRequest;
    purchaseTrackingUrls: string[];
}

export class PurchasingUtilities {
    public static setClientInfo(clientInfo: ClientInfo) {
        this._clientInfo = clientInfo;
    }

    public static setConfiguration(configuration: Configuration) {
        this._configuration = configuration;
    }

    public static setInitializationPayloadSentValue(val: boolean) {
        this._initializationPayloadsAlreadySent = val;
    }

    public static sendPurchaseInitializationEvent(nativeBridge: NativeBridge): Promise<void> {
        if (this.configurationIncludesPromoPlacement()) {
            return this.isPromoReady(nativeBridge).then(() => {
                return this.checkPromoVersion(nativeBridge).then(() => {
                    return this.sendPurchasingCommand(nativeBridge, JSON.stringify(this.loadInitializationPayloads()));
                });
            });
        }
        return Promise.resolve();
    }

    public static sendPromoPayload(nativeBridge: NativeBridge, iapPayload: string): Promise<void> {
        if (!this._initializationPayloadsAlreadySent) {
            return this.sendPurchaseInitializationEvent(nativeBridge).then(() => {
                return this.sendPurchasingCommand(nativeBridge, iapPayload);
            });
        } else {
            return this.sendPurchasingCommand(nativeBridge, iapPayload);
        }
    }

    public static refreshCatalog(nativeBridge: NativeBridge): Promise<void> {
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
            nativeBridge.Purchasing.getPromoCatalog().catch((e) => {
                nativeBridge.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                reject(this.logIssue(nativeBridge, 'catalog_refresh_failed', 'Purchasing Catalog failed to refresh'));
            });
        });
    }

    public static getProductPrice(productId: string): string {
        if (this.isProductAvailable(productId)) {
            return this._catalog.getProducts()[productId]!.getPrice();
        }
        throw new Error('Attempted to get price of invalid product: ' + productId);
    }

    public static isProductAvailable(productId: string): boolean {
        if (this.isProductInCatalog()) {
            return (productId in this._catalog.getProducts());
        }
        return false;
    }

    public static handleSendIAPEvent(nativeBridge: NativeBridge, iapPayload: string): void {
        // TODO: Handle IAPPayload/send event/do something with the payload
    }

    private static _catalog: PurchasingCatalog = new PurchasingCatalog([]);
    private static _clientInfo: ClientInfo | undefined;
    private static _configuration: Configuration | undefined;
    private static _initializationPayloadsAlreadySent: boolean = false;

    private static isProductInCatalog(): boolean {
        return (this._catalog !== undefined && this._catalog.getProducts() !== undefined && this._catalog.getSize() !== 0);
    }

    private static configurationIncludesPromoPlacement(): boolean {
        if (this._configuration) {
            const placements = this._configuration.getPlacements();
            const placementIds = this._configuration.getPlacementIds();
            for (const placementId of placementIds) {
                const adTypes = placements[placementId].getAdTypes();
                if (adTypes && adTypes.indexOf('IAP') > -1) {
                    return true;
                }
            }
        }
        return false;
    }

    private static isPromoReady(nativeBridge: NativeBridge): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = nativeBridge.Purchasing.onInitialize.subscribe((isReady) => {
                nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                if (isReady !== 'True') {
                    reject(this.logIssue(nativeBridge, 'promo_not_ready', 'Promo was not ready'));
                }
                resolve();
            });
            nativeBridge.Purchasing.initializePurchasing().catch(() => {
                nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                reject(this.logIssue(nativeBridge, 'purchase_initilization_failed', 'Purchase initialization failed'));
            });
        });
    }

    private static checkPromoVersion(nativeBridge: NativeBridge): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const promoVersionObserver = nativeBridge.Purchasing.onGetPromoVersion.subscribe((promoVersion) => {
                nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                if(!this.isPromoVersionSupported(promoVersion)) {
                    reject(this.logIssue(nativeBridge, 'promo_version_not_supported', 'Promo version not supported'));
                }
                resolve();
            });
            nativeBridge.Purchasing.getPromoVersion().catch(() => {
                nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                reject(this.logIssue(nativeBridge, 'promo_version_check_failed', 'Promo version check failed'));
            });
        });
    }

    private static sendPurchasingCommand(nativeBridge: NativeBridge, iapPayload: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = nativeBridge.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                if (isCommandSuccessful === 'True') {
                    if (iapPayload.indexOf('SETIDS') !== -1) {
                        this._initializationPayloadsAlreadySent = true;
                    }
                    resolve();
                }
                reject(this.logIssue(nativeBridge, 'purchase_command_attempt_failed', 'Purchase command attempt failed'));
            });
            nativeBridge.Purchasing.initiatePurchasingCommand(iapPayload).catch(() => {
                nativeBridge.Purchasing.onCommandResult.unsubscribe(observer);
                reject(this.logIssue(nativeBridge, 'send_purchase_event_failed', 'Purchase event failed to send'));
            });
        });
    }

    // Returns true if version is 1.16.0 or newer
    private static isPromoVersionSupported(version: string): boolean {
        const promoVersionSplit: string[] = version.split('.', 2);
        return (parseInt(promoVersionSplit[0], 10) >= 2 || (parseInt(promoVersionSplit[0], 10) >= 1 && parseInt(promoVersionSplit[1], 10) >= 16));
    }

    private static loadInitializationPayloads(): IPromoPayload {
        const iapPayload = <IPromoPayload>{};
        if (this._configuration && this._clientInfo) {
            iapPayload.iapPromo = true;
            iapPayload.abGroup = this._configuration.getAbGroup();
            iapPayload.gameId = this._clientInfo.getGameId() + '|' + this._configuration.getToken();
            iapPayload.gamerToken = this._configuration.getToken();
            iapPayload.request = IPromoRequest.SETIDS;
        }
        return iapPayload;
    }

    private static logIssue(nativeBridge: NativeBridge, errorType: string, errorMessage: string): Error {
        nativeBridge.Sdk.logError(errorMessage);
        Diagnostics.trigger(errorType, { message: errorMessage });
        return new Error(errorMessage);
    }
}
