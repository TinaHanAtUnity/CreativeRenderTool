System.register(["mocha", "sinon", "chai", "Utilities/PurchasingUtilities", "Native/NativeBridge", "Native/Api/Purchasing", "Utilities/Observable", "Native/Api/Sdk", "Parsers/ConfigurationParser", "Models/ClientInfo", "json/ConfigurationPromoPlacements.json", "json/ConfigurationAuctionPlc.json", "Managers/PlacementManager", "Models/Placement", "Test/Unit/TestHelpers/TestFixtures"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, PurchasingUtilities_1, NativeBridge_1, Purchasing_1, Observable_1, Sdk_1, ConfigurationParser_1, ClientInfo_1, ConfigurationPromoPlacements_json_1, ConfigurationAuctionPlc_json_1, PlacementManager_1, Placement_1, TestFixtures_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (PurchasingUtilities_1_1) {
                PurchasingUtilities_1 = PurchasingUtilities_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Purchasing_1_1) {
                Purchasing_1 = Purchasing_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            },
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (ConfigurationPromoPlacements_json_1_1) {
                ConfigurationPromoPlacements_json_1 = ConfigurationPromoPlacements_json_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            },
            function (PlacementManager_1_1) {
                PlacementManager_1 = PlacementManager_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            }
        ],
        execute: function () {
            describe('PurchasingUtilitiesTest', function () {
                var nativeBridge;
                var purchasing;
                var sdk;
                var clientInfo;
                var placementManager;
                var sandbox;
                var promoCatalog = '[\n  {\n    \"localizedPriceString\" : \"$0.00\",\n    \"localizedTitle\" : \"Sword of Minimal Value\",\n    \"productId\" : \"myPromo\"\n  },\n  {\n    \"localizedPriceString\" : \"$0.99\",\n    \"localizedTitle\" : \"100 in-game Gold Coins\",\n    \"productId\" : \"100.gold.coins\"\n  }\n]';
                var promoCatalogBad = '[\n    {\"pn}]';
                var promoCatalogEmpty = '[]';
                var iapPayloadPurchase = {
                    productId: 'myPromo',
                    trackingOptOut: false,
                    gamerToken: '111',
                    iapPromo: true,
                    gameId: '222',
                    abGroup: 1,
                    request: PurchasingUtilities_1.IPromoRequest.PURCHASE,
                    purchaseTrackingUrls: ['https://www.scooooooooter.com', 'https://www.scottyboy.com']
                };
                var iapPayloadSetIds = {
                    productId: 'myPromo',
                    trackingOptOut: false,
                    gamerToken: '111',
                    iapPromo: true,
                    gameId: '222',
                    abGroup: 1,
                    request: PurchasingUtilities_1.IPromoRequest.SETIDS,
                    purchaseTrackingUrls: ['https://www.scooooooooter.com', 'https://www.scottyboy.com']
                };
                beforeEach(function () {
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    purchasing = sinon.createStubInstance(Purchasing_1.PurchasingApi);
                    sdk = sinon.createStubInstance(Sdk_1.SdkApi);
                    clientInfo = sinon.createStubInstance(ClientInfo_1.ClientInfo);
                    sandbox = sinon.sandbox.create();
                    nativeBridge.Sdk = sdk;
                    purchasing.onInitialize = new Observable_1.Observable1();
                    purchasing.onCommandResult = new Observable_1.Observable1();
                    purchasing.onGetPromoVersion = new Observable_1.Observable1();
                    purchasing.onGetPromoCatalog = new Observable_1.Observable1();
                    purchasing.getPromoCatalog.returns(Promise.resolve());
                    purchasing.getPromoVersion.returns(Promise.resolve());
                    purchasing.initiatePurchasingCommand.returns(Promise.resolve());
                    purchasing.initializePurchasing.returns(Promise.resolve());
                    nativeBridge.Purchasing = purchasing;
                    var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc_json_1.default));
                    placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                });
                afterEach(function () {
                    sandbox.restore();
                });
                describe('sendPurchaseInitializationEvent', function () {
                    it('should resolve without calling sendPurchasingCommand if configuration does not include promo', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc_json_1.default));
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().then(function () {
                            sinon.assert.notCalled(purchasing.initializePurchasing);
                            sinon.assert.notCalled(purchasing.getPromoVersion);
                            sinon.assert.notCalled(purchasing.initiatePurchasingCommand);
                        });
                    });
                    it('should fail with IAP Promo was not ready if promo is not ready', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake(function (resolve) { return resolve('False'); });
                        sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake(function (resolve) { return resolve('1.16'); });
                        sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().catch(function (e) {
                            chai_1.assert.equal(e.message, 'IAP Promo was not ready');
                            sinon.assert.notCalled(purchasing.initiatePurchasingCommand);
                        });
                    });
                    it('should fail with Promo version not supported if promo version is not 1.16 or above', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        var promoVersion = '1.15';
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake(function (resolve) { return resolve(promoVersion); });
                        sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().catch(function (e) {
                            chai_1.assert.equal(e.message, "Promo version: " + promoVersion + " is not supported");
                            sinon.assert.notCalled(purchasing.initiatePurchasingCommand);
                        });
                    });
                    it('should fail with Promo version not supported if promo version split length is less than 2', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        var promoVersion = '1';
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake(function (resolve) { return resolve(promoVersion); });
                        sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().catch(function (e) {
                            chai_1.assert.equal(e.message, "Promo version: " + promoVersion + " is not supported");
                            sinon.assert.notCalled(purchasing.initiatePurchasingCommand);
                        });
                    });
                    it('should fail and not set isInitialized to true if command result is false', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake(function (resolve) { return resolve('1.16'); });
                        sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake(function (resolve) { return resolve('False'); });
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().catch(function (e) {
                            chai_1.assert.equal(e.message, 'Purchase command attempt failed with command False');
                            sinon.assert.called(purchasing.initiatePurchasingCommand);
                            chai_1.assert.isFalse(PurchasingUtilities_1.PurchasingUtilities.isInitialized());
                        });
                    });
                    it('should fail when initializePurchasing rejects', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        purchasing.initializePurchasing.rejects();
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().catch(function (e) {
                            chai_1.assert.equal(e.message, 'Purchase initialization failed');
                            sinon.assert.notCalled(purchasing.initiatePurchasingCommand);
                        });
                    });
                    it('should fail when getPromoVersion rejects', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        purchasing.getPromoVersion.rejects();
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().catch(function (e) {
                            chai_1.assert.equal(e.message, 'Promo version check failed');
                            sinon.assert.notCalled(purchasing.initiatePurchasingCommand);
                        });
                    });
                    it('should fail when initiatePurchasingCommand rejects', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake(function (resolve) { return resolve('1.16'); });
                        purchasing.initiatePurchasingCommand.rejects();
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().catch(function (e) {
                            chai_1.assert.equal(e.message, 'Purchase event failed to send');
                        });
                    });
                    it('should call SendPurchasingCommand on successful trigger of all underlying promises', function () {
                        var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                        sandbox.stub(purchasing.onInitialize, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        sandbox.stub(purchasing.onGetPromoVersion, 'subscribe').callsFake(function (resolve) { return resolve('1.16'); });
                        sandbox.stub(purchasing.onCommandResult, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                        return PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent().then(function () {
                            sinon.assert.called(purchasing.initiatePurchasingCommand);
                            chai_1.assert.isTrue(PurchasingUtilities_1.PurchasingUtilities.isInitialized());
                        });
                    });
                });
                describe('sendPromoPayload', function () {
                    describe('on Successful command trigger', function () {
                        var sendPurchaseInitializationEventStub;
                        var PromoUtilities = PurchasingUtilities_1.PurchasingUtilities;
                        beforeEach(function () {
                            sinon.stub(purchasing.onCommandResult, 'subscribe').callsFake(function (resolve) { return resolve('True'); });
                            sendPurchaseInitializationEventStub = sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'sendPurchaseInitializationEvent').resolves();
                            PromoUtilities._isInitialized = false;
                        });
                        it('should not set isInitialized to true if payload passed does not include SETIDS', function () {
                            return PromoUtilities.sendPromoPayload(iapPayloadPurchase).then(function () {
                                sinon.assert.calledWith(purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                                chai_1.assert.isFalse(PromoUtilities.isInitialized());
                            });
                        });
                        it('should set isInitialized to true if payload passed does includes SETIDS', function () {
                            return PromoUtilities.sendPromoPayload(iapPayloadSetIds).then(function () {
                                sinon.assert.calledWith(purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadSetIds));
                                chai_1.assert.isTrue(PromoUtilities.isInitialized());
                            });
                        });
                        it('should call initialization event and initiate purchasing command when initialization Payloads are not set', function () {
                            sandbox.stub(PromoUtilities, 'isInitialized').returns(false);
                            return PromoUtilities.sendPromoPayload(iapPayloadSetIds).then(function () {
                                sinon.assert.called(sendPurchaseInitializationEventStub);
                                sinon.assert.calledWith(purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadSetIds));
                            });
                        });
                        it('should call initiate purchasing command when initialization Payloads are set', function () {
                            sandbox.stub(PromoUtilities, 'isInitialized').returns(true);
                            return PromoUtilities.sendPromoPayload(iapPayloadPurchase).then(function () {
                                sinon.assert.notCalled(sendPurchaseInitializationEventStub);
                                sinon.assert.calledWith(purchasing.initiatePurchasingCommand, JSON.stringify(iapPayloadPurchase));
                            });
                        });
                    });
                    describe('on Failed command trigger', function () {
                        it('should fail when onCommandResult triggered with false', function () {
                            sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(false);
                            PurchasingUtilities_1.PurchasingUtilities.sendPromoPayload(iapPayloadPurchase).catch(function (e) {
                                chai_1.assert.equal(e.message, 'Purchase command attempt failed');
                            });
                            purchasing.onCommandResult.trigger('False');
                        });
                    });
                });
                describe('refreshCatalog', function () {
                    describe('onSuccess', function () {
                        beforeEach(function () {
                            var promise = PurchasingUtilities_1.PurchasingUtilities.refreshCatalog();
                            purchasing.onGetPromoCatalog.trigger(promoCatalog);
                            return promise;
                        });
                        it('should set the catalog to the value returned by promo', function () {
                            sinon.assert.called(purchasing.getPromoCatalog);
                            chai_1.assert.isTrue(PurchasingUtilities_1.PurchasingUtilities.isProductAvailable('myPromo'));
                        });
                        it('should not store a product that is not returned by promo', function () {
                            sinon.assert.called(purchasing.getPromoCatalog);
                            chai_1.assert.isFalse(PurchasingUtilities_1.PurchasingUtilities.isProductAvailable('myScooter'));
                        });
                    });
                    describe('onFail', function () {
                        it('should fail when json is bad', function () {
                            PurchasingUtilities_1.PurchasingUtilities.refreshCatalog().catch(function (e) {
                                chai_1.assert.equal(e.message, 'Promo catalog JSON failed to parse');
                            });
                            purchasing.onGetPromoCatalog.trigger(promoCatalogBad);
                        });
                        it('should fail when blank string catalog is returned from promo', function () {
                            PurchasingUtilities_1.PurchasingUtilities.refreshCatalog().catch(function (e) {
                                chai_1.assert.equal(e.message, 'Promo catalog JSON failed to parse');
                            });
                            purchasing.onGetPromoCatalog.trigger('');
                        });
                        it('should fail when get promo catalog fetch over api fails', function () {
                            purchasing.getPromoCatalog.returns(Promise.reject('fail'));
                            PurchasingUtilities_1.PurchasingUtilities.refreshCatalog().catch(function (e) {
                                chai_1.assert.equal(e.message, 'Purchasing Catalog failed to refresh');
                            });
                        });
                    });
                });
                describe('getProductPrice', function () {
                    beforeEach(function () {
                        var promise = PurchasingUtilities_1.PurchasingUtilities.refreshCatalog();
                        purchasing.onGetPromoCatalog.trigger(promoCatalog);
                        return promise;
                    });
                    it('should throw error if product is not available', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(false);
                        chai_1.assert.throws(function () { return PurchasingUtilities_1.PurchasingUtilities.getProductPrice('myPromo'); });
                    });
                    it('should return the price of the product for the given productid if product is available', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        chai_1.assert.equal(PurchasingUtilities_1.PurchasingUtilities.getProductPrice('myPromo'), '$0.00');
                        chai_1.assert.equal(PurchasingUtilities_1.PurchasingUtilities.getProductPrice('100.gold.coins'), '$0.99');
                    });
                });
                describe('isProductAvailable', function () {
                    beforeEach(function () {
                        var promise = PurchasingUtilities_1.PurchasingUtilities.refreshCatalog();
                        purchasing.onGetPromoCatalog.trigger(promoCatalog);
                        return promise;
                    });
                    it('should return true if given product id is in the product catalog', function () {
                        chai_1.assert.equal(true, PurchasingUtilities_1.PurchasingUtilities.isProductAvailable('myPromo'));
                    });
                    it('should return false if given product is not in the catalog', function () {
                        chai_1.assert.equal(false, PurchasingUtilities_1.PurchasingUtilities.isProductAvailable('booyah'));
                    });
                    describe('If promo catalog is invalid', function () {
                        beforeEach(function () {
                            var promise = PurchasingUtilities_1.PurchasingUtilities.refreshCatalog();
                            purchasing.onGetPromoCatalog.trigger(promoCatalogEmpty);
                            return promise;
                        });
                        it('should return false if catalog has has size of 0', function () {
                            chai_1.assert.equal(false, PurchasingUtilities_1.PurchasingUtilities.isProductAvailable('myPromo'));
                        });
                    });
                });
                describe('Handle Send Event', function () {
                    beforeEach(function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities.placementManager, 'setPlacementReady');
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities.placementManager, 'setPlacementState');
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'sendPurchaseInitializationEvent').returns(Promise.resolve());
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                    });
                    afterEach(function () {
                        sandbox.restore();
                    });
                    it('Should send the purchase initialization event and call refresh catalog when iap payload type is catalogupdated', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(false);
                        return PurchasingUtilities_1.PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(function () {
                            sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent);
                            sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.refreshCatalog);
                        });
                    });
                    it('Should not send the purchase initialization event if IAP is already initialized', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(true);
                        return PurchasingUtilities_1.PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(function () {
                            sinon.assert.notCalled(PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent);
                            sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.refreshCatalog);
                        });
                    });
                    it('Should not handle update when passed iap payload type is not CatalogUpdated', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(false);
                        return PurchasingUtilities_1.PurchasingUtilities.handleSendIAPEvent('{"type":"sadfasdf"}').then(function () {
                            sinon.assert.notCalled(PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent);
                            sinon.assert.notCalled(PurchasingUtilities_1.PurchasingUtilities.refreshCatalog);
                        }).catch(function (e) {
                            chai_1.assert.equal(e.message, 'IAP Payload is incorrect');
                        });
                    });
                    it('Should set the current placement state to nofill if product is not in the catalog', function () {
                        var campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities.placementManager, 'getPlacementCampaignMap').returns({ 'promoPlacement': campaign });
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(false);
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(false);
                        sandbox.stub(campaign, 'getAdType').returns('purchasing/iap');
                        return PurchasingUtilities_1.PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(function () {
                            sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent);
                            sinon.assert.calledWith(PurchasingUtilities_1.PurchasingUtilities.isProductAvailable, 'com.example.iap.product1');
                            sinon.assert.calledWith(PurchasingUtilities_1.PurchasingUtilities.placementManager.setPlacementState, 'promoPlacement', Placement_1.PlacementState.NO_FILL);
                        });
                    });
                    it('Should set the placement as ready if product is in the catalog', function () {
                        var campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities.placementManager, 'getPlacementCampaignMap').returns({ 'promoPlacement': campaign });
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(false);
                        return PurchasingUtilities_1.PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(function () {
                            sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent);
                            sinon.assert.calledWith(PurchasingUtilities_1.PurchasingUtilities.isProductAvailable, 'com.example.iap.product1');
                            sinon.assert.calledWith(PurchasingUtilities_1.PurchasingUtilities.placementManager.setPlacementReady, 'promoPlacement', campaign);
                        });
                    });
                    it('Should set the placement as nofill if campaign is not a promo campaign', function () {
                        var campaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities.placementManager, 'getPlacementCampaignMap').returns({ 'placement': campaign });
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isInitialized').returns(false);
                        return PurchasingUtilities_1.PurchasingUtilities.handleSendIAPEvent('{\"type\":\"CatalogUpdated\"}').then(function () {
                            sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.sendPurchaseInitializationEvent);
                            sinon.assert.notCalled(PurchasingUtilities_1.PurchasingUtilities.isProductAvailable);
                            sinon.assert.calledWith(PurchasingUtilities_1.PurchasingUtilities.placementManager.setPlacementState, 'placement', Placement_1.PlacementState.NO_FILL);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHVyY2hhc2luZ1V0aWxpdGllc1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQdXJjaGFzaW5nVXRpbGl0aWVzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBaUJBLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRTtnQkFDaEMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFVBQXlCLENBQUM7Z0JBQzlCLElBQUksR0FBVyxDQUFDO2dCQUNoQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksZ0JBQWtDLENBQUM7Z0JBQ3ZDLElBQUksT0FBMkIsQ0FBQztnQkFDaEMsSUFBTSxZQUFZLEdBQUcsc1NBQXNTLENBQUM7Z0JBQzVULElBQU0sZUFBZSxHQUFHLGdCQUFnQixDQUFDO2dCQUN6QyxJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQztnQkFDL0IsSUFBTSxrQkFBa0IsR0FBa0I7b0JBQ3RDLFNBQVMsRUFBRSxTQUFTO29CQUNwQixjQUFjLEVBQUUsS0FBSztvQkFDckIsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLFFBQVEsRUFBRSxJQUFJO29CQUNkLE1BQU0sRUFBRSxLQUFLO29CQUNiLE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxtQ0FBYSxDQUFDLFFBQVE7b0JBQy9CLG9CQUFvQixFQUFFLENBQUMsK0JBQStCLEVBQUUsMkJBQTJCLENBQUM7aUJBQ3ZGLENBQUM7Z0JBRUYsSUFBTSxnQkFBZ0IsR0FBa0I7b0JBQ3BDLFNBQVMsRUFBRSxTQUFTO29CQUNwQixjQUFjLEVBQUUsS0FBSztvQkFDckIsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLFFBQVEsRUFBRSxJQUFJO29CQUNkLE1BQU0sRUFBRSxLQUFLO29CQUNiLE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxtQ0FBYSxDQUFDLE1BQU07b0JBQzdCLG9CQUFvQixFQUFF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