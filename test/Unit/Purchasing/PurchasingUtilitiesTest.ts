import { IAdsApi } from 'Ads/IAds';
import { CampaignManager } from 'Ads/Managers/CampaignManager';

import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { Backend } from 'Backend/Backend';
import { assert, expect } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import IapPromoCatalog from 'json/IapPromoCatalog.json';
import { IPromoApi } from 'Promo/IPromo';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';

import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { CustomPurchasingAdapter } from 'Purchasing/CustomPurchasingAdapter';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { IProduct, ITransactionDetails } from 'Purchasing/PurchasingAdapter';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';

describe('PurchasingUtilitiesTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let promo: IPromoApi;
    let purchasing: IPurchasingApi;
    let analyticsManager: AnalyticsManager;
    let promoEvents: PromoEvents;

    let clientInfo: ClientInfo;
    let placementManager: PlacementManager;
    let campaignManager: CampaignManager;
    let sandbox: sinon.SinonSandbox;
    let promoCatalog: string;
    let request: RequestManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let metaDataManager: MetaDataManager;

    const initWithConfiguration = (configuration: any) => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        promo = TestFixtures.getPromoApi(nativeBridge);
        purchasing = TestFixtures.getPurchasingApi(nativeBridge);

        campaignManager = sinon.createStubInstance(CampaignManager);
        analyticsManager = sinon.createStubInstance(AnalyticsManager);
        promoEvents = sinon.createStubInstance(PromoEvents);
        request = sinon.createStubInstance(RequestManager);

        clientInfo = sinon.createStubInstance(ClientInfo);
        sandbox = sinon.createSandbox();

        promoCatalog = JSON.stringify(JSON.parse(IapPromoCatalog));
        (<any>purchasing).onInitialize = new Observable1<string>();
        (<any>purchasing).onCommandResult = new Observable1<string>();
        (<any>purchasing).onGetPromoVersion = new Observable1<string>();
        (<any>purchasing).onGetPromoCatalog = new Observable1<string>();

        (<any>campaignManager).onAdPlanReceived = new Observable2<number, number>();
        (<any>campaignManager).onCampaign = new Observable2<number, Campaign>();

        (<any>purchasing).CustomPurchasing.onProductsRetrieved = new Observable1<IProduct[]>();
        (<any>purchasing).CustomPurchasing.onTransactionComplete = new Observable1<ITransactionDetails>();
        (<any>purchasing).CustomPurchasing.onTransactionError = new Observable2<string, string>();

        sinon.stub(promo.Purchasing, 'getPromoCatalog').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'getPromoVersion').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'initiatePurchasingCommand').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'initializePurchasing').returns(Promise.resolve());
        (<sinon.SinonStub>clientInfo.getSdkVersion).returns(3000);

        const coreConfig = CoreConfigurationParser.parse(configuration);
        const adsConfig = AdsConfigurationParser.parse(configuration);
        placementManager = new PlacementManager(ads, adsConfig);

        sinon.stub(purchasing.CustomPurchasing, 'available').returns(Promise.resolve(true));
        sinon.stub(purchasing.CustomPurchasing, 'refreshCatalog').returns(Promise.resolve());
        sinon.stub(purchasing.CustomPurchasing, 'purchaseItem').returns(Promise.resolve());

        thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
        metaDataManager = sinon.createStubInstance(MetaDataManager);

        return PurchasingUtilities.initialize(core, promo, purchasing, clientInfo, coreConfig, adsConfig, placementManager, campaignManager, promoEvents, request, metaDataManager, analyticsManager);
    };

    describe('without Promo Placements', () => {
        beforeEach(() => {
            return initWithConfiguration(JSON.parse(ConfigurationAuctionPlc));
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('initialize', () => {
            it('should not call purchasing adapters refreshCatalog if promos are not in the config', () => {
                expect((<any>PurchasingUtilities)._purchasingAdapter).to.be.an.instanceof(CustomPurchasingAdapter);
                sinon.assert.notCalled(<sinon.SinonStub>purchasing.CustomPurchasing.refreshCatalog);
            });
        });
    });

    describe('with Promo Placements', () => {
        beforeEach(() => {
            return initWithConfiguration(JSON.parse(ConfigurationPromoPlacements));
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('initialize', () => {
            it('should set purchasing adapter and set isInitialized to true', () => {
                expect((<any>PurchasingUtilities)._purchasingAdapter).to.be.an.instanceof(CustomPurchasingAdapter);
                assert.isTrue(PurchasingUtilities.isInitialized());
            });

            it('should call purchasing adapters refreshCatalog with promos in the config', () => {
                expect((<any>PurchasingUtilities)._purchasingAdapter).to.be.an.instanceof(CustomPurchasingAdapter);
                sinon.assert.called(<sinon.SinonStub>purchasing.CustomPurchasing.refreshCatalog);
            });
        });

        describe('isInitialized', () => {
            it('should return true if Purchasing was initialized', () => {
                assert.isTrue(PurchasingUtilities.isInitialized());
            });
        });

        describe('onPurchase', () => {
            describe('onSuccess', () => {
                beforeEach(() => {
                    sandbox.stub(purchasing.CustomPurchasing.onTransactionComplete, 'subscribe').callsFake((resolve) => resolve({
                        id: 'myPromo',
                        receipt: 'moneymoneymoney',
                        extras: 'schooterdoooter'
                    }));
                    return PurchasingUtilities.onPurchase(thirdPartyEventManager, 'myPromo', TestFixtures.getPromoCampaign(), 'myCoolPlacement');
                });

                afterEach(() => {
                    sandbox.restore();
                });

                it('should call purchase item for current purchasing adapter', () => {
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.CustomPurchasing.purchaseItem, 'myPromo');
                });
            });

            describe('onFailure', () => {
                it('should fail when purchase item transaction fails over api', () => {
                    (<sinon.SinonStub>purchasing.CustomPurchasing.purchaseItem).returns(Promise.reject('fail'));
                    PurchasingUtilities.onPurchase(thirdPartyEventManager, 'test', TestFixtures.getPromoCampaign(), 'myCoolPlacement').catch((e) => {
                        assert.equal(e.message, undefined);
                    });
                });

                it('should fail when purchase item transaction error occurs ', () => {
                    sandbox.stub(purchasing.CustomPurchasing.onTransactionError, 'subscribe').callsFake((resolve) => resolve('UNKNOWN_ERROR', 'schooty'));
                    (<sinon.SinonStub>purchasing.CustomPurchasing.purchaseItem).returns(Promise.reject('fail'));
                    PurchasingUtilities.onPurchase(thirdPartyEventManager, 'test', TestFixtures.getPromoCampaign(), 'myCoolPlacement').catch((e) => {
                        assert.equal(e.message, `Did not complete transaction due to ${'UNKNOWN_ERROR'}:${'schooty'}`);
                    });
                });
            });
        });

        describe('refreshCatalog', () => {
            describe('onSuccess', () => {
                beforeEach(() => {
                    const promise = PurchasingUtilities.refreshCatalog();
                    purchasing.CustomPurchasing.onProductsRetrieved.trigger([
                            {
                                productId: 'myPromo',
                                localizedPriceString: '$0.00',
                                localizedTitle: 'test',
                                localizedPrice: 0,
                                productType: 'test1',
                                isoCurrencyCode: 'USA'
                            },
                            {
                                productId: '100.gold.coins',
                                localizedPriceString: '$0.99',
                                localizedTitle: 'test',
                                localizedPrice: 0,
                                productType: 'test2',
                                isoCurrencyCode: 'USA'
                            }
                        ]
                    );
                    return promise;
                });

                it('should set the catalog to the value returned by promo', () => {
                    assert.isTrue(PurchasingUtilities.isProductAvailable('myPromo'));
                    assert.isTrue(PurchasingUtilities.isProductAvailable('100.gold.coins'));
                });

                it('should not store a product that is not returned by promo', () => {
                    assert.isFalse(PurchasingUtilities.isProductAvailable('myScooter'));
                });
            });

            describe('onFail', () => {
                it('should fail when get promo catalog fetch over api fails', () => {
                    (<sinon.SinonStub>purchasing.CustomPurchasing.refreshCatalog).returns(Promise.reject('fail'));
                    PurchasingUtilities.refreshCatalog().catch((e) => {
                        assert.equal((<any>PurchasingUtilities)._refreshPromise, null);
                        assert.equal(e.message, undefined);
                    });
                });
            });
        });

        describe('onPromoClosed', () => {
            it('should resolve and do nothing for CustomPurchasingAdapter', () => {
                sandbox.stub(((<any>PurchasingUtilities)._purchasingAdapter), 'onPromoClosed');
                PurchasingUtilities.onPromoClosed(thirdPartyEventManager, TestFixtures.getPromoCampaign(), 'myCoolPlacement');
                sinon.assert.called(((<any>PurchasingUtilities)._purchasingAdapter).onPromoClosed);
            });
        });

        describe('getProductPrice', () => {
            beforeEach(() => {
                const promise = PurchasingUtilities.refreshCatalog();
                purchasing.CustomPurchasing.onProductsRetrieved.trigger([
                        {
                            productId: 'myPromo',
                            localizedPriceString: '$0.00',
                            localizedTitle: 'test',
                            localizedPrice: 0,
                            productType: 'test1',
                            isoCurrencyCode: 'USA'
                        },
                        {
                            productId: '100.gold.coins',
                            localizedPriceString: '$0.99',
                            localizedTitle: 'test',
                            localizedPrice: 0,
                            productType: 'test2',
                            isoCurrencyCode: 'USA'
                        }
                    ]
                );
                return promise;
            });

            it('should return undefined if product is not available', () => {
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);

                assert.isUndefined(PurchasingUtilities.getProductPrice('myPromo'));
            });

            it('should return the price of the product for the given productid if product is available', () => {
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);

                assert.equal(PurchasingUtilities.getProductPrice('myPromo'), '$0.00');
                assert.equal(PurchasingUtilities.getProductPrice('100.gold.coins'), '$0.99');
            });
        });

        describe('getProductName', () => {
            beforeEach(() => {
                const promise = PurchasingUtilities.refreshCatalog();
                purchasing.CustomPurchasing.onProductsRetrieved.trigger([
                        {
                            productId: '100.gold.coins',
                            localizedPriceString: '$0.99',
                            localizedTitle: 'goldcoins',
                            localizedPrice: 0,
                            productType: 'test2',
                            isoCurrencyCode: 'USA'
                        }
                    ]
                );
                return promise;
            });

            it('should return undefined if product is not available', () => {
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);
                assert.isUndefined(PurchasingUtilities.getProductName('myPromo'));
            });

            it('should return correct product name for the given productid if product is available', () => {
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
                assert.equal(PurchasingUtilities.getProductName('100.gold.coins'), 'goldcoins');
            });
        });

        describe('getProductType', () => {
            beforeEach(() => {
                const promise = PurchasingUtilities.refreshCatalog();
                purchasing.CustomPurchasing.onProductsRetrieved.trigger([
                        {
                            productId: '100.gold.coins',
                            localizedPriceString: '$0.99',
                            localizedTitle: 'test',
                            localizedPrice: 0,
                            productType: 'nonConsumable',
                            isoCurrencyCode: 'USA'
                        }
                    ]
                );
                return promise;
            });

            it('should be undefined if product is not available', () => {
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);
                assert.equal(PurchasingUtilities.getProductType('myPromo'), undefined);
            });

            it('should return correct product type for the given productid if product is available', () => {
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
                assert.equal(PurchasingUtilities.getProductType('100.gold.coins'), 'nonConsumable');
            });
        });

        describe('isProductAvailable', () => {
            beforeEach(() => {
                const promise = PurchasingUtilities.refreshCatalog();
                purchasing.CustomPurchasing.onProductsRetrieved.trigger([
                        {
                            productId: 'myPromo',
                            localizedPriceString: '$0.00',
                            localizedTitle: 'test',
                            localizedPrice: 0,
                            productType: 'test1',
                            isoCurrencyCode: 'USA'
                        },
                        {
                            productId: '100.gold.coins',
                            localizedPriceString: '$0.99',
                            localizedTitle: 'test',
                            localizedPrice: 0,
                            productType: 'test2',
                            isoCurrencyCode: 'USA'
                        }
                    ]
                );
                return promise;
            });

            it('should return true if given product id is in the product catalog', () => {
                assert.equal(true, PurchasingUtilities.isProductAvailable('myPromo'));
            });

            it('should return false if given product is not in the catalog', () => {
                assert.equal(false, PurchasingUtilities.isProductAvailable('booyah'));
            });

            describe('If promo catalog is invalid', () => {
                beforeEach(() => {
                    const promise = PurchasingUtilities.refreshCatalog();
                    purchasing.CustomPurchasing.onProductsRetrieved.trigger([]);
                    return promise;
                });
                it('should return false if catalog has has size of 0', () => {
                    assert.equal(false, PurchasingUtilities.isProductAvailable('myPromo'));
                });
            });
        });

        describe('isCatalogValid', () => {
            context('should be false', () => {
                beforeEach(() => {
                    const promise = PurchasingUtilities.refreshCatalog();
                    purchasing.CustomPurchasing.onProductsRetrieved.trigger([]);
                    return promise;
                });

                it('if the catalog contains zero products', () => {
                    assert.isFalse(PurchasingUtilities.isCatalogValid());
                });
            });

            context('should be true', () => {
                beforeEach(() => {
                    const promise = PurchasingUtilities.refreshCatalog();
                    purchasing.CustomPurchasing.onProductsRetrieved.trigger([
                        {
                            productId: 'test',
                            localizedPriceString: 'tset',
                            localizedTitle: 'test',
                            localizedPrice: 0,
                            productType: 'test',
                            isoCurrencyCode: 'USA'
                        }
                    ]);
                    return promise;
                });

                it('if the catalog contains at least one product', () => {
                    assert.isTrue(PurchasingUtilities.isCatalogValid());
                });
            });
        });
    });
});
