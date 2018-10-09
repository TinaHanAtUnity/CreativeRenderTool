import { IPurchasingAdapter, ITransactionDetails, IProduct, ITransactionErrorDetails } from 'Purchasing/PurchasingAdapter';
import { Observable1 } from 'Core/Utilities/Observable';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { IObserver2, IObserver1 } from 'Core/Utilities/IObserver';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { Url } from 'Core/Utilities/Url';
import { Request } from 'Core/Utilities/Request';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';

export class CustomPurchasingAdapter implements IPurchasingAdapter {
    public readonly onCatalogRefreshed = new Observable1<IProduct[]>();
    private _nativeBridge: NativeBridge;
    private _analyticsManager: AnalyticsManager | undefined;
    private _promoEvents: PromoEvents;
    private _products: {[productId: string]: IProduct};
    private _thirdPartyEventManager: ThirdPartyEventManager;

    private static purchasePathRegex = new RegExp('events\/v1\/purchase');
    private static purchaseHostnameRegex = new RegExp('events\.iap\.unity3d\.com');

    constructor(nativeBridge: NativeBridge, analyticsManager: AnalyticsManager | undefined, promoEvents: PromoEvents, request: Request) {
        this._nativeBridge = nativeBridge;
        this._analyticsManager = analyticsManager;
        this._promoEvents = promoEvents;
        this._products = {};

        this._thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request, {});
    }

    public initialize() {
        return Promise.resolve();
    }

    public refreshCatalog(): Promise<IProduct[]> {
        return new Promise<IProduct[]>((resolve, reject) => {
            const observer = this._nativeBridge.Monetization.CustomPurchasing.onProductsRetrieved.subscribe((products) => {
                this._nativeBridge.Monetization.CustomPurchasing.onProductsRetrieved.unsubscribe(observer);
                const productsDict: {[productId: string]: IProduct } = {};
                for (const product of products) {
                    productsDict[product.productId] = product;
                }
                this._products = productsDict;
                resolve(products);
            });
            this._nativeBridge.Monetization.CustomPurchasing.refreshCatalog().catch(reject);
        });
    }

    public purchaseItem(productId: string, campaign: PromoCampaign, placementId: string) {
        return new Promise<ITransactionDetails>((resolve, reject) => {
            let onError: IObserver1<ITransactionErrorDetails>;
            let onSuccess: IObserver1<ITransactionDetails>;
            onSuccess = this._nativeBridge.Monetization.CustomPurchasing.onTransactionComplete.subscribe((details) => {
                this._nativeBridge.Monetization.CustomPurchasing.onTransactionError.unsubscribe(onError);
                this._nativeBridge.Monetization.CustomPurchasing.onTransactionComplete.unsubscribe(onSuccess);
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
                            if (CustomPurchasingAdapter.purchaseHostnameRegex.test(urlData.hostname) && CustomPurchasingAdapter.purchasePathRegex.test(urlData.pathname)) {
                                this._promoEvents.onPurchaseSuccess(url, {
                                    store: '', // TODO // fill from details.receipt
                                    productId: details.productId,
                                    storeSpecificId: details.productId,
                                    amount: details.price,
                                    currency: details.currency
                                }, product.productType, details.receipt)
                                .then((body) => {
                                    this._thirdPartyEventManager.postEvent(purchaseKey, sessionId, url, JSON.stringify(body));
                                });
                            } else {
                                this._thirdPartyEventManager.getEvent(purchaseKey, sessionId, url);
                            }
                        }
                    }
                }
                resolve(details);
            });
            onError = this._nativeBridge.Monetization.CustomPurchasing.onTransactionError.subscribe((details) => {
                this._nativeBridge.Monetization.CustomPurchasing.onTransactionError.unsubscribe(onError);
                this._nativeBridge.Monetization.CustomPurchasing.onTransactionComplete.unsubscribe(onSuccess);
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
                            if (CustomPurchasingAdapter.purchaseHostnameRegex.test(urlData.hostname) && CustomPurchasingAdapter.purchasePathRegex.test(urlData.pathname)) {
                                this._promoEvents.onPurchaseFailed(url, {
                                    store: details.store,
                                    productId: productId,
                                    storeSpecificId: productId,
                                    amount: product.localizedPrice,
                                    currency: product.isoCurrencyCode
                                }, this._promoEvents.failureJson(details.storeSpecificErrorCode, details.exceptionMessage, AnalyticsManager.getPurchasingFailureReason(details.transactionError), productId))
                                .then((body) => {
                                    this._thirdPartyEventManager.postEvent(purchaseKey, sessionId, url, JSON.stringify(body));
                                });
                            } else {
                                this._thirdPartyEventManager.getEvent(purchaseKey, sessionId, url);
                            }
                        }
                    }
                }
                reject(new Error(`Did not complete transaction due to ${details.transactionError}:${details.exceptionMessage}`));
            });
            this._nativeBridge.Monetization.CustomPurchasing.purchaseItem(productId, {}).catch(reject);
        });
    }

    public onPromoClosed(campaign: PromoCampaign) {
        // does nothing
    }
}
