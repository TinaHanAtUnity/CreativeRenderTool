import { IPurchasingAdapter, ITransactionDetails, IProduct, ITransactionErrorDetails, OrganicPurchase, IOrganicPurchase } from 'Purchasing/PurchasingAdapter';
import { Observable1 } from 'Core/Utilities/Observable';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { IObserver1 } from 'Core/Utilities/IObserver';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { Url } from 'Core/Utilities/Url';
import { Request } from 'Core/Utilities/Request';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { StorageType } from 'Core/Native/Storage';

export class CustomPurchasingAdapter implements IPurchasingAdapter {
    public readonly onCatalogRefreshed = new Observable1<IProduct[]>();
    private _nativeBridge: NativeBridge;
    private _analyticsManager: AnalyticsManager | undefined;
    private _promoEvents: PromoEvents;
    private _products: {[productId: string]: IProduct};
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _request: Request;
    private static InAppPurchaseStorageKey = 'iap.purchases';

    constructor(nativeBridge: NativeBridge, analyticsManager: AnalyticsManager | undefined, promoEvents: PromoEvents, request: Request) {
        this._nativeBridge = nativeBridge;
        this._analyticsManager = analyticsManager;
        this._promoEvents = promoEvents;
        this._products = {};
        this._request = request;

        this._thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request, {});

        this.getOrganicPurchase();
        this._nativeBridge.Storage.onSet.subscribe(() => this.getOrganicPurchase());
    }

    public initialize() {
        return Promise.resolve();
    }

    private getOrganicPurchase(): Promise<void> {
        return this._nativeBridge.Storage.get(StorageType.PUBLIC, CustomPurchasingAdapter.InAppPurchaseStorageKey).then((data: any) => {
            if (data && data.length && data.length > 0) {
                for(const event of data) {
                    const organicPurchaseEvent = new OrganicPurchase(event);
                    this.postOrganicPurchaseEvents(organicPurchaseEvent);
                }
                this.resetIAPPurchaseMetaData();
            }
        });
    }

    private resetIAPPurchaseMetaData(): Promise<void> {
        return this._nativeBridge.Storage.set(StorageType.PUBLIC, CustomPurchasingAdapter.InAppPurchaseStorageKey, []).then(() => {
            this._nativeBridge.Storage.write(StorageType.PUBLIC);
        });
    }

    private postOrganicPurchaseEvents(organicPurchaseEvent: OrganicPurchase) {
        const productId = organicPurchaseEvent.getId();
        let productType: string | undefined;
        if (productId) {
            const product = this._products[productId];
            if (product) {
                productType = product.productType;
            }
        }
        this._promoEvents.onOrganicPurchaseSuccess({
            store: this._promoEvents.getAppStoreFromReceipt(organicPurchaseEvent.getReceipt()),
            productId: organicPurchaseEvent.getId(),
            storeSpecificId: organicPurchaseEvent.getId(),
            amount: organicPurchaseEvent.getPrice(),
            currency: organicPurchaseEvent.getCurrency(),
            native: false}, productType, organicPurchaseEvent.getReceipt()).then((body) => {
                this._request.post(Url.addParameters('https://events.iap.unity3d.com/events/v1/organic_purchase', {'native': false, 'iap_service': false}), JSON.stringify(body));
            }
        );
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

    public purchaseItem(productId: string, campaign: PromoCampaign, placementId: string, isNative: boolean): Promise<ITransactionDetails> {
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
            this._nativeBridge.Monetization.CustomPurchasing.purchaseItem(productId, {}).catch(reject);
        });
    }

    public onPromoClosed(campaign: PromoCampaign) {
        // does nothing
    }
}
