import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Observable1 } from 'Core/Utilities/Observable';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import { IPromoApi } from 'Promo/IPromo';
import { IPurchasingAdapter } from 'Purchasing/PurchasingAdapter';
import { UnityPurchasingPurchasingAdapter } from 'Purchasing/UnityPurchasingPurchasingAdapter';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import Test = Mocha.Test;

describe('UnityPurchasingPurchasingAdapter', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let promo: IPromoApi;
    let sandbox: sinon.SinonSandbox;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let metaDataManager: MetaDataManager;
    let privacySDK: PrivacySDK;

    let purchasingAdapter: IPurchasingAdapter;

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

    const triggerFetchMetaData = () => {
        return new Promise((resolve) => {
            metaDataManager.fetch(FrameworkMetaData);
            setTimeout(resolve);
        });
    };

    const setupFrameWorkMetaData = (framework: string) => {
        const frameWorkMetaData = new FrameworkMetaData();
        sinon.stub(frameWorkMetaData, 'getName').returns(framework);
        sinon.stub(frameWorkMetaData, 'getVersion').returns('5.1');
        sinon.stub(metaDataManager, 'fetch').returns(Promise.resolve(frameWorkMetaData));
    };

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        promo = TestFixtures.getPromoApi(nativeBridge);
        clientInfo = sinon.createStubInstance(ClientInfo);
        sandbox = sinon.createSandbox();
        const request = sinon.createStubInstance(RequestManager);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        metaDataManager = new MetaDataManager(core);
        privacySDK = TestFixtures.getPrivacySDK(core);

        sinon.stub(promo.Purchasing, 'getPromoCatalog').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'getPromoVersion').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'initiatePurchasingCommand').returns(Promise.resolve());
        sinon.stub(promo.Purchasing, 'initializePurchasing').returns(Promise.resolve());
        (<any>promo.Purchasing).onInitialize = new Observable1<string>();
        (<any>promo.Purchasing).onGetPromoVersion = new Observable1<string>();
        (<any>promo.Purchasing).onCommandResult = new Observable1<string>();
        (<any>promo.Purchasing).onIAPSendEvent = new Observable1<string>();
        (<any>promo.Purchasing).onGetPromoCatalog = new Observable1<string>();

        const coreConfiguration = CoreConfigurationParser.parse(ConfigurationPromoPlacements);
        purchasingAdapter = new UnityPurchasingPurchasingAdapter(core, promo, coreConfiguration, privacySDK, clientInfo, metaDataManager);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('initialize', () => {
        describe('not made with unity', () => {
            beforeEach(() => {
                setupFrameWorkMetaData('Android');
            });

            it('should fail with Game not made with Unity if framework metadata does not have unity as name', () => {
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                const initializePromise = purchasingAdapter.initialize();

                return triggerFetchMetaData().then(() => {
                    return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                        .catch((e) => {
                            assert.equal(e.message, 'Game not made with Unity. You must use BYOP to use IAP Promo.');
                            sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                        });
                });
            });
        });

        describe('made with unity', () => {
            beforeEach(() => {
                setupFrameWorkMetaData('Unity');
            });

            it('should resolve without calling sendPurchasingCommand if configuration does not include promo', () => {
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(false);

                return purchasingAdapter.initialize().then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>metaDataManager.fetch);
                    sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initializePurchasing);
                    sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.getPromoVersion);
                    sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                });
            });

            it('should fail with IAP Promo was not ready if purchasing is not ready', () => {
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                const initializePromise = purchasingAdapter.initialize();

                return triggerFetchMetaData().then(() => {
                    return triggerInitialize(false).then(() => {
                        return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                            .catch((e) => {
                                assert.equal(e.message, 'Purchasing SDK not detected. You have likely configured a promo placement but have not included the Unity Purchasing SDK in your game.');
                                sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                            });
                    });
                });
            });

            it('should fail with Promo version not supported if promo version is not 1.16 or above', () => {
                const promoVersion = '1.15';
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                const initializePromise = purchasingAdapter.initialize();

                return triggerFetchMetaData().then(() => {
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
            });

            it('should fail with Promo version not supported if promo version split length is less than 2', () => {
                const promoVersion = '1';
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                const initializePromise = purchasingAdapter.initialize();

                return triggerFetchMetaData().then(() => {
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
            });

            it('should fail and not set isInitialized to true if command result is false', () => {
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                const initializePromise = purchasingAdapter.initialize();

                return triggerFetchMetaData().then(() => {
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
            });

            it('should fail when initializePurchasing rejects', () => {
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                (<sinon.SinonStub>promo.Purchasing.initializePurchasing).rejects();
                return purchasingAdapter.initialize().catch((e: any) => {
                    assert.equal(e.message, 'Purchase initialization failed');
                    sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                });
            });

            it('should fail when getPromoVersion rejects', () => {
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                const initializePromise = purchasingAdapter.initialize();

                (<sinon.SinonStub>promo.Purchasing.getPromoVersion).rejects();

                return triggerFetchMetaData().then(() => {
                    return triggerInitialize(true).then(() => {
                        return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                            .catch((e) => {
                                assert.equal(e.message, 'Promo version check failed');
                                sinon.assert.notCalled(<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand);
                            });
                    });
                });
            });

            it('should fail when initiatePurchasingCommand rejects', () => {
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                const initializePromise = purchasingAdapter.initialize();

                (<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand).rejects();

                return triggerFetchMetaData().then(() => {
                    return triggerInitialize(true)
                        .then(() => triggerGetPromoVersion('1.16'))
                        .then(() => {
                            return initializePromise.then(() => assert.fail('Initialized worked when it shouldn\'t\'ve'))
                                .catch((e) => {
                                    assert.equal(e.message, 'Purchase event failed to send');
                                });
                    });
                });
            });

            it('should call SendPurchasingCommand on successful trigger of all underlying promises', () => {
                sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);

                const initializePromise = purchasingAdapter.initialize();

                return triggerFetchMetaData().then(() => {
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
        });
    });

    describe('refreshCatalog', () => {
        beforeEach(() => {
            sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);
        });

        const triggerRefreshCatalog = (value: string) => {
            return new Promise((resolve) => {
                promo.Purchasing.onGetPromoCatalog.trigger(value);
                setTimeout(resolve);
            });
        };

        it('should fail with promo catalog null if purchasing catalog is null value', () => {
            const refreshCatalogPromise = purchasingAdapter.refreshCatalog();

            return triggerRefreshCatalog('NULL')
                .then(() => {
                    return refreshCatalogPromise.then(() => assert.fail('RefreshCatalog worked when it shouldn\'t\'ve'))
                        .catch((e) => {
                            assert.equal(e.message, 'Promo catalog JSON is null');
                        });
                });
        });

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
            sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);
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
            sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);
            setupFrameWorkMetaData('Unity');
        });

        it('should send the promo payload with Purchase request value', () => {

            const callPurchase = () => {
                return purchasingAdapter.purchaseItem(thirdPartyEventManager, 'com.example.iap.product1', TestFixtures.getPromoCampaign(), false)
                .then(() => triggerPurchasingCommand(true))
                .then(() => {
                    sinon.assert.called(<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand);
                    sinon.assert.calledWith((<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand).getCall(1), JSON.stringify({
                        productId: TestFixtures.getPromoCampaign().getIapProductId(),
                        iapPromo: true,
                        request: 'purchase',
                        purchaseTrackingUrls: ['https://events.iap.unity3d.com/events/v1/purchase?native=false&iap_service=true', 'http://test.purchase.com/purchase'],
                        native: false
                    }));
                });
            };
            const initializePromise = purchasingAdapter.initialize();

            return triggerFetchMetaData().then(() => {
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
    });

    describe('onPromoClosed', () => {
        beforeEach(() => {
            sinon.stub(PurchasingUtilities, 'configurationIncludesPromoPlacement').returns(true);
            setupFrameWorkMetaData('Unity');
        });

        it('should send the promo payload with Close request value', () => {

            const callPromoClosed = () => {
                purchasingAdapter.onPromoClosed(thirdPartyEventManager, TestFixtures.getPromoCampaign(), '');
                sinon.assert.called(<sinon.SinonStub>promo.Purchasing.initiatePurchasingCommand);
                sinon.assert.calledWith((<sinon.SinonSpy>promo.Purchasing.initiatePurchasingCommand).getCall(1), JSON.stringify({
                    'gamerToken': 'abcd.1234.5678',
                    'trackingOptOut': false,
                    'iapPromo': true,
                    'gameId': 'undefined|abcd.1234.5678',
                    'abGroup': 99,
                    'request': 'close',
                    'purchaseTrackingUrls': ['https://events.iap.unity3d.com/events/v1/purchase', 'http://test.purchase.com/purchase']
                }));
            };

            const initializePromise = purchasingAdapter.initialize();

            return triggerFetchMetaData().then(() => {
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
});
