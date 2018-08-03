System.register(["mocha", "sinon", "chai", "AdUnits/AdUnitFactory", "Managers/ThirdPartyEventManager", "../TestHelpers/TestFixtures", "Utilities/Request", "Managers/WakeUpManager", "Constants/Platform", "Managers/SessionManager", "AdUnits/Containers/Activity", "AdUnits/Containers/AdUnitContainer", "Managers/MetaDataManager", "Constants/FinishState", "Managers/FocusManager", "Parsers/ConfigurationParser", "Utilities/MoatViewabilityService", "Utilities/PurchasingUtilities", "Managers/OperativeEventManagerFactory", "Managers/GdprManager", "json/ConfigurationAuctionPlc.json", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, AdUnitFactory_1, ThirdPartyEventManager_1, TestFixtures_1, Request_1, WakeUpManager_1, Platform_1, SessionManager_1, Activity_1, AdUnitContainer_1, MetaDataManager_1, FinishState_1, FocusManager_1, ConfigurationParser_1, MoatViewabilityService_1, PurchasingUtilities_1, OperativeEventManagerFactory_1, GdprManager_1, ConfigurationAuctionPlc_json_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (AdUnitFactory_1_1) {
                AdUnitFactory_1 = AdUnitFactory_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (FinishState_1_1) {
                FinishState_1 = FinishState_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (MoatViewabilityService_1_1) {
                MoatViewabilityService_1 = MoatViewabilityService_1_1;
            },
            function (PurchasingUtilities_1_1) {
                PurchasingUtilities_1 = PurchasingUtilities_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            },
            function (ForceQuitManager_1_1) {
                ForceQuitManager_1 = ForceQuitManager_1_1;
            }
        ],
        execute: function () {
            describe('AdUnitFactoryTest', function () {
                var sandbox;
                var nativeBridge;
                var focusManager;
                var container;
                var deviceInfo;
                var clientInfo;
                var sessionManager;
                var operativeEventManager;
                var config;
                var metaDataManager;
                var thirdPartyEventManager;
                var request;
                var adUnitParameters;
                var wakeUpManager;
                var forceQuitManager;
                before(function () {
                    sandbox = sinon.sandbox.create();
                });
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    sandbox.stub(container, 'close').returns(Promise.resolve());
                    sandbox.stub(container, 'open').returns(Promise.resolve());
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    var placement = TestFixtures_1.TestFixtures.getPlacement();
                    config = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc_json_1.default));
                    deviceInfo = { getLanguage: function () { return 'en'; }, getAdvertisingIdentifier: function () { return '000'; }, getLimitAdTracking: function () { return false; }, getOsVersion: function () { return '8.0'; } };
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    thirdPartyEventManager.setTemplateValues({ '%ZONE%': placement.getId(), '%SDK_VERSION%': clientInfo.getSdkVersion().toString() });
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    var campaign = TestFixtures_1.TestFixtures.getCampaign();
                    var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: config,
                        campaign: campaign
                    });
                    sandbox.stub(MoatViewabilityService_1.MoatViewabilityService, 'initMoat');
                    adUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: placement,
                        campaign: campaign,
                        configuration: config,
                        request: request,
                        options: {},
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    };
                    sandbox.spy(thirdPartyEventManager, 'sendEvent');
                    sandbox.spy(request, 'get');
                    sandbox.stub(nativeBridge.WebPlayer, 'setSettings').returns(Promise.resolve());
                    sandbox.stub(nativeBridge.WebPlayer, 'clearSettings').returns(Promise.resolve());
                });
                afterEach(function () {
                    sandbox.restore();
                });
                describe('MRAID AdUnit', function () {
                    var adUnit;
                    var testThirdPartyEventManager;
                    var campaign;
                    beforeEach(function () {
                        testThirdPartyEventManager = {
                            thirdPartyEvent: sinon.stub().returns(Promise.resolve())
                        };
                        campaign = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaign();
                        var resourceUrl = campaign.getResourceUrl();
                        if (resourceUrl) {
                            resourceUrl.setFileId('1234');
                        }
                        operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: config,
                            campaign: campaign
                        });
                        sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());
                        adUnitParameters.campaign = campaign;
                        adUnitParameters.operativeEventManager = operativeEventManager;
                        adUnit = AdUnitFactory_1.AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                    });
                    describe('on hide', function () {
                        it('should trigger onClose when hide is called', function (done) {
                            adUnit.setShowing(true);
                            adUnit.onClose.subscribe(function () {
                                chai_1.assert.equal(adUnit.isShowing(), false);
                                done();
                            });
                            adUnit.hide();
                        });
                        it('should trigger onFinish when hide is called', function (done) {
                            adUnit.setShowing(true);
                            adUnit.onFinish.subscribe(function () {
                                done();
                            });
                            adUnit.hide();
                        });
                        it('should call trackers on on finish state completed', function () {
                            adUnit.setShowing(true);
                            adUnit.setFinishState(FinishState_1.FinishState.COMPLETED);
                            adUnit.hide();
                            sinon.assert.calledOnce(operativeEventManager.sendThirdQuartile);
                            sinon.assert.calledOnce(operativeEventManager.sendView);
                            sinon.assert.calledWith(thirdPartyEventManager.sendEvent, 'mraid complete', '12345', 'http://test.complete.com/complete1');
                        });
                        it('should call sendSkip on finish state skipped', function () {
                            adUnit.setShowing(true);
                            adUnit.setFinishState(FinishState_1.FinishState.SKIPPED);
                            adUnit.hide();
                            sinon.assert.calledOnce(operativeEventManager.sendSkip);
                        });
                    });
                    describe('on show', function () {
                        it('should trigger onStart', function (done) {
                            adUnit.onStart.subscribe(function () {
                                adUnit.hide();
                                done();
                            });
                            adUnit.show();
                        });
                        it('should call sendStart', function () {
                            adUnit.show();
                            sinon.assert.calledOnce(operativeEventManager.sendStart);
                            adUnit.hide();
                        });
                        it('should send impressions', function () {
                            adUnit.show();
                            sinon.assert.calledWith(thirdPartyEventManager.sendEvent, 'mraid impression', '12345', 'http://test.impression.com/blah1');
                            sinon.assert.calledWith(thirdPartyEventManager.sendEvent, 'mraid impression', '12345', 'http://test.impression.com/blah2');
                            adUnit.hide();
                        });
                        it('should replace macros in the postback impression url', function () {
                            adUnit.show();
                            thirdPartyEventManager.sendEvent.restore();
                            chai_1.assert.equal('http://test.impression.com/fooId/blah?sdkVersion=2000', request.get.getCall(2).args[0], 'should have replaced template values in the url');
                            adUnit.hide();
                        });
                    });
                    it('should call click tracker', function () {
                        adUnit.sendClick();
                        sinon.assert.calledWith(thirdPartyEventManager.sendEvent, 'mraid click', '12345', 'http://test.complete.com/click1');
                    });
                });
                describe('DisplayInterstitialAdUnit', function () {
                    describe('On static-interstial campaign', function () {
                        var adUnit;
                        var campaign;
                        beforeEach(function () {
                            campaign = TestFixtures_1.TestFixtures.getDisplayInterstitialCampaign();
                            adUnitParameters.campaign = campaign;
                            adUnitParameters.operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                                nativeBridge: nativeBridge,
                                request: request,
                                metaDataManager: metaDataManager,
                                sessionManager: sessionManager,
                                clientInfo: clientInfo,
                                deviceInfo: deviceInfo,
                                configuration: config,
                                campaign: campaign
                            });
                            sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
                            sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
                            sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
                            sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());
                            adUnit = AdUnitFactory_1.AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                        });
                        describe('on show', function () {
                            it('should send tracking events', function () {
                                return adUnit.show().then(function () {
                                    sinon.assert.calledOnce(thirdPartyEventManager.sendEvent);
                                    sinon.assert.calledWith(thirdPartyEventManager.sendEvent, 'display impression', campaign.getSession().getId(), 'https://unity3d.com/impression');
                                    return adUnit.hide();
                                });
                            });
                        });
                    });
                });
                describe('Promo AdUnit', function () {
                    var promoAdUnit;
                    var campaign;
                    beforeEach(function () {
                        campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'getProductPrice').returns('3 €');
                        sandbox.stub(campaign, 'getSession').returns({
                            getId: sinon.stub().returns('1111')
                        });
                        adUnitParameters.campaign = campaign;
                        adUnitParameters.operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: config,
                            campaign: campaign
                        });
                        sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());
                        promoAdUnit = AdUnitFactory_1.AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                    });
                    describe('on show', function () {
                        it('should trigger onStart', function (done) {
                            promoAdUnit.onStart.subscribe(function () {
                                done();
                            });
                            promoAdUnit.show();
                        });
                    });
                    describe('on hide', function () {
                        it('should trigger onClose when hide is called', function (done) {
                            promoAdUnit.setShowing(true);
                            promoAdUnit.onClose.subscribe(function () {
                                chai_1.assert.equal(promoAdUnit.isShowing(), false);
                                done();
                            });
                            promoAdUnit.hide();
                        });
                    });
                });
                describe('XPromo AdUnit', function () {
                    var adUnit;
                    var campaign;
                    beforeEach(function () {
                        campaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                        adUnitParameters.campaign = campaign;
                        adUnitParameters.operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: config,
                            campaign: campaign
                        });
                        sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
                        sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());
                        adUnit = AdUnitFactory_1.AdUnitFactory.createAdUnit(nativeBridge, adUnitParameters);
                    });
                    describe('on hide', function () {
                        it('should trigger onClose when hide is called', function (done) {
                            adUnit.setShowing(true);
                            adUnit.onClose.subscribe(function () {
                                chai_1.assert.equal(adUnit.isShowing(), false);
                                done();
                            });
                            adUnit.hide();
                        });
                    });
                    describe('on show', function () {
                        it('should trigger onStart', function (done) {
                            adUnit.onStart.subscribe(function () {
                                adUnit.hide();
                                done();
                            });
                            adUnit.show();
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0RmFjdG9yeVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBZFVuaXRGYWN0b3J5VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBNENBLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtnQkFFMUIsSUFBSSxPQUEyQixDQUFDO2dCQUNoQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxTQUEwQixDQUFDO2dCQUMvQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLHFCQUE0QyxDQUFDO2dCQUNqRCxJQUFJLE1BQXFCLENBQUM7Z0JBQzFCLElBQUksZUFBZ0MsQ0FBQztnQkFDckMsSUFBSSxzQkFBOEMsQ0FBQztnQkFDbkQsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLGdCQUE2QyxDQUFDO2dCQUNsRCxJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksZ0JBQWtDLENBQUM7Z0JBRXZDLE1BQU0sQ0FBQztvQkFDSCxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDckMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRywyQkFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO29CQUM5QyxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNwRCxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM5QyxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDOUQsT0FBTyxHQUFHLElBQUksaUJBQU8s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