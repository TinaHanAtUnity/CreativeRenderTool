import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CustomPurchasingAdapter } from 'Purchasing/CustomPurchasingAdapter';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { Request } from 'Core/Utilities/Request';
import { CustomPurchasingApi } from 'Purchasing/Native/CustomPurchasing';
import { IProduct, ITransactionErrorDetails, ITransactionDetails, OrganicPurchase} from 'Purchasing/PurchasingAdapter';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { asStub } from 'TestHelpers/Functions';
import { StorageApi, StorageType } from 'Core/Native/Storage';

describe('CustomPurchasingAdapter', () => {
    let nativeBridge: NativeBridge;
    let analyticsManager: AnalyticsManager;
    let promoEvents: PromoEvents;
    let request: Request;
    let sandbox: sinon.SinonSandbox;
    let purchasingAdapter: CustomPurchasingAdapter;
    let customPurchasing: CustomPurchasingApi;
    let onSetStub: sinon.SinonStub;
    let getStub: sinon.SinonStub;
    let setStub: sinon.SinonStub;
    let writeStub: sinon.SinonStub;
    let iapMetaData:any;
    let storageTrigger: (eventType: string, data: any) => void;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        analyticsManager = sinon.createStubInstance(AnalyticsManager);
        promoEvents = sinon.createStubInstance(PromoEvents);
        request = sinon.createStubInstance(Request);
        sandbox = sinon.createSandbox();
        customPurchasing = sinon.createStubInstance(CustomPurchasingApi);

        nativeBridge.Storage = sinon.createStubInstance(StorageApi);
        (<any>nativeBridge.Storage).onSet = new Observable2<string, object>();
        onSetStub = sinon.stub(nativeBridge.Storage.onSet, 'subscribe');
        getStub = <sinon.SinonStub>nativeBridge.Storage.get;
        setStub = (<sinon.SinonStub>nativeBridge.Storage.set).resolves();
        writeStub = (<sinon.SinonStub>nativeBridge.Storage.write).resolves();
        iapMetaData = '{ iap_purchases: {productId: {value: \'productIDID\'}, price: {value:1.25} }}';
        getStub.callsFake((fun) => {
           return Promise.resolve(iapMetaData);
        });
        onSetStub.callsFake((fun) => {
            storageTrigger = fun;
        });

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

    it('should subscribe to Storage.onSet', () => {
        sinon.assert.calledOnce(onSetStub);
    });

    describe('iap.purchases metadata', () => {
        it('should not do anything if iap.purchases is undefined', () => {
            storageTrigger('', {});
            sinon.assert.calledOnce(onSetStub);
            sinon.assert.notCalled(setStub);
        });

        it('should retrieve iap.purchase metadata',() => {
            iapMetaData = '{ iap_purchases: {productId: {value: \'productIDID\'}, price: {value:1.25} }}';
            storageTrigger('', {'iap.purchases': {productId: {value: 'productIDID'}, price: {value:1.25} }});
            asStub(promoEvents.onOrganicPurchaseSuccess).returns(Promise.resolve());
            return Promise.resolve().then(() => {
                sinon.assert.calledOnce(onSetStub);
                sinon.assert.calledWith(getStub, StorageType.PUBLIC, 'iap.purchases');
                sinon.assert.calledWith(setStub, StorageType.PUBLIC, 'iap.purchases', []);
                return(<Promise<void>>getStub.firstCall.returnValue).then((data) => {
                    assert.deepEqual(data, iapMetaData);
                    sinon.assert.called(<sinon.SinonStub>promoEvents.onOrganicPurchaseSuccess);
                    sinon.assert.called(<sinon.SinonStub>request.post);
                });
            });  
        });
        it('should reset iap.purchase metadata after each retrieve', () => {
            sinon.assert.calledOnce(onSetStub);
            return(<Promise<void>>getStub.firstCall.returnValue).then((iapPurchases) => {
                assert.deepEqual('', '');
            });
        });
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
