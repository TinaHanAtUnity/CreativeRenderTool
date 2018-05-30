import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { MetaData } from 'Utilities/MetaData';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { PurchasingUtilities, IPromoPayload, IPromoRequest } from 'Utilities/PurchasingUtilities';
import { NativeBridge } from 'Native/NativeBridge';
import { PurchasingApi } from 'Native/Api/Purchasing';
import { Observable1 } from 'Utilities/Observable';
import { PurchasingCatalog } from 'Models/PurchasingCatalog';
import { SdkApi } from 'Native/Api/Sdk';
import { SinonSandbox, SinonStub } from 'sinon';
import { setTimeout } from 'timers';
import { Configuration } from 'Models/Configuration';
import { ClientInfo } from 'Models/ClientInfo';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';

describe('PurchasingUtilitiesTest', () => {
    let nativeBridge: NativeBridge;
    let purchasing: PurchasingApi;
    let sdk: SdkApi;
    let sandbox: sinon.SinonSandbox;
    const promoCatalog = '[\n  {\n    \"localizedPriceString\" : \"$0.00\",\n    \"localizedTitle\" : \"Sword of Minimal Value\",\n    \"productId\" : \"myPromo\"\n  },\n  {\n    \"localizedPriceString\" : \"$0.99\",\n    \"localizedTitle\" : \"100 in-game Gold Coins\",\n    \"productId\" : \"100.gold.coins\"\n  }\n]';
    const promoCatalogBad = '[\n  \n    \"localizedPriceString\" : \"$0.00\",\n    \"localizedTitle\" : \"Sword of Minimal Value\",\n    \"productId\" : \"myPromo\"\n  },\n  {\n    \"localizedPriceString\" : \"$0.99\",\n    \"localizedTitle\" : \"100 in-game Gold Coins\",\n    \"productId\" : \"100.gold.coins\"\n  }\n]';
    const iapPayloadPurchase: IPromoPayload = {
        productId: 'myPromo',
        iapPromo: true,
        gameId: '222',
        abGroup: 1,
        request: IPromoRequest.PURCHASE,
        purchaseTrackingUrls: ['https://www.scooooooooter.com', 'https://www.scottyboy.com']
    };

    const iapPayloadSetIDs: IPromoPayload = {
        productId: 'myPromo',
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

    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('sendPromoPayload', () => {
        describe('on Successful command trigger', () => {
            describe('when initialization Payloads are not set', () => {
                let sendPurchaseInitializationEventStub: sinon.SinonStub;
                beforeEach(() => {
                    sinon.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));
                    sendPurchaseInitializationEventStub = sandbox.stub(PurchasingUtilities, 'sendPurchaseInitializationEvent').resolves();

                    const promise = PurchasingUtilities.sendPromoPayload(nativeBridge, JSON.stringify(iapPayloadPurchase));
                    return promise;
                });
                it('should call initialization event and call send purchasing command', function(this: Mocha.ITestCallbackContext) {
                    sinon.assert.called(sendPurchaseInitializationEventStub);
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                });
            });

            describe('when initialization Payloads are set', () => {
                beforeEach(() => {
                    PurchasingUtilities.setInitializationPayloadSentValue(true);
                    const promise = PurchasingUtilities.sendPromoPayload(nativeBridge, JSON.stringify(iapPayloadPurchase));
                    purchasing.onCommandResult.trigger('True');
                    return promise;
                });
                it ('should call send purchasing command', () => {
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                });
            });
        });

        describe('on Failed command trigger', () => {
            beforeEach(() => {
                PurchasingUtilities.setInitializationPayloadSentValue(false);
            });
            it('should fail when onCommandResult triggered with false', () => {
                PurchasingUtilities.sendPromoPayload(nativeBridge, JSON.stringify(iapPayloadPurchase)).then(() => {
                    assert.fail('should not resolve');
                }).catch((e) => {
                    assert.equal(e.message, 'Purchase command attempt failed');
                });
                purchasing.onCommandResult.trigger('False');
            });
        });
    });

    describe('Refresh Catalog', () => {
        describe('onSuccess', () => {
            beforeEach(() => {
                const promise = PurchasingUtilities.refreshCatalog(nativeBridge);
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
                PurchasingUtilities.refreshCatalog(nativeBridge).then(() => {
                    assert.fail('should not resolve');
                }).catch((e) => {
                    assert.equal(e.message, 'Promo catalog JSON failed to parse');
                });
                purchasing.onGetPromoCatalog.trigger(promoCatalogBad);
            });

            it('should fail when blank string catalog is returned from promo', () => {
                PurchasingUtilities.refreshCatalog(nativeBridge).then(() => {
                    assert.fail('should not resolve');
                }).catch((e) => {
                    assert.equal(e.message, 'Promo catalog JSON failed to parse');
                });
                purchasing.onGetPromoCatalog.trigger('');
            });

            it('should fail when get promo catalog fetch over api fails', () => {
                (<sinon.SinonStub>purchasing.getPromoCatalog).returns(Promise.reject('fail'));
                PurchasingUtilities.refreshCatalog(nativeBridge).then(() => {
                    assert.fail('should not resolve');
                }).catch((e) => {
                    assert.equal(e.message, 'Purchasing Catalog failed to refresh');
                });
            });
        });
    });

    describe('sendPurchaseInitializationEvent', () => {
        beforeEach(() => {
            const configuration = new Configuration(JSON.parse(ConfigurationAuctionPlc));
            PurchasingUtilities.setConfiguration(configuration);
        });
        it('should resolve without calling sendPurchasingCommand if configuration does not include promo', (done) => {
            const promise = PurchasingUtilities.sendPurchaseInitializationEvent(nativeBridge);
            promise.then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initializePurchasing);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.getPromoVersion);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
                done();
            });
        });

        describe('on successful trigger of all underlying promises', () => {
            beforeEach(() => {
                const configuration = new Configuration(JSON.parse(ConfigurationPromoPlacements));
                // const clientInfo = new ClientInfo();
                PurchasingUtilities.setConfiguration(configuration);
                PurchasingUtilities.setClientInfo();
                sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
                sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.17'));
                sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));
                const promise = PurchasingUtilities.sendPurchaseInitializationEvent(nativeBridge);
                return promise;
            });

            it('should call SendPurchasingCommand', () => {
                // sinon.assert.calledWith(<psinon.SinonStub>urchasing.initiatePurchasingCommand, iapPayloadSetIDs);
                sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
            });
        });

        describe('If promo is not ready', () => {
            beforeEach(() => {
                const configuration = new Configuration(JSON.parse(ConfigurationPromoPlacements));
                PurchasingUtilities.setConfiguration(configuration);
                sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('False'));
                sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.17'));
                sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));
            });

            it('should fail with Promo was not ready', () => {
                PurchasingUtilities.sendPurchaseInitializationEvent(nativeBridge).then(() => {
                    assert.fail('should not resolve');
                })
                .catch((e) => {
                    assert.equal(e.message, 'Promo was not ready');
                });
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        describe('If promo version is not 1.16 or above', () => {
            beforeEach(() => {
                const configuration = new Configuration(JSON.parse(ConfigurationPromoPlacements));
                PurchasingUtilities.setConfiguration(configuration);
                sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake((resolve) => resolve('True'));
                sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake((resolve) => resolve('1.14'));
                sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));
            });

            it('should fail with Promo version not supported', () => {
                PurchasingUtilities.sendPurchaseInitializationEvent(nativeBridge).then(() => {
                    assert.fail('should not resolve');
                })
                .catch((e) => {
                    assert.equal(e.message, 'Promo version not supported');
                });
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });
    });

    describe('checking product price', () => {
        beforeEach(() => {
            const promise = PurchasingUtilities.refreshCatalog(nativeBridge);
            purchasing.onGetPromoCatalog.trigger(promoCatalog);
            return promise;
        });

        describe('if product is not available', () => {
            beforeEach(() => {
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);
            });
            it('should throw error', () => {
                assert.throws(() => PurchasingUtilities.getProductPrice('myPromo'));
            });
        });

        describe('if product is available', () => {
            beforeEach(() => {
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            });
            it('should return the price of the product for the given productid', () => {
                assert.equal(PurchasingUtilities.getProductPrice('myPromo'), '$0.00');
                assert.equal(PurchasingUtilities.getProductPrice('100.gold.coins'), '$0.99');
            });
        });
    });

    describe('checking product availability', () => {
        beforeEach(() => {
            const promise = PurchasingUtilities.refreshCatalog(nativeBridge);
            purchasing.onGetPromoCatalog.trigger(promoCatalog);
            return promise;
        });

        it('should return true if given product id is in the product catalog', () => {
            assert.equal(true, PurchasingUtilities.isProductAvailable('myPromo'));
        });

        it('should return false if given product is not in the catalog', () => {
            assert.equal(false, PurchasingUtilities.isProductAvailable('booyah'));
        });
    });
});
