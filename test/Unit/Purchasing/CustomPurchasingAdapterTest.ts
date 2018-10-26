import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { CustomPurchasingAdapter } from 'Purchasing/CustomPurchasingAdapter';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { IProduct, ITransactionDetails, ITransactionErrorDetails } from 'Purchasing/PurchasingAdapter';
import * as sinon from 'sinon';
import { asStub } from 'TestHelpers/Functions';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('CustomPurchasingAdapter', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let purchasing: IPurchasingApi;
    let analyticsManager: AnalyticsManager;
    let promoEvents: PromoEvents;
    let request: RequestManager;
    let sandbox: sinon.SinonSandbox;
    let purchasingAdapter: CustomPurchasingAdapter;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        purchasing = TestFixtures.getPurchasingApi(nativeBridge);
        analyticsManager = sinon.createStubInstance(AnalyticsManager);
        promoEvents = sinon.createStubInstance(PromoEvents);
        request = sinon.createStubInstance(Request);
        sandbox = sinon.createSandbox();

        sinon.stub(purchasing.CustomPurchasing, 'refreshCatalog').returns(Promise.resolve());
        sinon.stub(purchasing.CustomPurchasing, 'purchaseItem').returns(Promise.resolve());

        purchasingAdapter = new CustomPurchasingAdapter(core, purchasing, promoEvents, request, analyticsManager);
        sandbox.stub((<any>purchasingAdapter)._thirdPartyEventManager, 'sendWithGet');
        sandbox.stub((<any>purchasingAdapter)._thirdPartyEventManager, 'sendWithPost');
    });

    const triggerRefreshCatalog = (value: IProduct[]) => {
        return new Promise((resolve) => {
            purchasing.CustomPurchasing.onProductsRetrieved.trigger(value);
            setTimeout(resolve);
        });
    };

    const triggerTransactionComplete = (value: ITransactionDetails) => {
        return new Promise((resolve) => {
            purchasing.CustomPurchasing.onTransactionComplete.trigger(value);
            setTimeout(resolve);
        });
    };

    const triggerTransactionError = (value: ITransactionErrorDetails) => {
        return new Promise((resolve) => {
            purchasing.CustomPurchasing.onTransactionError.trigger(value);
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
            (<sinon.SinonStub>purchasing.CustomPurchasing.refreshCatalog).restore();
            sinon.stub(purchasing.CustomPurchasing, 'refreshCatalog').rejects();

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
                receipt: '{\"Store\":\"GooglePlay\",\"TransactionID\":\"GPA.3375-3039-6434-59087\",\"Payload\":\"{\\\"skuDetails\\\":\\\"{\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"type\\\\\\\":\\\\\\\"inapp\\\\\\\",\\\\\\\"price\\\\\\\":\\\\\\\"$0.99\\\\\\\",\\\\\\\"price_amount_micros\\\\\\\":990000,\\\\\\\"price_currency_code\\\\\\\":\\\\\\\"USD\\\\\\\",\\\\\\\"title\\\\\\\":\\\\\\\"100 Gold Coins Title (MyFunGame)\\\\\\\",\\\\\\\"description\\\\\\\":\\\\\\\"100 Gold Coins\\\\\\\"}\\\",\\\"json\\\":\\\"{\\\\\\\"orderId\\\\\\\":\\\\\\\"GPA.3375-3039-6434-59087\\\\\\\",\\\\\\\"packageName\\\\\\\":\\\\\\\"me.hurricanerix.test.myfungame\\\\\\\",\\\\\\\"productId\\\\\\\":\\\\\\\"100.gold.coins\\\\\\\",\\\\\\\"purchaseTime\\\\\\\":1537918892707,\\\\\\\"purchaseState\\\\\\\":0,\\\\\\\"developerPayload\\\\\\\":\\\\\\\"{\\\\\\\\\\\\\\\"is_updated\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"has_introductory_price_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"is_free_trial\\\\\\\\\\\\\\\":false,\\\\\\\\\\\\\\\"developerPayload\\\\\\\\\\\\\\\":\\\\\\\\\\\\\\\"\\\\\\\\\\\\\\\"}\\\\\\\",\\\\\\\"purchaseToken\\\\\\\":\\\\\\\"jpdlckmodjjjfhnoapgegbmk.AO-J1OzZfbxaMZfZfvBysOlWJ06khJ9J8qeGJQ0dOOgcVAV11O_1cutYD1qUXnHzAITFoKXBhgf6pxO-Kr1LX19-Fp_ecHQjzoLlKHz-hKxcpJosMbiJ_0-bIBgYlcgjTXGPPYdrudpy\\\\\\\"}\\\",\\\"isPurchaseHistorySupported\\\":true,\\\"signature\\\":\\\"Kd18224WtNwtZCvGf\\\\/foEj\\\\/GU7suTNelMbU4fFW\\\\/SEZ6odkSCwUtC6ouuh19g4u7ehkejexXUkvOpFlatsX0Y\\\\/nv1H7qlXLUNcwTcoCy7GxKLsE4wCirzTOQlI0c4\\\\/t4TXw1+Y1rcEtR2HNIPJYg1wP86JAaSnKEbUoNSiRBxxwWDr9BSUhk8J0RPS1MQ7Fj43Y1YBZ+6ikJa+5dIbRPoqpcZ+8o8xgl\\\\/fsqbqQxMe+OIYuDK1SHcAqaQAG855HMrL8TlZiWWGVK0KEvbnuD0x7\\\\/wlfMMfgMJO23zC51Uy0q5gMhdKXOzU6D7nHGT31EWzUHLIiOlBZUfgJIB5akoA==\\\"}\"}',
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
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId', false);

                return triggerTransactionComplete(transactionDetails)
                    .then(() => {
                        return purchaseItemPromise.then((transactionDets) => {
                            sinon.assert.called(<sinon.SinonStub>analyticsManager.onIapTransaction);
                            assert.deepEqual(transactionDets, transactionDetails);
                        });
                });
            });

            it('should not send the purchase success event if given productId is not in the catalog', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId', false);

                return triggerTransactionComplete(transactionDetails)
                    .then(() => {
                        return purchaseItemPromise.then((transactionDets) => {
                            sinon.assert.notCalled(<sinon.SinonStub>promoEvents.onPurchaseSuccess);
                            assert.deepEqual(transactionDets, transactionDetails);
                        });
                });
            });

            it('should send the purchase success event and thirdpartyEvent post for purchase path url', () => {
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId', false);
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
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId', false);
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
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId', false);

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
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId', false);
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
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId', false);
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
                const purchaseItemPromise = purchasingAdapter.purchaseItem('productId', TestFixtures.getPromoCampaign(), 'placementId', false);
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
