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
import { Platform } from '../../src/ts/Core/Constants/Platform';
import { Backend } from '../../src/ts/Backend/Backend';
import { ICoreApi } from '../../src/ts/Core/ICore';
import { IAdsApi } from '../../src/ts/Ads/IAds';
import { IPromoApi } from '../../src/ts/Promo/IPromo';
import { IPurchasingApi } from '../../src/ts/Purchasing/IPurchasing';

describe('UnityPurchasingPurchasingAdapter', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let promo: IPromoApi;
    let sandbox: sinon.SinonSandbox;
    let clientInfo: ClientInfo;
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
            promo.Purchasing.onInitialize.trigger(initialized ? 'True' : 'False');
            setTimeout(resolve);
        });
    };

    const triggerGetPromoVersion = (promoVersion: string) => {
        return new Promise((resolve) => {
            promo.Purchasing.onGetPromoVersion.trigger(promoVersion);
            setTimeout(resolve);
        });
    };

    const triggerPurchasingCommand = (success: boolean) => {
        return new Promise((resolve) => {
            promo.Purchasing.onCommandResult.trigger(success ? 'True' : 'False');
            setTimeout(resolve);
        });
    };

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        promo = TestFixtures.getPromoApi(nativeBridge);
        clientInfo = sinon.createStubInstance(ClientInfo);
        sdk = sinon.createStubInstance(SdkApi);
        sandbox = sinon.createSandbox();

        sinon.stub(promo.Purchasing, 'getPromoCatalog').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'getPromoVersion').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'initiatePurchasingCommand').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'initializePurchasing').returns(Promise.resolve());
        (<any>promo.Purchasing).onInitialize = new Observable1<string>();
        (<any>promo.Purchasing).onGetPromoVersion = new Observable1<string>();
        (<any>promo.Purchasing).onCommandResult = new Observable1<string>();
        (<any>promo.Purchasing).onIAPSendEvent = new Observable1<string>();
        (<any>promo.Purchasing).onGetPromoCatalog = new Observable1<string>();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('initialize', () => {

        it('should resolve without calling sendPurchasingCommand if configuration does not include promo', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            return purchasingAdapter.initialize().then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initializePurchasing);
                sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.getPromoVersion);
                sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
            });
        });

        it('should fail with IAP Promo was not ready if purchasing is not ready', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(false).then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, 'Purchasing SDK not detected. You have likely configured a promo placement but have not included the Unity Purchasing SDK in your game.');
                        sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                    });
            });
        });

        it('should fail with Promo version not supported if promo version is not 1.16 or above', () => {
            const promoVersion = '1.15';
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion(promoVersion))
                .then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, `Promo version: ${promoVersion} is not supported. Initialize UnityPurchasing 1.16+ to ensure Promos are marked as ready`);
                        sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                    });
                });
        });

        it('should fail with Promo version not supported if promo version split length is less than 2', () => {
            const promoVersion = '1';
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion(promoVersion))
                .then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, `Promo version: ${promoVersion} is not supported. Initialize UnityPurchasing 1.16+ to ensure Promos are marked as ready`);
                        sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                    });
                });
        });

        it('should fail and not set isInitialized to true if command result is false', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion('1.16'))
                .then(() => triggerPurchasingCommand(false))
                .then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, 'Purchase command attempt failed with command False');
                        sinon.assert.called(<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand);
                    });
                });
        });

        it('should fail when initializePurchasing rejects', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            (<sinon.SinonStub>promo.Purchasing.initializePurchasing).rejects();
            return purchasingAdapter.initialize().catch((e: any) => {
                assert.equal(e.message, 'Purchase initialization failed');
                sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
            });
        });

        it('should fail when getPromoVersion rejects', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            (<sinon.SinonStub>promo.Purchasing.getPromoVersion).rejects();
            return triggerInitialize(true).then(() => {
                return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                    .catch((e) => {
                        assert.equal(e.message, 'Promo version check failed');
                        sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                    });
            });
        });

        it('should fail when initiatePurchasingCommand rejects', () => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            (<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand).rejects();
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
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);

            const initializePromise = purchasingAdapter.initialize();

            return triggerInitialize(true)
                .then(() => triggerGetPromoVersion('1.16'))
                .then(() => triggerPurchasingCommand(true))
                .then(() => {
                    return initializePromise.then(() => {
                        sinon.assert.called(<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand);
                    });
                });
        });
    });

    describe('refreshCatalog', () => {
        beforeEach(() => {
            const adsConfiguration = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            const coreConfiguration = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);
        });

        const triggerRefreshCatalog = (value: string) => {
            return new Promise((resolve) => {
                promo.Purchasing.onGetPromoCatalog.trigger(value);
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
            (<sinon.SinonStub>promo.Purchasing.getPromoCatalog).rejects();

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
                promo.Purchasing.onIAPSendEvent.trigger(payloadType);
                promo.Purchasing.onGetPromoCatalog.trigger(value);
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
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);
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
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);
        });

        it('should send the promo payload with Purchase request value', () => {

            const callPurchase = () => {
                return purchasingAdapter.purchaseItem('com.example.iap.product1', TestFixtures.getPromoCampaign(), 'testId', false)
                .then(() => triggerPurchasingCommand(true))
                .then(() => {
                    sinon.assert.called(<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand);
                    sinon.assert.calledWith((<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand).getCall(1), JSON.stringify({
                        productId: TestFixtures.getPromoCampaign().getIapProductId(),
                        iapPromo: true,
                        request: 'purchase',
                        purchaseTrackingUrls: ['https://events.iap.unity3d.com/events/v1/purchase?native=false&iap_service=true','http://test.purchase.com/purchase'],
                        native: false
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
            purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, adsConfiguration, clientInfo);
        });

        it('should send the promo payload with Close request value', () => {

            const callPromoClosed = () => {
                purchasingAdapter.onPromoClosed(TestFixtures.getPromoCampaign(), '');
                sinon.assert.called(<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand);
                sinon.assert.calledWith((<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand).getCall(1), JSON.stringify({
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
