import { PurchasingCatalog } from 'Models/PurchasingCatalog';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from './Diagnostics';
import { Configuration } from 'Models/Configuration';
import { ClientInfo } from 'Models/ClientInfo';
import { CampaignManager } from 'Managers/CampaignManager';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export enum IPromoRequest {
    SETIDS = 'setids',
    PURCHASE = 'purchase',
    CLOSE = 'close'
}

export interface IPromoPayload {
    gamerToken?: string;
    trackingOptOut?: boolean;
    gameId?: string;
    abGroup?: number;
    productId?: string;
    iapPromo: boolean;
    request: IPromoRequest;
    purchaseTrackingUrls: string[];
}

export class PurchasingUtilities {

    public static session: Session[] = [];
    public static response: AuctionResponse[] = [];
    public static campaignManager: CampaignManager;
    public static promoResponseIndex: number = 0;
    public static iapCampaignCount: number = 0;

    public static initialize(clientInfo: ClientInfo, configuration: Configuration, nativeBridge: NativeBridge) {
        this._clientInfo = clientInfo;
        this._configuration = configuration;
        this._nativeBridge = nativeBridge;
    }

    public static setInitializationPayloadSentValue(val: boolean) {
        this._isInitialized = val;
    }

    public static sendPurchaseInitializationEvent(): Promise<void> {
        if (this.configurationIncludesPromoPlacement()) {
            return this.initializeIAPPromo()
            .then(() => this.checkPromoVersion())
            .then(() => {
                return this.sendPurchasingCommand(JSON.stringify(this.loadInitializationPayloads()));
            });
        }
        return Promise.resolve();
    }

    public static sendPromoPayload(iapPayload: string): Promise<void> {
        if (!this._isInitialized) {
            return this.sendPurchaseInitializationEvent().then(() => {
                return this.sendPurchasingCommand(iapPayload);
            });
        } else {
            return this.sendPurchasingCommand(iapPayload);
        }
    }

    public static refreshCatalog(): Promise<void> {
        return new Promise((resolve, reject) => {
            const observer = this._nativeBridge.Purchasing.onGetPromoCatalog.subscribe((promoCatalogJSON) => {
                this._nativeBridge.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                try {
                    this._catalog = new PurchasingCatalog(JSON.parse(promoCatalogJSON));
                    resolve();
                } catch(err) {
                    reject(this.logIssue('catalog_json_parse_failure', 'Promo catalog JSON failed to parse'));
                }
            });
            this._nativeBridge.Purchasing.getPromoCatalog().catch((e) => {
                this._nativeBridge.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                reject(this.logIssue('catalog_refresh_failed', 'Purchasing Catalog failed to refresh'));
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
        if (this.isCatalogValid()) {
            return (productId in this._catalog.getProducts());
        }
        return false;
    }

    public static handleSendIAPEvent(iapPayload: string): void {
        const jsonPayload = JSON.parse(iapPayload);

        if (jsonPayload.type === 'CatalogUpdated') {
            this.sendPurchaseInitializationEvent();

            const promises = [];
            for (let i = 0; i < this.iapCampaignCount; i++) {
                if (this.response[i] === undefined || this.session[i] === undefined) {
                    this.logIssue('handle_send_event_failure', 'Auction Response or Session value is null');
                } else {
                    promises.push(this.campaignManager.handleCampaign(this.response[i], this.session[i]));
                }
            }
            Promise.all(promises);
        } else {
            this.logIssue('handle_send_event_failure', 'IAP Payload is incorrect');
        }
    }

    private static _catalog: PurchasingCatalog = new PurchasingCatalog([]);
    private static _clientInfo: ClientInfo;
    private static _configuration: Configuration;
    private static _nativeBridge: NativeBridge;
    private static _isInitialized = false;

    private static isCatalogValid(): boolean {
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

    private static initializeIAPPromo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = this._nativeBridge.Purchasing.onInitialize.subscribe((isReady) => {
                this._nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                if (isReady !== 'True') {
                    reject(this.logIssue('promo_not_ready', 'IAP Promo was not ready'));
                } else {
                    resolve();
                }
            });
            this._nativeBridge.Purchasing.initializePurchasing().catch(() => {
                this._nativeBridge.Purchasing.onInitialize.unsubscribe(observer);
                reject(this.logIssue('purchase_initialization_failed', 'Purchase initialization failed'));
            });
        });
    }

    private static checkPromoVersion(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const promoVersionObserver = this._nativeBridge.Purchasing.onGetPromoVersion.subscribe((promoVersion) => {
                this._nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                if(!this.isPromoVersionSupported(promoVersion)) {
                    reject(this.logIssue('promo_version_not_supported', 'Promo version not supported'));
                } else {
                    resolve();
                }
            });
            this._nativeBridge.Purchasing.getPromoVersion().catch(() => {
                this._nativeBridge.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                reject(this.logIssue('promo_version_check_failed', 'Promo version check failed'));
            });
        });
    }

    private static sendPurchasingCommand(iapPayload: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = this._nativeBridge.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                if (isCommandSuccessful === 'True') {
                    if (iapPayload.indexOf('SETIDS') !== -1) {
                        this._isInitialized = true;
                    }
                    resolve();
                } else {
                    reject(this.logIssue('purchase_command_attempt_failed', `Purchase command attempt failed with command ${isCommandSuccessful}`));
                }
            });
            this._nativeBridge.Purchasing.initiatePurchasingCommand(iapPayload).catch(() => {
                this._nativeBridge.Purchasing.onCommandResult.unsubscribe(observer);
                reject(this.logIssue('send_purchase_event_failed', 'Purchase event failed to send'));
            });
        });
    }

    // Returns true if version is 1.16.0 or newer
    private static isPromoVersionSupported(version: string): boolean {
        const promoVersionSplit = version.split('.', 2);
        if (promoVersionSplit.length > 1) {
            return ((parseInt(promoVersionSplit[0], 10) >= 2) || ((parseInt(promoVersionSplit[0], 10) >= 1 && parseInt(promoVersionSplit[1], 10) >= 16)));
        }
        return false;
    }

    private static loadInitializationPayloads(): IPromoPayload {
        return <IPromoPayload>{
            iapPromo: true,
            abGroup: this._configuration.getAbGroup().toNumber(),
            gameId: this._clientInfo.getGameId() + '|' + this._configuration.getToken(),
            trackingOptOut: this._configuration.isOptOutEnabled(),
            gamerToken: this._configuration.getToken(),
            request: IPromoRequest.SETIDS
        };
    }

    private static logIssue(errorType: string, errorMessage: string): Error {
        this._nativeBridge.Sdk.logError(errorMessage);
        Diagnostics.trigger(errorType, { message: errorMessage });
        return new Error(errorMessage);
    }
}
