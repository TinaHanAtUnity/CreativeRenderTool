import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IObserver1 } from 'Core/Utilities/IObserver';
import { Observable1 } from 'Core/Utilities/Observable';
import { Url } from 'Core/Utilities/Url';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import {
    IProduct,
    IPurchasingAdapter,
    ITransactionDetails,
    ITransactionErrorDetails
} from 'Purchasing/PurchasingAdapter';

export class CustomPurchasingAdapter implements IPurchasingAdapter {
    public readonly onCatalogRefreshed = new Observable1<IProduct[]>();

    private _core: ICoreApi;
    private _purchasing: IPurchasingApi;
    private _analyticsManager?: AnalyticsManager;
    private _promoEvents: PromoEvents;
    private _products: {[productId: string]: IProduct};
    private _thirdPartyEventManager: ThirdPartyEventManager;

    private static purchasePathRegex = new RegExp('events\/v1\/purchase');
    private static purchaseHostnameRegex = new RegExp('events\.iap\.unity3d\.com');

    constructor(core: ICoreApi, purchasing: IPurchasingApi, promoEvents: PromoEvents, request: RequestManager, analyticsManager?: AnalyticsManager) {
        this._core = core;
        this._purchasing = purchasing;
        this._analyticsManager = analyticsManager;
        this._promoEvents = promoEvents;
        this._products = {};

        this._thirdPartyEventManager = new ThirdPartyEventManager(core, request, {});
    }

    public initialize() {
        return Promise.resolve();
    }

    public refreshCatalog(): Promise<IProduct[]> {
        return new Promise<IProduct[]>((resolve, reject) => {
            const observer = this._purchasing.CustomPurchasing.onProductsRetrieved.subscribe((products) => {
                this._purchasing.CustomPurchasing.onProductsRetrieved.unsubscribe(observer);
                const productsDict: {[productId: string]: IProduct } = {};
                for (const product of products) {
                    if (!this.isValidProductType(product.productType)) {
                        this._core.Sdk.logWarning(`refresh catalog received a productID (${product.productId}) that has an invalid productType. productType should be either 'consumable' or 'nonconsumable'`);
                    }
                    productsDict[product.productId] = product;
                }
                this._products = productsDict;
                resolve(products);
            });
            this._purchasing.CustomPurchasing.refreshCatalog().catch(reject);
        });
    }

    public purchaseItem(productId: string, campaign: PromoCampaign, placementId: string, isNative: boolean): Promise<ITransactionDetails> {
        return new Promise<ITransactionDetails>((resolve, reject) => {
            let onError: IObserver1<ITransactionErrorDetails>;
            let onSuccess: IObserver1<ITransactionDetails>;
            onSuccess = this._purchasing.CustomPurchasing.onTransactionComplete.subscribe((details) => {
                this._purchasing.CustomPurchasing.onTransactionError.unsubscribe(onError);
                this._purchasing.CustomPurchasing.onTransactionComplete.unsubscribe(onSuccess);
                // should send events
                if (this._analyticsManager) {
                    // send analytics event if analytics is enabled
                    this._analyticsManager.onIapTransaction(details.productId, details.receipt, details.currency, details.price);
                }
                // send iap transaction event
                this._thirdPartyEventManager.setTemplateValue('%ZONE%', placementId);
                const product: IProduct | undefined = this._products[productId];
                if (product) {
                    const events = campaign.getTrackingEventUrls();
                    if (events) {
                        const purchaseKey = 'purchase';
                        const purchaseEventUrls = events[purchaseKey];
                        for (const url of purchaseEventUrls) {
                            const urlData = Url.parse(url);
                            const sessionId = campaign.getSession().getId();
                            if (PromoEvents.purchaseHostnameRegex.test(urlData.hostname) && PromoEvents.purchasePathRegex.test(urlData.pathname)) {
                                this._promoEvents.onPurchaseSuccess({
                                    store: this._promoEvents.getAppStoreFromReceipt(details.receipt),
                                    productId: details.productId,
                                    storeSpecificId: details.productId,
                                    amount: details.price,
                                    currency: details.currency,
                                    native: isNative
                                }, product.productType, details.receipt)
                                .then((body) => {
                                    this._thirdPartyEventManager.sendWithPost(purchaseKey, sessionId, Url.addParameters(url, {'native': isNative, 'iap_service': false}), JSON.stringify(body));
                                });
                            } else {
                                this._thirdPartyEventManager.sendWithGet(purchaseKey, sessionId, url);
                            }
                        }
                    }
                }
                resolve(details);
            });
            onError = this._purchasing.CustomPurchasing.onTransactionError.subscribe((details) => {
                this._purchasing.CustomPurchasing.onTransactionError.unsubscribe(onError);
                this._purchasing.CustomPurchasing.onTransactionComplete.unsubscribe(onSuccess);
                // should send events
                const product: IProduct | undefined = this._products[productId];
                if (product) {
                    // send analytics event if analytics is enabled
                    if (this._analyticsManager) {
                        this._analyticsManager.onPurchaseFailed(productId, details.transactionError, product.localizedPrice, product.isoCurrencyCode);
                    }
                    // send iap transaction event
                    this._thirdPartyEventManager.setTemplateValue('%ZONE%', placementId);
                    const events = campaign.getTrackingEventUrls();
                    if (events) {
                        const purchaseKey = 'purchase';
                        const purchaseEventUrls = events[purchaseKey];
                        for (const url of purchaseEventUrls) {
                            const urlData = Url.parse(url);
                            const sessionId = campaign.getSession().getId();
                            if (PromoEvents.purchaseHostnameRegex.test(urlData.hostname) && PromoEvents.purchasePathRegex.test(urlData.pathname)) {
                                this._promoEvents.onPurchaseFailed({
                                    store: details.store,
                                    productId: productId,
                                    storeSpecificId: productId,
                                    amount: product.localizedPrice,
                                    currency: product.isoCurrencyCode,
                                    native: isNative
                                }, this._promoEvents.failureJson(details.storeSpecificErrorCode, details.exceptionMessage, AnalyticsManager.getPurchasingFailureReason(details.transactionError), productId))
                                .then((body) => {
                                    this._thirdPartyEventManager.sendWithPost(purchaseKey, sessionId, Url.addParameters(url, {'native': isNative, 'iap_service': false}), JSON.stringify(body));
                                });
                            } else {
                                this._thirdPartyEventManager.sendWithGet(purchaseKey, sessionId, url);
                            }
                        }
                    }
                }
                reject(new Error(`Did not complete transaction due to ${details.transactionError}:${details.exceptionMessage}`));
            });
            this._purchasing.CustomPurchasing.purchaseItem(productId, {}).catch(reject);
        });
    }

    public onPromoClosed(campaign: PromoCampaign) {
        // does nothing
    }

    private isValidProductType(productType: string | undefined): boolean {
        if (productType && productType.length > 0) {
            const lowercaseProductType = productType.toLowerCase();
            return lowercaseProductType === 'consumable' || lowercaseProductType === 'nonconsumable';
        }
        return false;
    }
}
