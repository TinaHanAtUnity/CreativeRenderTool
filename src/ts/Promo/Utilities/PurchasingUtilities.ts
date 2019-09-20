import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { PlacementState } from 'Ads/Models/Placement';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPromoApi } from 'Promo/IPromo';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingCatalog } from 'Promo/Models/PurchasingCatalog';
import { PromoCampaignParser } from 'Promo/Parsers/PromoCampaignParser';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { CustomPurchasingAdapter } from 'Purchasing/CustomPurchasingAdapter';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { IProduct, IPurchasingAdapter } from 'Purchasing/PurchasingAdapter';
import { UnityPurchasingPurchasingAdapter } from 'Purchasing/UnityPurchasingPurchasingAdapter';
import { TestModePurchasingAdapter } from 'Purchasing/TestModePurchasingAdapter';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';
import { Promises } from 'Core/Utilities/Promises';
import { PromoErrorService } from 'Core/Utilities/PromoErrorService';

export enum IPromoRequest {
    SETIDS = 'setids',
    PURCHASE = 'purchase',
    CLOSE = 'close'
}

export enum ProductState {
    EXISTS_IN_CATALOG,
    MISSING_PRODUCT_IN_CATALOG,
    WAITING_FOR_CATALOG
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

    public static initialize(core: ICoreApi, promo: IPromoApi, purchasing: IPurchasingApi, clientInfo: ClientInfo, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, placementManager: PlacementManager, campaignManager: CampaignManager, promoEvents: PromoEvents, request: RequestManager, metaDataManager: MetaDataManager, analyticsManager: IAnalyticsManager) {
        this._core = core;
        this._promo = promo;
        this._purchasing = purchasing;
        this._clientInfo = clientInfo;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._placementManager = placementManager;
        this._analyticsManager = analyticsManager;
        this._promoEvents = promoEvents;
        this._request = request;
        this._metaDataManager = metaDataManager;

        campaignManager.onAdPlanReceived.subscribe(() => this._placementManager.clear());
        return this.getPurchasingAdapter().then((adapter) => {
            this._purchasingAdapter = adapter;
            this._purchasingAdapter.onCatalogRefreshed.subscribe((products) => {
                this.updateCatalog(products);
                this.setProductPlacementStates();
            });
            return this._purchasingAdapter.initialize().catch((e) => {
                // Logging occurs in the purchasing adapter
            });
        }).then(() => {
            this._isInitialized = true;
            if (this.configurationIncludesPromoPlacement()) {
                PurchasingUtilities.refreshCatalog();
            }
        });
    }

    public static isInitialized(): boolean {
        return this._isInitialized;
    }

    public static onPurchase(thirdPartyEventManager: ThirdPartyEventManager, productId: string, campaign: PromoCampaign, isNative: boolean = false): Promise<void> {
        return Promises.voidResult(this._purchasingAdapter.purchaseItem(thirdPartyEventManager, productId, campaign, isNative));
    }
    public static onPromoClosed(thirdPartyEventManager: ThirdPartyEventManager, campaign: PromoCampaign, placementId: string): void {
        this._purchasingAdapter.onPromoClosed(thirdPartyEventManager, campaign, placementId);
    }

    public static refreshCatalog(): Promise<void> {
        // Prevents the catalog from being refreshed multiple times.
        if (this._refreshPromise) {
            return this._refreshPromise;
        } else {
            this._refreshPromise = this._purchasingAdapter.refreshCatalog()
                .then((products) => this.updateCatalog(products))
                .then(() => this.setProductPlacementStates())
                .then(() => { this._refreshPromise = null; })
                .catch((e) => { // whenever IAP is not ready yet or IAP SDK Version is below 1.17.0
                    this._refreshPromise = null;
                });
            return this._refreshPromise;
        }
    }

    public static getProductPrice(productId: string): string | undefined {
        if (this.isProductAvailable(productId)) {
            return this._catalog.getProducts()[productId].getPrice();
        }
        return undefined;
    }

    public static getProductName(productId: string): string | undefined {
        if (this.isProductAvailable(productId)) {
            return this._catalog.getProducts()[productId].getLocalizedTitle();
        }
        return undefined;
    }

    public static getProductType(productId: string): string | undefined {
        if (this.isProductAvailable(productId)) {
            return this._catalog.getProducts()[productId].getProductType();
        }
        return undefined;
    }

    public static getProductLocalizedPrice(productId: string): number | undefined {
        if (this.isProductAvailable(productId)) {
            return this._catalog.getProducts()[productId].getLocalizedPrice();
        }
        return undefined;
    }

    public static getProductIsoCurrencyCode(productId: string): string | undefined {
        if (this.isProductAvailable(productId)) {
            return this._catalog.getProducts()[productId].getIsoCurrencyCode();
        }
        return undefined;
    }

    public static isProductAvailable(productId: string): boolean {
        if (this.isCatalogValid()) {
            return (productId in this._catalog.getProducts());
        }
        return false;
    }

    public static isCatalogAvailable(): boolean {
        return this._isInitialized && this.isCatalogValid();
    }

    public static isCatalogValid(): boolean {
        return (this._catalog !== undefined && this._catalog.getProducts() !== undefined && this._catalog.getSize() !== 0);
    }

    public static addCampaignPlacementIds(placementId: string, campaign: Campaign) {
        this._placementManager.addCampaignPlacementIds(placementId, campaign);
    }

    public static configurationIncludesPromoPlacement(): boolean {
        if (this._coreConfig) {
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

    private static _refreshPromise: Promise<void> | null;
    private static _catalog: PurchasingCatalog = new PurchasingCatalog([]);
    private static _core: ICoreApi;
    private static _promo: IPromoApi;
    private static _purchasing: IPurchasingApi;
    private static _clientInfo: ClientInfo;
    private static _coreConfig: CoreConfiguration;
    private static _adsConfig: AdsConfiguration;
    private static _nativeBridge: NativeBridge;
    private static _placementManager: PlacementManager;
    private static _purchasingAdapter: IPurchasingAdapter;
    private static _analyticsManager: IAnalyticsManager;
    private static _promoEvents: PromoEvents;
    private static _request: RequestManager;
    private static _isInitialized = false;
    private static _metaDataManager: MetaDataManager;

    private static setProductPlacementStates(): void {
        const placementCampaignMap = this._placementManager.getPlacementCampaignMap(PromoCampaignParser.ContentType);
        const promoPlacementIds = Object.keys(placementCampaignMap);
        for (const placementId of promoPlacementIds) {
            const campaign = placementCampaignMap[placementId];
            if (campaign instanceof PromoCampaign) {
                const state = PurchasingUtilities.getProductState(campaign.getIapProductId());
                switch (state) {
                    case ProductState.EXISTS_IN_CATALOG:
                        this._placementManager.setPlacementReady(placementId, campaign);
                        break;
                    case ProductState.MISSING_PRODUCT_IN_CATALOG:
                        this._placementManager.setPlacementState(placementId, PlacementState.DISABLED);
                        break;
                    case ProductState.WAITING_FOR_CATALOG:
                        this._placementManager.setPlacementState(placementId, PlacementState.WAITING);
                        break;
                    default:
                }
            }
        }
    }

    public static getProductState(productID: string): ProductState {
        if (PurchasingUtilities.isCatalogAvailable()) {
            return PurchasingUtilities.isProductAvailable(productID) ? ProductState.EXISTS_IN_CATALOG : ProductState.MISSING_PRODUCT_IN_CATALOG;
        }
        return ProductState.WAITING_FOR_CATALOG;
    }

    private static getPurchasingAdapter(): Promise<IPurchasingAdapter> {
        if (this._coreConfig.getTestMode()) {
            return Promise.resolve().then(() => {
                this._core.Sdk.logInfo('TestMode delegate is set');
                return new TestModePurchasingAdapter(this._core);
            });
        }
        return this._purchasing.CustomPurchasing.available().then((isAvailable) => {
            if (isAvailable) {
                return new CustomPurchasingAdapter(this._core, this._purchasing, this._promoEvents, this._request, this._analyticsManager);
            } else {
                return new UnityPurchasingPurchasingAdapter(this._core, this._promo, this._coreConfig, this._adsConfig, this._clientInfo, this._metaDataManager);
            }
        }).catch(() => {
            return new UnityPurchasingPurchasingAdapter(this._core, this._promo, this._coreConfig, this._adsConfig, this._clientInfo, this._metaDataManager);
        });
    }

    private static updateCatalog(products: IProduct[]) {
        try {
            this._catalog = new PurchasingCatalog(products);
        } catch (e) {
            this._core.Sdk.logInfo('Error, cannot create catalog: ' + JSON.stringify(e));
        }
    }
}
