import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { PurchasingUtilities, IPromoPayload, IPromoRequest } from 'Utilities/PurchasingUtilities';
import { NativeBridge } from 'Native/NativeBridge';
import { PurchasingApi } from 'Native/Api/Purchasing';
import { Observable1 } from 'Utilities/Observable';
import { SdkApi } from 'Native/Api/Sdk';
import { ConfigurationParser } from 'Parsers/ConfigurationParser';
import { ClientInfo } from 'Models/ClientInfo';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';

describe('PurchasingUtilitiesTest', () => {
    let nativeBridge: NativeBridge;
    let purchasing: PurchasingApi;
    let sdk: SdkApi;
    let clientInfo: ClientInfo;
    let sandbox: sinon.SinonSandbox;
    const promoCatalog = '[\n  {\n    \"localizedPriceString\" : \"$0.00\",\n    \"localizedTitle\" : \"Sword of Minimal Value\",\n    \"productId\" : \"myPromo\"\n  },\n  {\n    \"localizedPriceString\" : \"$0.99\",\n    \"localizedTitle\" : \"100 in-game Gold Coins\",\n    \"productId\" : \"100.gold.coins\"\n  }\n]';
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

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        purchasing = sinon.createStubInstance(PurchasingApi);
        sdk = sinon.createStubInstance(SdkApi);
        clientInfo = sinon.createStubInstance(ClientInfo);
        sandbox = sinon.sandbox.create();
        nativeBridge.Sdk = sdk;
        (<any>purchasing).onInitialize = new Observable1<string>();
        (<any>purchasing).onCommandResult = new Observable1<string>();
        (<any>purchasing).onGetPromoVersion = new Observable1<string>();
        (<any>purchasing).onGetPromoCatalog = new Observable1<string>();
        (<sinon.SinonStub>purchasing.getPromoCatalog).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.getPromoVersion).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.initiatePurchasingCommand).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.initializePurchasing).returns(Promise.resolve());
        (<any>nativeBridge).Purchasing = purchasing;
        const configuration = ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
        PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('sendPurchaseInitializationEvent', () => {
        it('should resolve without calling sendPurchasingCommand if configuration does not include promo', () => {
            const configuration = ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge);
            return PurchasingUtilities.sendPurchaseInitializationEvent().then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initializePurchasing);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.getPromoVersion);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        it('should call SendPurchasingCommand on successful trigger of all underlying promises', () => {
            const configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge);
            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.16'));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));

            PurchasingUtilities.sendPurchaseInitializationEvent().then(() => {
                sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
            });
        });

        it('should fail with IAP Promo was not ready if promo is not ready', () => {
            const configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge);
            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('False'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.16'));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));
            PurchasingUtilities.sendPurchaseInitializationEvent().catch((e) => {
                assert.equal(e.message, 'IAP Promo was not ready');
            });
            sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
        });

        it('should fail with Promo version not supported if promo version is not 1.16 or above', () => {
            const configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const promoVersion = '1.15';
            PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge);
            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve(promoVersion));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));

            PurchasingUtilities.sendPurchaseInitializationEvent().catch((e) => {
                assert.equal(e.message, `Promo version: ${promoVersion} is not supported`);
            });
            sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
        });

        it('should set isInitialized to true when successful', () => {
            const configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge);

            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.16'));
            sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));

            PurchasingUtilities.sendPurchaseInitializationEvent().then(() => {
                sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
                assert.isTrue(PurchasingUtilities.isInitialized());
            });
        });

        it('should not set isInitialized to true if command result is false', () => {
            const configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge);

            sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
            sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.16'));

            PurchasingUtilities.sendPurchaseInitializationEvent().then(() => {
                sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
                assert.isFalse(PurchasingUtilities.isInitialized());
            });
        });
    });

    describe('sendPromoPayload', () => {
        describe('on Successful command trigger', () => {
            let sendPurchaseInitializationEventStub: sinon.SinonStub;

            beforeEach(() => {
                sinon.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));
                sendPurchaseInitializationEventStub = sandbox.stub(PurchasingUtilities, 'sendPurchaseInitializationEvent').resolves();
            });

            it('should call initialization event and initiate purchasing command when initialization Payloads are not set', () => {
                sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);

                return PurchasingUtilities.sendPromoPayload(JSON.stringify(iapPayloadPurchase)).then(() => {
                    sinon.assert.called(sendPurchaseInitializationEventStub);
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                });
            });

            it ('should call initiate purchasing command when initialization Payloads are set', () => {
                sandbox.stub(PurchasingUtilities, 'isInitialized').returns(true);

                return PurchasingUtilities.sendPromoPayload(JSON.stringify(iapPayloadPurchase)).then(() => {
                    sinon.assert.notCalled(sendPurchaseInitializationEventStub);
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                });

            });
        });

        describe('on Failed command trigger', () => {

            it('should fail when onCommandResult triggered with false', () => {
                sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);

                PurchasingUtilities.sendPromoPayload(JSON.stringify(iapPayloadPurchase)).catch((e) => {
                    assert.equal(e.message, 'Purchase command attempt failed');
                });
                purchasing.onCommandResult.trigger('False');
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
});
