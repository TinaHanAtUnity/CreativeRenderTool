import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { PlacementState } from 'Ads/Models/Placement';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingCatalog } from 'Promo/Models/PurchasingCatalog';
import { PromoCampaignParser } from 'Promo/Parsers/PromoCampaignParser';
import { IPromoApi } from '../Promo';
import { ICoreApi } from '../../Core/Core';

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

    public static placementManager: PlacementManager;

    public static initialize(core: ICoreApi, promo: IPromoApi, clientInfo: ClientInfo, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, placementManager: PlacementManager) {
        this._core = core;
        this._promo = promo;
        this._clientInfo = clientInfo;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this.placementManager = placementManager;
    }

    public static isInitialized(): boolean {
        return this._isInitialized;
    }

    public static sendPurchaseInitializationEvent(): Promise<void> {
        if (this.configurationIncludesPromoPlacement()) {
            return this.initializeIAPPromo()
            .then(() => this.checkPromoVersion())
            .then(() => {
                return this.sendPurchasingCommand(this.getInitializationPayload());
            });
        }
        return Promise.resolve();
    }

    public static sendPromoPayload(iapPayload: IPromoPayload): Promise<void> {
        if (!this.isInitialized()) {
            return this.sendPurchaseInitializationEvent().then(() => {
                return this.sendPurchasingCommand(iapPayload);
            });
        } else {
            return this.sendPurchasingCommand(iapPayload);
        }
    }

    public static refreshCatalog(): Promise<void> {
        return new Promise((resolve, reject) => {
            const observer = this._promo.Purchasing.onGetPromoCatalog.subscribe((promoCatalogJSON) => {
                this._promo.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                try {
                    this._catalog = new PurchasingCatalog(JSON.parse(promoCatalogJSON));
                    resolve();
                } catch(err) {
                    reject(this.logIssue('catalog_json_parse_failure', 'Promo catalog JSON failed to parse'));
                }
            });
            this._promo.Purchasing.getPromoCatalog().catch((e) => {
                this._promo.Purchasing.onGetPromoCatalog.unsubscribe(observer);
                reject(this.logIssue('catalog_refresh_failed', 'Purchasing Catalog failed to refresh'));
            });
        });
    }

    public static getProductPrice(productId: string): string {
        if (this.isProductAvailable(productId)) {
            return this._catalog.getProducts()[productId].getPrice();
        }
        throw new Error('Attempted to get price of invalid product: ' + productId);
    }

    public static getProductType(productId: string): string | undefined {
        if (this.isProductAvailable(productId)) {
            return this._catalog.getProducts()[productId].getProductType();
        }
        return undefined;
    }

    public static isProductAvailable(productId: string): boolean {
        if (this.isCatalogValid()) {
            return (productId in this._catalog.getProducts());
        }
        return false;
    }

    public static handleSendIAPEvent(iapPayload: string): Promise<void> {
        const jsonPayload = JSON.parse(iapPayload);

        if (jsonPayload.type === 'CatalogUpdated') {
            if (!this.isInitialized()) {
                return this.sendPurchaseInitializationEvent()
                .then(() => this.refreshCatalog())
                .then(() => this.setProductPlacementStates());
            } else {
                return this.refreshCatalog().then(() => this.setProductPlacementStates());
            }
        } else {
            return Promise.reject(this.logIssue('handle_send_event_failure', 'IAP Payload is incorrect'));
        }
    }

    public static isCatalogValid(): boolean {
        return (this._catalog !== undefined && this._catalog.getProducts() !== undefined && this._catalog.getSize() !== 0);
    }

    private static _catalog: PurchasingCatalog = new PurchasingCatalog([]);
    private static _core: ICoreApi;
    private static _promo: IPromoApi;
    private static _clientInfo: ClientInfo;
    private static _coreConfig: CoreConfiguration;
    private static _adsConfig: AdsConfiguration;
    private static _isInitialized = false;

    private static setProductPlacementStates(): void {
        const placementCampaignMap = this.placementManager.getPlacementCampaignMap(PromoCampaignParser.ContentType);
        const promoPlacementIds = Object.keys(placementCampaignMap);
        for (const placementId of promoPlacementIds) {
            const currentCampaign = placementCampaignMap[placementId];

            if (currentCampaign instanceof PromoCampaign && this.isProductAvailable(currentCampaign.getIapProductId())) {
                this.placementManager.setPlacementReady(placementId, currentCampaign);
            } else {
                this.placementManager.setPlacementState(placementId, PlacementState.NO_FILL);
            }
        }
    }

    private static initializeIAPPromo(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = this._promo.Purchasing.onInitialize.subscribe((isReady) => {
                this._promo.Purchasing.onInitialize.unsubscribe(observer);
                if (isReady !== 'True') {
                    reject(this.logIssue('promo_not_ready', 'IAP Promo was not ready'));
                } else {
                    resolve();
                }
            });
            this._promo.Purchasing.initializePurchasing().catch(() => {
                this._promo.Purchasing.onInitialize.unsubscribe(observer);
                reject(this.logIssue('purchase_initialization_failed', 'Purchase initialization failed'));
            });
        });
    }

    private static checkPromoVersion(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const promoVersionObserver = this._promo.Purchasing.onGetPromoVersion.subscribe((promoVersion) => {
                this._promo.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                if(!this.isPromoVersionSupported(promoVersion)) {
                    reject(this.logIssue('promo_version_not_supported', `Promo version: ${promoVersion} is not supported`));
                } else {
                    resolve();
                }
            });
            this._promo.Purchasing.getPromoVersion().catch(() => {
                this._promo.Purchasing.onGetPromoVersion.unsubscribe(promoVersionObserver);
                reject(this.logIssue('promo_version_check_failed', 'Promo version check failed'));
            });
        });
    }

    private static sendPurchasingCommand(iapPayload: IPromoPayload): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const observer = this._promo.Purchasing.onCommandResult.subscribe((isCommandSuccessful) => {
                if (isCommandSuccessful === 'True') {
                    if (iapPayload.request === IPromoRequest.SETIDS) {
                        this._isInitialized = true;
                    }
                    resolve();
                } else {
                    reject(this.logIssue('purchase_command_attempt_failed', `Purchase command attempt failed with command ${isCommandSuccessful}`));
                }
            });
            this._promo.Purchasing.initiatePurchasingCommand(JSON.stringify(iapPayload)).catch(() => {
                this._promo.Purchasing.onCommandResult.unsubscribe(observer);
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

    private static getInitializationPayload(): IPromoPayload {

        return <IPromoPayload>{
            iapPromo: true,
            abGroup: this._coreConfig.getAbGroup().toNumber(),
            gameId: this._clientInfo.getGameId() + '|' + this._coreConfig.getToken(),
            trackingOptOut: this._adsConfig.isOptOutEnabled(),
            gamerToken: this._coreConfig.getToken(),
            request: IPromoRequest.SETIDS
        };
    }

    private static logIssue(errorType: string, errorMessage: string): Error {
        this._core.Sdk.logError(errorMessage);
        Diagnostics.trigger(errorType, { message: errorMessage });
        return new Error(errorMessage);
    }

    private static configurationIncludesPromoPlacement(): boolean {
        if (this._adsConfig) {
            const placements = this._adsConfig.getPlacements();
            const placementIds = this._adsConfig.getPlacementIds();
            for (const placementId of placementIds) {
                const adTypes = placements[placementId].getAdTypes();
                if (adTypes && adTypes.indexOf('IAP') > -1) {
                    return true;
                }
            }
        }
        return false;
    }
}
