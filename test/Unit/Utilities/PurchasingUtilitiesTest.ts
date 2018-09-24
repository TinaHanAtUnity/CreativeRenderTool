import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { assert } from 'chai';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Observable1 } from 'Core/Utilities/Observable';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import IapPromoCatalog from 'json/IapPromoCatalog.json';
import 'mocha';
import { PurchasingApi } from 'Promo/Native/Purchasing';

import { IPromoPayload, IPromoRequest, PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PurchasingUtilitiesTest', () => {
    let nativeBridge: NativeBridge;
    let purchasing: PurchasingApi;
    let sdk: SdkApi;
    let clientInfo: ClientInfo;
    let placementManager: PlacementManager;
    let sandbox: sinon.SinonSandbox;
    let promoCatalog: string;
    const promoCatalogBad = '[\n    {\"pn}]';
    const promoCatalogEmpty = '[]';
    const iapPayloadPurchase: IPromoPayload = {
        productId: 'myPromo',
        trackingOptOut: false,
        gamerToken: '111',
        iapPromo: true,
        gameId: '222',
        abGroup: 1,
        request: IPromoRequest.PURCHASE,
        purchaseTrackingUrls: ['https://www.scooooooooter.com', 'https://www.scottyboy.com']
    };

    const iapPayloadSetIds: IPromoPayload = {
        productId: 'myPromo',
        trackingOptOut: false,
        gamerToken: '111',
        iapPromo: true,
        gameId: '222',
        abGroup: 1,
        request: IPromoRequest.SETIDS,
        purchaseTrackingUrls: ['https://www.scooooooooter.com', 'https://www.scottyboy.com']
    };

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        purchasing = sinon.createStubInstance(PurchasingApi);
        sdk = sinon.createStubInstance(SdkApi);
        clientInfo = sinon.createStubInstance(ClientInfo);
        sandbox = sinon.sandbox.create();
        nativeBridge.Sdk = sdk;
        promoCatalog = JSON.stringify(JSON.parse(IapPromoCatalog));
        (<any>purchasing).onInitialize = new Observable1<string>();
        (<any>purchasing).onCommandResult = new Observable1<string>();
        (<any>purchasing).onGetPromoVersion = new Observable1<string>();
        (<any>purchasing).onGetPromoCatalog = new Observable1<string>();
        (<sinon.SinonStub>purchasing.getPromoCatalog).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.getPromoVersion).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.initiatePurchasingCommand).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.initializePurchasing).returns(Promise.resolve());
        (<any>nativeBridge).Purchasing = purchasing;
        const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
        const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
        placementManager = new PlacementManager(nativeBridge, adsConfig);
        PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('sendPurchaseInitializationEvent', () => {

        it('should resolve without calling sendPurchasingCommand if configuration does not include promo', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);
            return PurchasingUtilities.sendPurchaseInitializationEvent().then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initializePurchasing);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.getPromoVersion);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        xit('should fail with IAP Promo was not ready if promo is not ready', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);
            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('False'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.16'));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));

            return PurchasingUtilities.sendPurchaseInitializationEvent().catch((e) => {
                assert.equal(e.message, 'IAP Promo was not ready');
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        xit('should fail with Promo version not supported if promo version is not 1.16 or above', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);
            const promoVersion = '1.15';
            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve(promoVersion));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));

            return PurchasingUtilities.sendPurchaseInitializationEvent().catch((e) => {
                assert.equal(e.message, `Promo version: ${promoVersion} is not supported`);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        xit('should fail with Promo version not supported if promo version split length is less than 2', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);
            const promoVersion = '1';
            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve(promoVersion));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));

            return PurchasingUtilities.sendPurchaseInitializationEvent().catch((e) => {
                assert.equal(e.message, `Promo version: ${promoVersion} is not supported`);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        xit('should fail and not set isInitialized to true if command result is false', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);

            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.16'));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('False'));

            return PurchasingUtilities.sendPurchaseInitializationEvent().catch((e) => {
                assert.equal(e.message, 'Purchase command attempt failed with command False');
                sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
                assert.isFalse(PurchasingUtilities.isInitialized());
            });
        });

        it('should fail when initializePurchasing rejects', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);
            (<sinon.SinonStub>purchasing.initializePurchasing).rejects();

            return PurchasingUtilities.sendPurchaseInitializationEvent().catch((e: any) => {
                assert.equal(e.message, 'Purchase initialization failed');
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        xit('should fail when getPromoVersion rejects', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);

            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            (<sinon.SinonStub>purchasing.getPromoVersion).rejects();

            return PurchasingUtilities.sendPurchaseInitializationEvent().catch((e: any) => {
                assert.equal(e.message, 'Promo version check failed');
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        xit('should fail when initiatePurchasingCommand rejects', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);

            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.16'));
            (<sinon.SinonStub>purchasing.initiatePurchasingCommand).rejects();

            return PurchasingUtilities.sendPurchaseInitializationEvent().catch((e: any) => {
                assert.equal(e.message, 'Purchase event failed to send');
            });
        });

        xit('should call SendPurchasingCommand on successful trigger of all underlying promises', () => {
            const coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, coreConfig, adsConfig, nativeBridge, placementManager);
            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.16'));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));

            return PurchasingUtilities.sendPurchaseInitializationEvent().then(() => {
                sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
                assert.isTrue(PurchasingUtilities.isInitialized());
            });
        });
    });

    describe('sendPromoPayload', () => {
        describe('on Successful command trigger', () => {
            let sendPurchaseInitializationEventStub: sinon.SinonStub;
            const PromoUtilities: any = PurchasingUtilities;

            beforeEach(() => {
                sinon.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));
                sendPurchaseInitializationEventStub = sandbox.stub(PurchasingUtilities, 'sendPurchaseInitializationEvent').resolves();
                PromoUtilities._isInitialized = false;
            });

            it('should not set isInitialized to true if payload passed does not include SETIDS', () => {

                return PromoUtilities.sendPromoPayload(iapPayloadPurchase).then(() => {
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                    assert.isFalse(PromoUtilities.isInitialized());
                });
            });

            it('should set isInitialized to true if payload passed does includes SETIDS', () => {

                return PromoUtilities.sendPromoPayload(iapPayloadSetIds).then(() => {
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadSetIds));
                    assert.isTrue(PromoUtilities.isInitialized());
                });
            });

            it('should call initialization event and initiate purchasing command when initialization Payloads are not set', () => {
                sandbox.stub(PromoUtilities, 'isInitialized').returns(false);

                return PromoUtilities.sendPromoPayload(iapPayloadSetIds).then(() => {
                    sinon.assert.called(sendPurchaseInitializationEventStub);
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadSetIds));
                });
            });

            it ('should call initiate purchasing command when initialization Payloads are set', () => {
                sandbox.stub(PromoUtilities, 'isInitialized').returns(true);

                return PromoUtilities.sendPromoPayload(iapPayloadPurchase).then(() => {
                    sinon.assert.notCalled(sendPurchaseInitializationEventStub);
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                });
            });
        });

        describe('on Failed command trigger', () => {

            it('should fail when onCommandResult triggered with false', () => {
                sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);

                PurchasingUtilities.sendPromoPayload(iapPayloadPurchase).catch((e) => {
                    assert.equal(e.message, 'Purchase command attempt failed');
                });
                purchasing.onCommandResult.trigger('False');
            });
        });
    });

    describe('isCatalogValid', () => {
        context('should be false', () => {
            it('if the catalog contains zero products', () => {
                assert.isFalse(PurchasingUtilities.isCatalogValid());
            });
        });

        context('should be true', () => {
            beforeEach(() => {
                const promise = PurchasingUtilities.refreshCatalog();
                purchasing.onGetPromoCatalog.trigger(promoCatalog);
                return promise;
            });

            it('if the catalog contains at least one product', () => {
                sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
                assert.isTrue(PurchasingUtilities.isCatalogValid());
            });
        });
    });

    describe('refreshCatalog', () => {
        describe('onSuccess', () => {
            beforeEach(() => {
                const promise = PurchasingUtilities.refreshCatalog();
                purchasing.onGetPromoCatalog.trigger(promoCatalog);
                return promise;
            });

            it('should set the catalog to the value returned by promo', () => {
                sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
                assert.isTrue(PurchasingUtilities.isProductAvailable('myPromo'));
            });

            it('should not store a product that is not returned by promo', () => {
                sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
                assert.isFalse(PurchasingUtilities.isProductAvailable('myScooter'));
            });
        });

        describe('onFail', () => {
            it('should fail when json is bad', () => {
                PurchasingUtilities.refreshCatalog().catch((e) => {
                    assert.equal(e.message, 'Promo catalog JSON failed to parse');
                });
                purchasing.onGetPromoCatalog.trigger(promoCatalogBad);
            });

            it('should fail when blank string catalog is returned from promo', () => {
                PurchasingUtilities.refreshCatalog().catch((e) => {
                    assert.equal(e.message, 'Promo catalog JSON failed to parse');
                });
                purchasing.onGetPromoCatalog.trigger('');
            });

            it('should fail when get promo catalog fetch over api fails', () => {
                (<sinon.SinonStub>purchasing.getPromoCatalog).returns(Promise.reject('fail'));
                PurchasingUtilities.refreshCatalog().catch((e) => {
                    assert.equal(e.message, 'Purchasing Catalog failed to refresh');
                });
            });
        });
    });

    describe('getProductPrice', () => {
        beforeEach(() => {
            const promise = PurchasingUtilities.refreshCatalog();
            purchasing.onGetPromoCatalog.trigger(promoCatalog);
            return promise;
        });

        it('should throw error if product is not available', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);

            assert.throws(() => PurchasingUtilities.getProductPrice('myPromo'));
        });

        it('should return the price of the product for the given productid if product is available', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);

            assert.equal(PurchasingUtilities.getProductPrice('myPromo'), '$0.00');
            assert.equal(PurchasingUtilities.getProductPrice('100.gold.coins'), '$0.99');
        });
    });

    describe('getProductType', () => {
        beforeEach(() => {
            const promise = PurchasingUtilities.refreshCatalog();
            purchasing.onGetPromoCatalog.trigger(promoCatalog);
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

        it('should return undefined product type for the given productid if product is available but product type is missing from catalog', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            assert.equal(PurchasingUtilities.getProductType('myPromo'), undefined);
        });
    });

    describe('isProductAvailable', () => {
        beforeEach(() => {
            const promise = PurchasingUtilities.refreshCatalog();
            purchasing.onGetPromoCatalog.trigger(promoCatalog);
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
                purchasing.onGetPromoCatalog.trigger(promoCatalogEmpty);
                return promise;
            });
            it('should return false if catalog has has size of 0', () => {
                assert.equal(false, PurchasingUtilities.isProductAvailable('myPromo'));
            });
        });
    });

    describe('Handle Send Event', () => {

        beforeEach(() => {
            sandbox.stub(PurchasingUtilities.placementManager, 'setPlacementReady');
            sandbox.stub(PurchasingUtilities.placementManager, 'setPlacementState');
            sandbox.stub(PurchasingUtilities, 'sendPurchaseInitializationEvent').returns(Promise.resolve());
            sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('Should send the purchase initialization event and call refresh catalog when iap payload type is catalogupdated', () => {
            sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);

            return PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(() => {
                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.sendPurchaseInitializationEvent);
                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
            });
        });

        it('Should not send the purchase initialization event if IAP is already initialized', () => {
            sandbox.stub(PurchasingUtilities, 'isInitialized').returns(true);

            return PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.sendPurchaseInitializationEvent);
                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
            });
        });

        it('Should not handle update when passed iap payload type is not CatalogUpdated', () => {
            sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);

            return PurchasingUtilities.handleSendIAPEvent('{"type":"sadfasdf"}').then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.sendPurchaseInitializationEvent);
                sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
            }).catch((e) => {
                assert.equal(e.message, 'IAP Payload is incorrect');
            });
        });

        it('Should set the current placement state to nofill if product is not in the catalog', () => {
            const campaign = TestFixtures.getPromoCampaign();
            sandbox.stub(PurchasingUtilities.placementManager, 'getPlacementCampaignMap').returns({'promoPlacement': campaign});

            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);
            sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);
            sandbox.stub(campaign, 'getAdType').returns('purchasing/iap');

            return PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(() => {
                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.sendPurchaseInitializationEvent);
                sinon.assert.calledWith(<sinon.SinonSpy>PurchasingUtilities.isProductAvailable, 'com.example.iap.product1');
                sinon.assert.calledWith(<sinon.SinonSpy>PurchasingUtilities.placementManager.setPlacementState, 'promoPlacement', PlacementState.NO_FILL);
            });
        });

        it('Should set the placement as ready if product is in the catalog', () => {
            const campaign = TestFixtures.getPromoCampaign();
            sandbox.stub(PurchasingUtilities.placementManager, 'getPlacementCampaignMap').returns({'promoPlacement': campaign});

            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);

            return PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(() => {
                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.sendPurchaseInitializationEvent);
                sinon.assert.calledWith(<sinon.SinonSpy>PurchasingUtilities.isProductAvailable, 'com.example.iap.product1');
                sinon.assert.calledWith(<sinon.SinonSpy>PurchasingUtilities.placementManager.setPlacementReady, 'promoPlacement', campaign);
            });
        });

        it('Should set the placement as nofill if campaign is not a promo campaign', () => {
            const campaign = TestFixtures.getXPromoCampaign();
            sandbox.stub(PurchasingUtilities.placementManager, 'getPlacementCampaignMap').returns({'placement': campaign});

            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);

            return PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(() => {
                sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.sendPurchaseInitializationEvent);
                sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.isProductAvailable);
                sinon.assert.calledWith(<sinon.SinonSpy>PurchasingUtilities.placementManager.setPlacementState, 'placement', PlacementState.NO_FILL);
            });
        });
    });
});
