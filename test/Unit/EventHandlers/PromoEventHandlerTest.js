System.register(["mocha", "sinon", "Native/NativeBridge", "AdUnits/PromoAdUnit", "EventHandlers/PromoEventHandler", "json/DummyPromoCampaign.json", "Utilities/PurchasingUtilities", "Models/Configuration", "Models/ABGroup", "Managers/GdprManager", "Constants/FinishState"], function (exports_1, context_1) {
    "use strict";
    var sinon, NativeBridge_1, PromoAdUnit_1, PromoEventHandler_1, DummyPromoCampaign_json_1, PurchasingUtilities_1, Configuration_1, ABGroup_1, GdprManager_1, FinishState_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (PromoAdUnit_1_1) {
                PromoAdUnit_1 = PromoAdUnit_1_1;
            },
            function (PromoEventHandler_1_1) {
                PromoEventHandler_1 = PromoEventHandler_1_1;
            },
            function (DummyPromoCampaign_json_1_1) {
                DummyPromoCampaign_json_1 = DummyPromoCampaign_json_1_1;
            },
            function (PurchasingUtilities_1_1) {
                PurchasingUtilities_1 = PurchasingUtilities_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (ABGroup_1_1) {
                ABGroup_1 = ABGroup_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (FinishState_1_1) {
                FinishState_1 = FinishState_1_1;
            }
        ],
        execute: function () {
            describe('PromoEventHandlersTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var json = JSON.parse(DummyPromoCampaign_json_1.default);
                var nativeBridge;
                var promoAdUnit;
                var sandbox;
                var purchaseTrackingUrls = 'https://events.iap.unity3d.com/events/v1/purchase?co=USA&creid=5a57d399d7482b0945616f35&gid=1019712&pjid=c4b860aa-e0a8-4a58-9f6c-95d419461f1e&plid=placementA&pmid=5a57d3a206a1590006a1d28e&prdid=com.product.2&stky=0&store=google&txid=UX-47c9ac4c-39c5-4e0e-685kl%3Bkl%3Be-66d4619dcc81&uid=567f09ab1ae7f2fc01402d9e&val=4.99';
                beforeEach(function () {
                    sandbox = sinon.sandbox.create();
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'sendPromoPayload');
                });
                afterEach(function () {
                    sandbox.restore();
                });
                describe('when calling onClose', function () {
                    it('should hide adunit', function () {
                        promoAdUnit = sinon.createStubInstance(PromoAdUnit_1.PromoAdUnit);
                        PromoEventHandler_1.PromoEventHandler.onClose(promoAdUnit, '111', '111', ABGroup_1.ABGroupBuilder.getAbGroup(1), [purchaseTrackingUrls], false);
                        sinon.assert.called(promoAdUnit.hide);
                    });
                    it('should set adunit finish state to completed', function () {
                        promoAdUnit = sinon.createStubInstance(PromoAdUnit_1.PromoAdUnit);
                        PromoEventHandler_1.PromoEventHandler.onClose(promoAdUnit, '111', '111', ABGroup_1.ABGroupBuilder.getAbGroup(1), [purchaseTrackingUrls], false);
                        sinon.assert.calledWith(promoAdUnit.setFinishState, FinishState_1.FinishState.COMPLETED);
                    });
                    it('should call sendPromoPayload', function () {
                        promoAdUnit = sinon.createStubInstance(PromoAdUnit_1.PromoAdUnit);
                        PromoEventHandler_1.PromoEventHandler.onClose(promoAdUnit, '111', '111', ABGroup_1.ABGroupBuilder.getAbGroup(1), [purchaseTrackingUrls], false);
                        sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.sendPromoPayload);
                    });
                });
                describe('when calling onPromo', function () {
                    it('should hide adunit', function () {
                        promoAdUnit = sinon.createStubInstance(PromoAdUnit_1.PromoAdUnit);
                        PromoEventHandler_1.PromoEventHandler.onPromo(promoAdUnit, 'com.unit.test.iapproductid', [purchaseTrackingUrls]);
                        sinon.assert.called(promoAdUnit.hide);
                    });
                    it('should set adunit finish state to completed', function () {
                        promoAdUnit = sinon.createStubInstance(PromoAdUnit_1.PromoAdUnit);
                        PromoEventHandler_1.PromoEventHandler.onPromo(promoAdUnit, 'com.unit.test.iapproductid', [purchaseTrackingUrls]);
                        sinon.assert.calledWith(promoAdUnit.setFinishState, FinishState_1.FinishState.COMPLETED);
                    });
                    it('should call sendPromoPayload', function () {
                        promoAdUnit = sinon.createStubInstance(PromoAdUnit_1.PromoAdUnit);
                        PromoEventHandler_1.PromoEventHandler.onPromo(promoAdUnit, 'com.unit.test.iapproductid', [purchaseTrackingUrls]);
                        sinon.assert.called(PurchasingUtilities_1.PurchasingUtilities.sendPromoPayload);
                    });
                });
                describe('when calling onGDPRPopupSkipped', function () {
                    var gdprManager;
                    beforeEach(function () {
                        gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    });
                    it('should set the optOutRecorded flag in the configuration', function () {
                        var config = sinon.createStubInstance(Configuration_1.Configuration);
                        config.isOptOutRecorded.returns(false);
                        PromoEventHandler_1.PromoEventHandler.onGDPRPopupSkipped(config, gdprManager);
                        sinon.assert.calledWith(config.setOptOutRecorded, true);
                    });
                    it('should send GDPR operative Event with skip', function () {
                        var config = sinon.createStubInstance(Configuration_1.Configuration);
                        config.isOptOutRecorded.returns(false);
                        PromoEventHandler_1.PromoEventHandler.onGDPRPopupSkipped(config, gdprManager);
                        sinon.assert.calledWithExactly(gdprManager.sendGDPREvent, 'skip');
                    });
                    it('should not call gdpr or set optOutRecorded when already recorded', function () {
                        var config = sinon.createStubInstance(Configuration_1.Configuration);
                        config.isOptOutRecorded.returns(true);
                        PromoEventHandler_1.PromoEventHandler.onGDPRPopupSkipped(config, gdprManager);
                        sinon.assert.notCalled(config.setOptOutRecorded);
                        sinon.assert.notCalled(gdprManager.sendGDPREvent);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbW9FdmVudEhhbmRsZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUHJvbW9FdmVudEhhbmRsZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFlQSxRQUFRLENBQUMsd0JBQXdCLEVBQUU7Z0JBQy9CLElBQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ25DLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUNBQVUsQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksV0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxPQUEyQixDQUFDO2dCQUNoQyxJQUFNLG9CQUFvQixHQUFHLGtVQUFrVSxDQUFDO2dCQUVoVyxVQUFVLENBQUM7b0JBQ1AsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ2pDLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUM7d0JBQzVCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTtxQkFDakIsQ0FBQyxDQUFDO29CQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMseUNBQW1CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDMUQsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDO29CQUNOLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLHNCQUFzQixFQUFFO29CQUM3QixFQUFFLENBQUMsb0JBQW9CLEVBQUU7d0JBQ3JCLFdBQVcsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxDQUFDO3dCQUVwRCxxQ0FBaUIsQ0FBQyxPQUFPLENBQUMsV0FBVyxF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