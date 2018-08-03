System.register(["mocha", "sinon", "EventHandlers/MRAIDEventHandler", "Native/NativeBridge", "../TestHelpers/TestFixtures", "Managers/ThirdPartyEventManager", "Utilities/Request", "Managers/WakeUpManager", "AdUnits/MRAIDAdUnit", "Constants/Platform", "AdUnits/Containers/Activity", "AdUnits/Containers/AdUnitContainer", "Views/MRAID", "Utilities/HttpKafka", "Managers/FocusManager", "Managers/OperativeEventManager", "Views/GDPRPrivacy", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, MRAIDEventHandler_1, NativeBridge_1, TestFixtures_1, ThirdPartyEventManager_1, Request_1, WakeUpManager_1, MRAIDAdUnit_1, Platform_1, Activity_1, AdUnitContainer_1, MRAID_1, HttpKafka_1, FocusManager_1, OperativeEventManager_1, GDPRPrivacy_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (MRAIDEventHandler_1_1) {
                MRAIDEventHandler_1 = MRAIDEventHandler_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (MRAIDAdUnit_1_1) {
                MRAIDAdUnit_1 = MRAIDAdUnit_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (MRAID_1_1) {
                MRAID_1 = MRAID_1_1;
            },
            function (HttpKafka_1_1) {
                HttpKafka_1 = HttpKafka_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (OperativeEventManager_1_1) {
                OperativeEventManager_1 = OperativeEventManager_1_1;
            },
            function (GDPRPrivacy_1_1) {
                GDPRPrivacy_1 = GDPRPrivacy_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            },
            function (ForceQuitManager_1_1) {
                ForceQuitManager_1 = ForceQuitManager_1_1;
            }
        ],
        execute: function () {
            describe('MRAIDEventHandlersTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, container;
                var mraidAdUnit;
                var mraidView;
                var placement;
                var focusManager;
                var request;
                var operativeEventManager;
                var deviceInfo;
                var clientInfo;
                var thirdPartyEventManager;
                var mraidAdUnitParameters;
                var mraidEventHandler;
                var mraidCampaign;
                var gdprManager;
                var programmaticTrackingService;
                var forceQuitManager;
                describe('with onClick', function () {
                    var resolvedPromise;
                    beforeEach(function () {
                        nativeBridge = new NativeBridge_1.NativeBridge({
                            handleInvocation: handleInvocation,
                            handleCallback: handleCallback
                        }, Platform_1.Platform.ANDROID);
                        sinon.spy(nativeBridge.Intent, 'launch');
                        sinon.spy(nativeBridge.UrlScheme, 'open');
                        sinon.spy(nativeBridge.Listener, 'sendClickEvent');
                        forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                        focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                        request = sinon.createStubInstance(Request_1.Request);
                        placement = TestFixtures_1.TestFixtures.getPlacement();
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        request = new Request_1.Request(nativeBridge, wakeUpManager);
                        clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                        deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                        thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager_1.ThirdPartyEventManager);
                        operativeEventManager = sinon.createStubInstance(OperativeEventManager_1.OperativeEventManager);
                        resolvedPromise = Promise.resolve(TestFixtures_1.TestFixtures.getOkNativeResponse());
                        mraidCampaign = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaign();
                        mraidView = sinon.createStubInstance(MRAID_1.MRAID);
                        mraidView.container.restore();
                        sinon.stub(mraidView, 'container').returns(document.createElement('div'));
                        gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        mraidAdUnitParameters = {
                            forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                            focusManager: focusManager,
                            container: container,
                            deviceInfo: deviceInfo,
                            clientInfo: clientInfo,
                            thirdPartyEventManager: thirdPartyEventManager,
                            operativeEventManager: operativeEventManager,
                            placement: TestFixtures_1.TestFixtures.getPlacement(),
                            campaign: mraidCampaign,
                            configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                            request: request,
                            options: {},
                            mraid: mraidView,
                            endScreen: undefined,
                            privacy: new GDPRPrivacy_1.GDPRPrivacy(nativeBridge, gdprManager, false, true),
                            gdprManager: gdprManager,
                            programmaticTrackingService: programmaticTrackingService
                        };
                        mraidAdUnit = new MRAIDAdUnit_1.MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                        sinon.stub(mraidAdUnit, 'sendClick');
                        mraidEventHandler = new MRAIDEventHandler_1.MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
                    });
                    it('should send a click with session manager', function () {
                        mraidEventHandler.onMraidClick('http://example.net');
                        sinon.assert.calledWith(operativeEventManager.sendClick, { placement: placement, asset: mraidAdUnitParameters.campaign.getResourceUrl() });
                    });
                    it('should send a view with session manager', function () {
                        mraidEventHandler.onMraidClick('http://example.net');
                        sinon.assert.calledWith(operativeEventManager.sendView, { placement: placement, asset: mraidAdUnitParameters.campaign.getResourceUrl() });
                    });
                    it('should send a third quartile event with session manager', function () {
                        mraidEventHandler.onMraidClick('http://example.net');
                        sinon.assert.calledWith(operativeEventManager.sendThirdQuartile, { placement: placement, asset: mraidAdUnitParameters.campaign.getResourceUrl() });
                    });
                    it('should send a native click event', function () {
                        mraidEventHandler.onMraidClick('http://example.net');
                        sinon.assert.calledWith(nativeBridge.Listener.sendClickEvent, placement.getId());
                    });
                    describe('with follow redirects', function () {
                        it('with response that contains location, it should launch intent', function () {
                            mraidCampaign = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                            thirdPartyEventManager.clickAttributionEvent.restore();
                            sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                                url: 'http://foo.url.com',
                                response: 'foo response',
                                responseCode: 200,
                                headers: [['location', 'market://foobar.com']]
                            }));
                            mraidView = new MRAID_1.MRAID(nativeBridge, placement, mraidCampaign, mraidAdUnitParameters.privacy, true);
                            sinon.stub(mraidView, 'createMRAID').callsFake(function () {
                                return Promise.resolve();
                            });
                            mraidAdUnitParameters.campaign = mraidCampaign;
                            mraidAdUnitParameters.mraid = mraidView;
                            mraidAdUnitParameters.thirdPartyEventManager = thirdPartyEventManager;
                            mraidAdUnit = new MRAIDAdUnit_1.MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                            sinon.stub(mraidAdUnit, 'sendClick');
                            mraidEventHandler = new MRAIDEventHandler_1.MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
                            mraidEventHandler.onMraidClick('market://foobar.com');
                            return resolvedPromise.then(function () {
                                sinon.assert.calledWith(nativeBridge.Intent.launch, {
                                    'action': 'android.intent.action.VIEW',
                                    'uri': 'market://foobar.com'
                                });
                            });
                        });
                        it('with response that does not contain location, it should not launch intent', function () {
                            mraidCampaign = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                            thirdPartyEventManager.clickAttributionEvent.restore();
                            sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve());
                            mraidAdUnitParameters.mraid = mraidView;
                            mraidAdUnitParameters.campaign = mraidCampaign;
                            mraidAdUnitParameters.thirdPartyEventManager = thirdPartyEventManager;
                            operativeEventManager.sendClick.restore();
                            var response = TestFixtures_1.TestFixtures.getOkNativeResponse();
                            response.headers = [];
                            resolvedPromise = Promise.resolve(response);
                            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                            mraidAdUnitParameters.operativeEventManager = operativeEventManager;
                            mraidAdUnit = new MRAIDAdUnit_1.MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                            sinon.stub(mraidAdUnit, 'sendClick');
                            mraidEventHandler = new MRAIDEventHandler_1.MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
                            mraidEventHandler.onMraidClick('http://example.net');
                            return resolvedPromise.then(function () {
                                sinon.assert.notCalled(nativeBridge.Intent.launch);
                            });
                        });
                    });
                    describe('with onAnalyticsEvent', function () {
                        var sandbox;
                        before(function () {
                            sandbox = sinon.sandbox.create();
                        });
                        beforeEach(function () {
                            mraidCampaign = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaign();
                            mraidAdUnitParameters.campaign = mraidCampaign;
                            sandbox.stub(HttpKafka_1.HttpKafka, 'sendEvent');
                        });
                        afterEach(function () {
                            sandbox.restore();
                        });
                        it('should send a analytics event', function () {
                            mraidAdUnit = new MRAIDAdUnit_1.MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                            sinon.stub(mraidAdUnit, 'sendClick');
                            mraidEventHandler = new MRAIDEventHandler_1.MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
                            mraidEventHandler.onMraidAnalyticsEvent(15, 12, 0, 'win_screen', { 'level': 2 });
                            var kafkaObject = {};
                            kafkaObject.type = 'win_screen';
                            kafkaObject.eventData = { 'level': 2 };
                            kafkaObject.timeFromShow = 15;
                            kafkaObject.timeFromPlayableStart = 12;
                            kafkaObject.backgroundTime = 0;
                            var resourceUrl = mraidCampaign.getResourceUrl();
                            if (resourceUrl) {
                                kafkaObject.url = resourceUrl.getOriginalUrl();
                            }
                            sinon.assert.calledWith(HttpKafka_1.HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', HttpKafka_1.KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                        });
                        it('should send a analytics event without extra event data', function () {
                            mraidAdUnit = new MRAIDAdUnit_1.MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                            sinon.stub(mraidAdUnit, 'sendClick');
                            mraidEventHandler = new MRAIDEventHandler_1.MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
                            mraidEventHandler.onMraidAnalyticsEvent(15, 12, 5, 'win_screen', undefined);
                            var kafkaObject = {};
                            kafkaObject.type = 'win_screen';
                            kafkaObject.eventData = undefined;
                            kafkaObject.timeFromShow = 15;
                            kafkaObject.timeFromPlayableStart = 12;
                            kafkaObject.backgroundTime = 5;
                            var resourceUrl = mraidCampaign.getResourceUrl();
                            if (resourceUrl) {
                                kafkaObject.url = resourceUrl.getOriginalUrl();
                            }
                            sinon.assert.calledWith(HttpKafka_1.HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', HttpKafka_1.KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURFdmVudEhhbmRsZXJzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1SQUlERXZlbnRIYW5kbGVyc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQTZCQSxRQUFRLENBQUMsd0JBQXdCLEVBQUU7Z0JBRS9CLElBQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ25DLElBQUksWUFBMEIsRUFBRSxTQUEwQixDQUFDO2dCQUMzRCxJQUFJLFdBQXdCLENBQUM7Z0JBQzdCLElBQUksU0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxTQUFvQixDQUFDO2dCQUN6QixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxxQkFBNEMsQ0FBQztnQkFDakQsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksc0JBQThDLENBQUM7Z0JBQ25ELElBQUkscUJBQTZDLENBQUM7Z0JBQ2xELElBQUksaUJBQW9DLENBQUM7Z0JBQ3pDLElBQUksYUFBNEIsQ0FBQztnQkFDakMsSUFBSSxXQUF3QixDQUFDO2dCQUM3QixJQUFJLDJCQUF3RCxDQUFDO2dCQUM3RCxJQUFJLGdCQUFrQyxDQUFDO2dCQUV2QyxRQUFRLENBQUMsY0FBYyxFQUFFO29CQUNyQixJQUFJLGVBQXlDLENBQUM7b0JBRTlDLFVBQVUsQ0FBQzt3QkFDUCxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDOzRCQUM1QixnQkFBZ0Isa0JBQUE7NEJBQ2hCLGNBQWMsZ0JBQUE7eUJBQ2pCLEVBQUUsbUJBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFFckIsS0FBSyxDQUFDLEdBQUcs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