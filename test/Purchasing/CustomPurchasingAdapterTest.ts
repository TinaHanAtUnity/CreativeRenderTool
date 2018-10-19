import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CustomPurchasingAdapter } from 'Purchasing/CustomPurchasingAdapter';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { RequestManager } from 'Core/Managers/RequestManager';
import { CustomPurchasingApi } from 'Purchasing/Native/CustomPurchasing';
import { IProduct, ITransactionErrorDetails, ITransactionDetails } from 'Purchasing/PurchasingAdapter';
import { Observable1 } from 'Core/Utilities/Observable';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { asStub } from 'TestHelpers/Functions';

describe('CustomPurchasingAdapter', () => {
    let nativeBridge: NativeBridge;
    let analyticsManager: AnalyticsManager;
    let promoEvents: PromoEvents;
    let request: RequestManager;
    let sandbox: sinon.SinonSandbox;
    let purchasingAdapter: CustomPurchasingAdapter;
    let customPurchasing: CustomPurchasingApi;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        analyticsManager = sinon.createStubInstance(AnalyticsManager);
        promoEvents = sinon.createStubInstance(PromoEvents);
        request = sinon.createStubInstance(Request);
        sandbox = sinon.createSandbox();
        customPurchasing = sinon.createStubInstance(CustomPurchasingApi);

        (<any>nativeBridge).Monetization = {
            CustomPurchasing: customPurchasing
        };

        (<sinon.SinonStub>customPurchasing.refreshCatalog).returns(Promise.resolve());
        (<sinon.SinonStub>customPurchasing.purchaseItem).returns(Promise.resolve());

        (<any>nativeBridge).Monetization.CustomPurchasing.onProductsRetrieved = new Observable1<IProduct[]>();
        (<any>nativeBridge).Monetization.CustomPurchasing.onTransactionComplete = new Observable1<ITransactionDetails>();
        (<any>nativeBridge).Monetization.CustomPurchasing.onTransactionError = new Observable1<ITransactionErrorDetails>();

        purchasingAdapter = new CustomPurchasingAdapter(nativeBridge, analyticsManager, promoEvents, request);
        sandbox.stub((<any>purchasingAdapter)._thirdPartyEventManager, 'sendWithGet');
        sandbox.stub((<any>purchasingAdapter)._thirdPartyEventManager, 'sendWithPost');
    });

    const triggerRefreshCatalog = (value: IProduct[]) => {
        return new Promise((resolve) => {
            (<any>nativeBridge).Monetization.CustomPurchasing.onProductsRetrieved.trigger(value);
            setTimeout(resolve);
        });
    };

    const triggerTransactionComplete = (value: ITransactionDetails) => {
        return new Promise((resolve) => {
            (<any>nativeBridge).Monetization.CustomPurchasing.onTransactionComplete.trigger(value);
            setTimeout(resolve);
        });
    };

    const triggerTransactionError = (value: ITransactionErrorDetails) => {
        return new Promise((resolve) => {
            (<any>nativeBridge).Monetization.CustomPurchasing.onTransactionError.trigger(value);
            setTimeout(resolve);
        });
    };

    afterEach(() => {
        sandbox.restore();
    });

    describe('RefreshCatalog', () => {

        it('should populate the products list and resolve on success', () => {
            const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

            const productArray: IProduct[] = [{
                productId: 'asdf',
                localizedPriceString: 'asdf',
                localizedTitle: 'asdf',
                productType: 'asdfasdf',
                isoCurrencyCode: 'asdfa',
                localizedPrice: 1
            }];

            return triggerRefreshCatalog(productArray)
                .then(() => {
                    return refreshCatalogPromise.then((products) => {
                        assert.deepEqual(products, productArray);
                    });
                });
        });

        it('should fail when onProductsRetrieved rejects', () => {
            (<sinon.SinonStub>customPurchasing.refreshCatalog).rejects();

            return purchasingAdapter.refreshCatalog().catch((e: any) => {
                assert.equal(e.message, 'Error');
            });
        });
    });

    describe('PurchaseItem', () => {
        describe('onSuccess', () => {

            const transactionDetails: ITransactionDetails = {
                productId: 'productId',
                transactionId: 'asdf',
                receipt: 'asdf',
                price: 1,
                currency: 'asdfa',
                extras: 'extra'
            };

            const productArray: IProduct[] = [{
                productId: 'productId',
                localizedPriceString: 'asdf',
                localizedTitle: 'asdf',
                productType: 'asdfasdf',
                isoCurrencyCode: 'asdfa',
                localizedPrice: 1
            }];

            it('should send iap transaction analytics event if analytics is enabled', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId');

                return triggerTransactionComplete(transactionDetails)
                    .then(() => {
                        return purchaseItemPromise.then((transactionDets) => {
                            sinon.assert.called(<sinon.SinonStub>analyticsManager.onIapTransaction);
                            assert.deepEqual(transactionDets, transactionDetails);
                        });
                });
            });

            it('should not send the purchase success event if given productId is not in the catalog', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId');

                return triggerTransactionComplete(transactionDetails)
                    .then(() => {
                        return purchaseItemPromise.then((transactionDets) => {
                            sinon.assert.notCalled(<sinon.SinonStub>promoEvents.onPurchaseSuccess);
                            assert.deepEqual(transactionDets, transactionDetails);
                        });
                });
            });

            it('should send the purchase success event and thirdpartyEvent post for purchase path url', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId');
                const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

                asStub(promoEvents.onPurchaseSuccess).returns(Promise.resolve());

                return triggerRefreshCatalog(productArray)
                    .then(() => {
                        return refreshCatalogPromise.then((products) => {
                            return triggerTransactionComplete(transactionDetails)
                                .then(() => {
                                    return purchaseItemPromise.then((transactionDets) => {
                                        sinon.assert.calledOnce(<sinon.SinonStub>promoEvents.onPurchaseSuccess);
                                        sinon.assert.calledOnce((<any>purchasingAdapter)._thirdPartyEventManager.sendWithPost);
                                        assert.deepEqual(transactionDets, transactionDetails);
                                    });
                            });
                        });
                    });
            });

            it('should send the thirdParty get of non purhcase path or hostname url', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId');
                const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

                asStub(promoEvents.onPurchaseSuccess).returns(Promise.resolve());

                return triggerRefreshCatalog(productArray)
                    .then(() => {
                        return refreshCatalogPromise.then((products) => {
                            return triggerTransactionComplete(transactionDetails)
                                .then(() => {
                                    return purchaseItemPromise.then((transactionDets) => {
                                        sinon.assert.calledOnce(<sinon.SinonStub>promoEvents.onPurchaseSuccess);
                                        sinon.assert.calledOnce((<any>purchasingAdapter)._thirdPartyEventManager.sendWithGet);
                                        assert.deepEqual(transactionDets, transactionDetails);
                                    });
                            });
                        });
                    });
            });
        });

        describe('onError', () => {

            const transactionErrorDetails: ITransactionErrorDetails = {
                transactionError: 'error',
                exceptionMessage: 'twas a problem',
                store: 'apples',
                storeSpecificErrorCode: 'apples turned brown',
                extras: 1
            };

            const productArray: IProduct[] = [{
                productId: 'productId',
                localizedPriceString: 'asdf',
                localizedTitle: 'asdf',
                productType: 'asdfasdf',
                isoCurrencyCode: 'asdfa',
                localizedPrice: 1
            }];

            it('should reject with error and not send iap purchase failed event product doesnt exist', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId');

                return triggerTransactionError(transactionErrorDetails)
                    .then(() => {
                        return purchaseItemPromise.then((transactionDets) => {
                            assert.fail('purchaseItem worked when it shouldn\'t\'ve');
                        }).catch((e) => {
                            sinon.assert.notCalled(<sinon.SinonStub>analyticsManager.onPurchaseFailed);
                            assert.equal(e.message, 'Did not complete transaction due to error:twas a problem');
                        });
                });
            });

            it('should reject with error and send iap purchase failed event if analytics is enabled and product does exist', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId');
                const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

                asStub(promoEvents.onPurchaseFailed).returns(Promise.resolve());

                return triggerRefreshCatalog(productArray)
                    .then(() => {
                        return refreshCatalogPromise.then((products) => {
                            return triggerTransactionError(transactionErrorDetails)
                                .then(() => {
                                    return purchaseItemPromise.then((transactionDets) => {
                                        assert.fail('purchaseItem worked when it shouldn\'t\'ve');
                                    }).catch((e) => {
                                        sinon.assert.calledOnce(<sinon.SinonStub>analyticsManager.onPurchaseFailed);
                                        assert.equal(e.message, 'Did not complete transaction due to error:twas a problem');
                                    });
                            });
                        });
                    });
            });

            it('should send the purchase failed event and thirdpartyEvent post for purchase path url', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId');
                const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

                asStub(promoEvents.onPurchaseFailed).returns(Promise.resolve());

                return triggerRefreshCatalog(productArray)
                    .then(() => {
                        return refreshCatalogPromise.then((products) => {
                            return triggerTransactionError(transactionErrorDetails)
                                .then(() => {
                                    return purchaseItemPromise.then((transactionDets) => {
                                        assert.fail('purchaseItem worked when it shouldn\'t\'ve');
                                    }).catch((e) => {
                                        sinon.assert.calledOnce(<sinon.SinonStub>analyticsManager.onPurchaseFailed);
                                        sinon.assert.calledOnce((<any>purchasingAdapter)._thirdPartyEventManager.sendWithPost);
                                        assert.equal(e.message, 'Did not complete transaction due to error:twas a problem');
                                    });
                            });
                        });
                    });
            });

            it('should send the thirdParty get of non purhcase path or hostname url', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId');
                const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

                asStub(promoEvents.onPurchaseFailed).returns(Promise.resolve());

                return triggerRefreshCatalog(productArray)
                    .then(() => {
                        return refreshCatalogPromise.then((products) => {
                            return triggerTransactionError(transactionErrorDetails)
                                .then(() => {
                                    return purchaseItemPromise.then((transactionDets) => {
                                        assert.fail('purchaseItem worked when it shouldn\'t\'ve');
                                    }).catch((e) => {
                                        sinon.assert.calledOnce(<sinon.SinonStub>analyticsManager.onPurchaseFailed);
                                        sinon.assert.calledWith((<any>purchasingAdapter)._thirdPartyEventManager.sendWithGet, 'purchase', '12345', 'http://test.purchase.com/purchase');
                                        assert.equal(e.message, 'Did not complete transaction due to error:twas a problem');
                                    });
                            });
                        });
                    });
            });
        });
    });
});
