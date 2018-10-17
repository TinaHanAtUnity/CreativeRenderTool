import 'mocha';
import * as sinon from 'sinon';

import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { PurchasingApi } from 'Promo/Native/Purchasing';
import { SdkApi } from 'Core/Native/Sdk';
import { IPurchasingAdapter } from 'Purchasing/PurchasingAdapter';
import { IPromoPayload, IPromoRequest } from 'Promo/Utilities/PurchasingUtilities';
import { Observable1 } from 'Core/Utilities/Observable';
import { UnityPurchasingPurchasingAdapter } from 'Purchasing/UnityPurchasingPurchasingAdapter';

import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('UnityPurchasingPurchasingAdapter', () => {
    let nativeBridge: NativeBridge;
    let sandbox: sinon.SinonSandbox;
    let clientInfo: ClientInfo;
    let purchasing: PurchasingApi;
    let sdk: SdkApi;

    let purchasingAdapter: IPurchasingAdapter;
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

    const triggerInitialize = (initialized: boolean) => {
        return new Promise((resolve) => {
            nativeBridge.Purchasing.onInitialize.trigger(initialized ? 'True' : 'False');
            setTimeout(resolve);
        });
    };

    const triggerGetPromoVersion = (promoVersion: string) => {
        return new Promise((resolve) => {
            nativeBridge.Purchasing.onGetPromoVersion.trigger(promoVersion);
            setTimeout(resolve);
        });
    };

    const triggerPurchasingCommand = (success: boolean) => {
        return new Promise((resolve) => {
            nativeBridge.Purchasing.onCommandResult.trigger(success ? 'True' : 'False');
            setTimeout(resolve);
        });
    };

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        clientInfo = sinon.createStubInstance(ClientInfo);
        purchasing = sinon.createStubInstance(PurchasingApi);
        sdk = sinon.createStubInstance(SdkApi);
        sandbox = sinon.createSandbox();

        (<sinon.SinonStub>purchasing.getPromoCatalog).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.getPromoVersion).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.initiatePurchasingCommand).returns(Promise.resolve());
        (<sinon.SinonStub>purchasing.initializePurchasing).returns(Promise.resolve());
        (<any>purchasing).onInitialize = new Observable1<string>();
        (<any>purchasing).onGetPromoVersion = new Observable1<string>();
        (<any>purchasing).onCommandResult = new Observable1<string>();
        (<any>purchasing).onIAPSendEvent = new Observable1<string>();
        (<any>purchasing).onGetPromoCatalog = new Observable1<string>();

        nativeBridge.Sdk = sdk;
        nativeBridge.Purchasing = purchasing;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('initialize', () => {

        it('should resolve without calling sendPurchasingCommand if configuration does not include promo', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            return purchasingAdapter.initialize().then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initializePurchasing);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.getPromoVersion);
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        it('should fail with IAP Promo was not ready if purchasing is not ready', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(false).then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, 'Purchasing SDK not detected. You have likely configured a promo placement but have not included the Unity Purchasing SDK in your game.');
                        sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
                    });
            });
        });

        it('should fail with Promo version not supported if promo version is not 1.16 or above', () => {
            const promoVersion = '1.15';
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion(promoVersion))
                .then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, `Promo version: ${promoVersion} is not supported. Initialize UnityPurchasing 1.16+ to ensure Promos are marked as ready`);
                        sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
                    });
                });
        });

        it('should fail with Promo version not supported if promo version split length is less than 2', () => {
            const promoVersion = '1';
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion(promoVersion))
                .then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, `Promo version: ${promoVersion} is not supported. Initialize UnityPurchasing 1.16+ to ensure Promos are marked as ready`);
                        sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
                    });
                });
        });

        it('should fail and not set isInitialized to true if command result is false', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion('1.16'))
                .then(() => triggerPurchasingCommand(false))
                .then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, 'Purchase command attempt failed with command False');
                        sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
                    });
                });
        });

        it('should fail when initializePurchasing rejects', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            (<sinon.SinonStub>purchasing.initializePurchasing).rejects();
            return purchasingAdapter.initialize().catch((e: any) => {
                assert.equal(e.message, 'Purchase initialization failed');
                sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
            });
        });

        it('should fail when getPromoVersion rejects', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            (<sinon.SinonStub>purchasing.getPromoVersion).rejects();
            return triggerInitialize(true).then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, 'Promo version check failed');
                        sinon.assert.notCalled(<sinon.SinonSpy>purchasing.initiatePurchasingCommand);
                    });
            });
        });

        it('should fail when initiatePurchasingCommand rejects', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            (<sinon.SinonStub>purchasing.initiatePurchasingCommand).rejects();
            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion('1.16'))
                .then(() => {
                    return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                        .catch((e) => {
                            assert.equal(e.message, 'Purchase event failed to send');
                        });
            });
        });

        it('should call SendPurchasingCommand on successful trigger of all underlying promises', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion('1.16'))
                .then(() => triggerPurchasingCommand(true))
                .then(() => {
                    return initializePromise.then(() => {
                        sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
                    });
                });
        });
    });

    describe('refreshCatalog', () => {
        beforeEach(() => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);
        });

        const triggerRefreshCatalog = (value: string) => {
            return new Promise((resolve) => {
                nativeBridge.Purchasing.onGetPromoCatalog.trigger(value);
                setTimeout(resolve);
            });
        };

        it('should fail with promo catalog empty if purchasing catalog is empty string', () => {
            const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

            return triggerRefreshCatalog('')
                .then(() => {
                    return refreshCatalogPromise.then(() => assert.fail('RefreshCatalog worked when it shouldn\'t\'ve'))
                        .catch((e) => {
                            assert.equal(e.message, 'Promo catalog JSON is empty');
                        });
                });
        });

        it('should fail with catalog_json_parse_failure if catalog is invalid json string', () => {
            const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

            return triggerRefreshCatalog('{"productId":"asdf","localizedPriceString":"asdf","localizedTitle":"asdf""productType":"asdfasdf","isoCurrencyCode":"asdfa","localizedPrice":1}')
                .then(() => {
                    return refreshCatalogPromise.then(() => assert.fail('RefreshCatalog worked when it shouldn\'t\'ve'))
                        .catch((e) => {
                            assert.equal(e.message, 'Promo catalog JSON failed to parse with the following string: {"productId":"asdf","localizedPriceString":"asdf","localizedTitle":"asdf""productType":"asdfasdf","isoCurrencyCode":"asdfa","localizedPrice":1}');
                        });
                });
        });

        it('should fail when onGetPromoCatalog rejects', () => {
            (<sinon.SinonStub>purchasing.getPromoCatalog).rejects();

            return purchasingAdapter.refreshCatalog().catch((e: any) => {
                assert.equal(e.message, 'Purchasing Catalog failed to refresh');
            });
        });

        it('should set products to the catalog passed', () => {
            const refreshCatalogPromise = purchasingAdapter.refreshCatalog();
            const json = JSON.stringify([{
                productId: 'asdf',
                localizedPriceString: 'asdf',
                localizedTitle: 'asdf',
                productType: 'asdfasdf',
                isoCurrencyCode: 'asdfa',
                localizedPrice: 1
            }]);
            return triggerRefreshCatalog(json)
                .then(() => {
                    return refreshCatalogPromise.then((products) => {
                        assert.deepEqual(products, [{
                            productId: 'asdf',
                            localizedPriceString: 'asdf',
                            localizedTitle: 'asdf',
                            productType: 'asdfasdf',
                            isoCurrencyCode: 'asdfa',
                            localizedPrice: 1
                        }]);
                    });
                });
        });
    });

    describe('handling sendEvent', () => {

        const triggerRefreshCatalog = (value: string, payloadType: string) => {
            return new Promise((resolve) => {
                nativeBridge.Purchasing.onIAPSendEvent.trigger(payloadType);
                nativeBridge.Purchasing.onGetPromoCatalog.trigger(value);
                setTimeout(resolve);
            });
        };

        const json = JSON.stringify([{
            productId: 'asdf',
            localizedPriceString: 'asdf',
            localizedTitle: 'asdf',
            productType: 'asdfasdf',
            isoCurrencyCode: 'asdfa',
            localizedPrice: 1
        }]);

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);
            sandbox.stub(purchasingAdapter.onCatalogRefreshed, 'trigger');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should trigger refresh when IAP payload type is CatalogUpdated', () => {

            return triggerRefreshCatalog(json, '{"type": "CatalogUpdated"}').then((products) => {
                sinon.assert.called(<sinon.SinonSpy>purchasingAdapter.onCatalogRefreshed.trigger);
            });
        });

        it('should not handle update when passed IAP payload type is not CatalogUpdated', () => {

            return triggerRefreshCatalog(json, '{"type": "CatalogUpdaed"}').then((products) => {
                sinon.assert.notCalled(<sinon.SinonSpy>purchasingAdapter.onCatalogRefreshed.trigger);
            });
        });
    });

    describe('purchaseItem', () => {
        beforeEach(() => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);
        });

        it('should send the promo payload with Purchase request value', () => {

            const callPurchase = () => {
                return purchasingAdapter.purchaseItem('com.example.iap.product1', TestFixtures.getPromoCampaign(), 'testId')
                .then(() => triggerPurchasingCommand(true))
                .then(() => {
                    sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
                    sinon.assert.calledWith((<sinon.SinonStub>purchasing.initiatePurchasingCommand).getCall(1), JSON.stringify({
                        productId: TestFixtures.getPromoCampaign().getIapProductId(),
                        iapPromo: true,
                        request: 'purchase',
                        purchaseTrackingUrls: ['https://events.iap.unity3d.com/events/v1/purchase','http://test.purchase.com/purchase']
                    }));
                });
            };
            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion('1.16'))
                .then(() => triggerPurchasingCommand(true))
                .then(() => {
                    return initializePromise.then(() => {
                        return callPurchase();
                    });
                });
        });
    });

    describe('onPromoClosed', () => {
        beforeEach(() => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(nativeBridge, coreConfiguration, adsConfiguration, clientInfo);
        });

        it('should send the promo payload with Close request value', () => {

            const callPromoClosed = () => {
                purchasingAdapter.onPromoClosed(TestFixtures.getPromoCampaign(), '');
                sinon.assert.called(<sinon.SinonStub>purchasing.initiatePurchasingCommand);
                sinon.assert.calledWith((<sinon.SinonSpy>purchasing.initiatePurchasingCommand).getCall(1), JSON.stringify({
                    'gamerToken':'abcd.1234.5678',
                    'trackingOptOut':false,
                    'iapPromo':true,
                    'gameId':'undefined|abcd.1234.5678',
                    'abGroup':99,
                    'request':'close',
                    'purchaseTrackingUrls':['https://events.iap.unity3d.com/events/v1/purchase','http://test.purchase.com/purchase']
                }));
            };

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion('1.16'))
                .then(() => triggerPurchasingCommand(true))
                .then(() => {
                    return initializePromise.then(() => {
                        callPromoClosed();
                    });
                });
        });
    });
});
