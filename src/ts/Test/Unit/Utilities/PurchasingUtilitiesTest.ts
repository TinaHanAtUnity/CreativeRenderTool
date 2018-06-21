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
import { CampaignManager } from 'Managers/CampaignManager';
import { AuctionResponse } from 'Models/AuctionResponse';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import PromoCampaign from 'json/campaigns/promo/PromoCampaign.json';

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
    });

    describe('sendPromoPayload', () => {
        describe('on Successful command trigger', () => {
            let sendPurchaseInitializationEventStub: sinon.SinonStub;

            beforeEach(() => {
                sinon.stub(purchasing.onCommandResult, 'subscribe').callsFake((resolve) => resolve('True'));
                sendPurchaseInitializationEventStub = sandbox.stub(PurchasingUtilities, 'sendPurchaseInitializationEvent').resolves();
            });

            it('should call initialization event and initiate purchasing command when initialization Payloads are not set', () => {

                return PurchasingUtilities.sendPromoPayload(JSON.stringify(iapPayloadPurchase)).then(() => {
                    sinon.assert.called(sendPurchaseInitializationEventStub);
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                });
            });

            it ('should call initiate purchasing command when initialization Payloads are set', () => {
                PurchasingUtilities.setInitializationPayloadSentValue(true);

                return PurchasingUtilities.sendPromoPayload(JSON.stringify(iapPayloadPurchase)).then(() => {
                    sinon.assert.notCalled(sendPurchaseInitializationEventStub);
                    sinon.assert.calledWith(<sinon.SinonStub>purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                });

            });
        });

        describe('on Failed command trigger', () => {

            it('should fail when onCommandResult triggered with false', () => {
                PurchasingUtilities.setInitializationPayloadSentValue(false);

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

    describe('Handle Send Event', () => {
        let campaignManager: CampaignManager;

        const placements = ['TestPlacement'];
        const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
        const correlationId = '583dfda0d933a3630a53249c';
        const data = JSON.parse(PromoCampaign);
        const response = new AuctionResponse(placements, data, mediaId, correlationId);
        const session = TestFixtures.getSession();

        beforeEach(() => {
            sandbox.stub(PurchasingUtilities, 'sendPurchaseInitializationEvent');

            campaignManager = sandbox.createStubInstance(CampaignManager);

            PurchasingUtilities.campaignManager = campaignManager;
            PurchasingUtilities.response[0] = response;
            PurchasingUtilities.session[0] = session;
        });

        it('Should handle campaign when iap payload type is catalogupdated', () => {
            PurchasingUtilities.iapCampaignCount = 1;
            PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}');
            (<sinon.SinonStub>campaignManager.handleCampaign).returns(Promise.resolve());

            sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.sendPurchaseInitializationEvent);
            sinon.assert.called(<sinon.SinonStub>PurchasingUtilities.campaignManager.handleCampaign);
        });

        it('Should set up campaign with stored response and session', () => {
            PurchasingUtilities.iapCampaignCount = 1;
            PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}');
            (<sinon.SinonStub>campaignManager.handleCampaign).returns(Promise.resolve());

            sinon.assert.calledWith(<sinon.SinonStub>PurchasingUtilities.campaignManager.handleCampaign, response, session);
        });

        it('Should not call when passed iap payload type is a random string', () => {
            PurchasingUtilities.iapCampaignCount = 1;
            PurchasingUtilities.handleSendIAPEvent('{"type":"sadfasdf"}');
            (<sinon.SinonStub>campaignManager.handleCampaign).returns(Promise.resolve());

            sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.sendPurchaseInitializationEvent);
            sinon.assert.notCalled(<sinon.SinonStub>PurchasingUtilities.campaignManager.handleCampaign);
        });

        it('Should not call when no value is included in given index in the array', () => {
            PurchasingUtilities.iapCampaignCount = 2;
            PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}');

            const handleCampaignSpy = (<sinon.SinonStub>campaignManager.handleCampaign).returns(Promise.resolve());
            const handleCampaignCall = handleCampaignSpy.getCall(1);
            assert.equal(handleCampaignCall, null);
        });

        it('Should handle campaign and be called twice when campaign count is 2', () => {
            PurchasingUtilities.promoResponseIndex++;
            PurchasingUtilities.response[1] = response;
            PurchasingUtilities.session[1] = session;
            PurchasingUtilities.iapCampaignCount = 2;

            PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}');
            (<sinon.SinonStub>campaignManager.handleCampaign).returns(Promise.resolve());

            sinon.assert.calledTwice(<sinon.SinonStub>PurchasingUtilities.campaignManager.handleCampaign);
        });
    });
});
