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

describe('PurchasingUtilitiesTest', () => {
    let nativeBridge: NativeBridge;
    let purchasing: PurchasingApi;
    let sdk: SdkApi;
    const promoCatalog = '[\n  {\n    \"localizedPriceString\" : \"$0.00\",\n    \"localizedTitle\" : \"Sword of Minimal Value\",\n    \"productId\" : \"myPromo\"\n  },\n  {\n    \"localizedPriceString\" : \"$0.99\",\n    \"localizedTitle\" : \"100 in-game Gold Coins\",\n    \"productId\" : \"100.gold.coins\"\n  }\n]';
    const iapPayload: IPromoPayload = {
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
        nativeBridge.Sdk = sdk;
        (<any>purchasing).onInitialize = new Observable1<string>();
        (<any>purchasing).onCommandResult = new Observable1<string>();
        (<any>purchasing).onGetPromoVersion = new Observable1<string>();
        (<any>purchasing).onGetPromoCatalog = new Observable1<string>();
        (<sinon.SinonStub>purchasing.getPromoCatalog).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.getPromoVersion).returns(Promise.resolve());
        (<any>nativeBridge).Purchasing = purchasing;

    });

    describe('Refreshing catalog', () => {

        beforeEach(() => {
            const promise = PurchasingUtilities.refreshCatalog(nativeBridge);
            purchasing.onGetPromoCatalog.trigger(promoCatalog);
            return promise;
        });

        it('should set the catalog to the value returned from promo', () => {
            sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
            assert.isTrue(PurchasingUtilities.productAvailable('myPromo'), 'Catalog does not contain myPromo');
        });

        describe('Checking product information', () => {

            it('should indicate that products are available', () => {
                sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
                assert.isTrue(PurchasingUtilities.productAvailable('myPromo'), 'Catalog does not contain myPromo');
            });

            it('should indicate that a particular product is available', () => {
                sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
                assert.equal(true, PurchasingUtilities.productAvailable('100.gold.coins'), 'product is unavailable');
            });

            it('should indicate that an unknown product is not available', () => {
                sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
                assert.equal(false, PurchasingUtilities.productAvailable('100.gold.noncoins'), 'unknown product is available');
            });

            it('should indicate the correct price for an available product', () => {
                sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
                assert.equal('$0.99', PurchasingUtilities.productPrice('100.gold.coins'), 'unexpected product price');
            });

            it('should indicate the correct description for an available product', () => {
                sinon.assert.called(<sinon.SinonStub>purchasing.getPromoCatalog);
                assert.equal('100 in-game Gold Coins', PurchasingUtilities.productDescription('100.gold.coins'), 'unexpected product description');
            });
        });

    });

    describe('Checking version', () => {
        describe('with a correctly formatted string', () =>  {
            it('should pass', () => {
                (<sinon.SinonStub>purchasing.initializePurchasing).callsFake(() => {
                    purchasing.onInitialize.trigger('True');
                    return Promise.resolve(true);
                });
                (<sinon.SinonStub>purchasing.getPromoVersion).callsFake(() => {
                    purchasing.onGetPromoVersion.trigger('1.17.0-foo');
                    return Promise.resolve();
                });
                const promise = PurchasingUtilities.checkPromoVersion(nativeBridge);
                return promise;
            });

            it('should fail', () => {
                (<sinon.SinonStub>purchasing.initializePurchasing).callsFake(() => {
                    purchasing.onInitialize.trigger('True');
                    return Promise.resolve(true);
                });
                (<sinon.SinonStub>purchasing.getPromoVersion).callsFake(() => {
                    purchasing.onGetPromoVersion.trigger('1.15.0-foo');
                    return Promise.resolve(false);
                });
                const promise = PurchasingUtilities.checkPromoVersion(nativeBridge);
                return promise;
            });
        });

        describe('with an incorrectly formatted/empty string', () =>  {
            it('should fail', () => {
                (<sinon.SinonStub>purchasing.initializePurchasing).callsFake(() => {
                    purchasing.onInitialize.trigger('True');
                    return Promise.resolve(true);
                });
                (<sinon.SinonStub>purchasing.getPromoVersion).callsFake(() => {
                    purchasing.onGetPromoVersion.trigger('a.a.a');
                    return Promise.resolve(false);
                });
                const promise = PurchasingUtilities.checkPromoVersion(nativeBridge);
                return promise;
            });

            it('should fail', () => {
                (<sinon.SinonStub>purchasing.initializePurchasing).callsFake(() => {
                    purchasing.onInitialize.trigger('True');
                    return Promise.resolve(true);
                });
                (<sinon.SinonStub>purchasing.getPromoVersion).callsFake(() => {
                    purchasing.onGetPromoVersion.trigger('');
                    return Promise.resolve(false);
                });
                const promise = PurchasingUtilities.checkPromoVersion(nativeBridge);
                return promise;
            });
        });
    });

    describe('Checking initiate purchase', () => {
        describe('Initiating a purchase', () => {
            describe('And promo is ready', () => {
                describe('With a good command request', () => {

                    it('should resolve', () => {
                        (<sinon.SinonStub>purchasing.initializePurchasing).callsFake(() => {
                            purchasing.onInitialize.trigger('True');
                            return Promise.resolve(true);
                        });
                        (<sinon.SinonStub>purchasing.initiatePurchasingCommand).callsFake(() => {
                            purchasing.onCommandResult.trigger('True');
                            return Promise.resolve();
                        });
                        const promise = PurchasingUtilities.beginPurchaseEvent(nativeBridge, JSON.stringify(iapPayload));
                        return promise;
                    });
                });

                xdescribe('With a bad command request', () => {
                    it('should fail', () => {
                        (<sinon.SinonStub>purchasing.initializePurchasing).callsFake(() => {
                            purchasing.onInitialize.trigger('True');
                            return Promise.resolve(true);
                        });
                        (<sinon.SinonStub>purchasing.initiatePurchasingCommand).callsFake(() => {
                            purchasing.onCommandResult.trigger('False');
                            return Promise.reject('False');
                        });
                        const promise = PurchasingUtilities.beginPurchaseEvent(nativeBridge, JSON.stringify(iapPayload));
                        return new Promise((resolve, reject) => {
                            return promise.then(reject).catch(resolve);
                        });
                    });
                });
            });

            xdescribe('And promo is not ready', () => {
                it('should fail', () => {
                    (<sinon.SinonStub>purchasing.initializePurchasing).callsFake(() => {
                        purchasing.onInitialize.trigger('False');
                        return Promise.resolve();
                    });
                    const promise = PurchasingUtilities.beginPurchaseEvent(nativeBridge, JSON.stringify(iapPayload));
                    purchasing.onCommandResult.trigger('True');
                    return new Promise((resolve, reject) => {
                        return promise.then(reject).catch(resolve);
                    });
                });
            });
        });
    });
});
