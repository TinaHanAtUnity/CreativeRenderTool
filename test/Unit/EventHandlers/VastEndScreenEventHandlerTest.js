System.register(["mocha", "sinon", "Native/NativeBridge", "../TestHelpers/TestFixtures", "Views/Overlay", "Constants/Platform", "AdUnits/VastAdUnit", "Views/VastEndScreen", "EventHandlers/VastEndScreenEventHandler", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "Models/Assets/Video", "Utilities/Request", "Managers/FocusManager", "Managers/WakeUpManager", "Managers/ThirdPartyEventManager", "Managers/MetaDataManager", "Managers/SessionManager", "xml/EventTestVast.xml", "Managers/OperativeEventManagerFactory", "Managers/GdprManager", "Views/Privacy", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, NativeBridge_1, TestFixtures_1, Overlay_1, Platform_1, VastAdUnit_1, VastEndScreen_1, VastEndScreenEventHandler_1, AdUnitContainer_1, Activity_1, Video_1, Request_1, FocusManager_1, WakeUpManager_1, ThirdPartyEventManager_1, MetaDataManager_1, SessionManager_1, EventTestVast_xml_1, OperativeEventManagerFactory_1, GdprManager_1, Privacy_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (VastAdUnit_1_1) {
                VastAdUnit_1 = VastAdUnit_1_1;
            },
            function (VastEndScreen_1_1) {
                VastEndScreen_1 = VastEndScreen_1_1;
            },
            function (VastEndScreenEventHandler_1_1) {
                VastEndScreenEventHandler_1 = VastEndScreenEventHandler_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (Video_1_1) {
                Video_1 = Video_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (EventTestVast_xml_1_1) {
                EventTestVast_xml_1 = EventTestVast_xml_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            },
            function (ForceQuitManager_1_1) {
                ForceQuitManager_1 = ForceQuitManager_1_1;
            }
        ],
        execute: function () {
            describe('VastEndScreenEventHandlersTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var container;
                var request;
                var vastAdUnitParameters;
                var forceQuitManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, new FocusManager_1.FocusManager(nativeBridge)));
                    sinon.stub(request, 'followRedirectChain').callsFake(function (url) {
                        return Promise.resolve(url);
                    });
                    var campaign = TestFixtures_1.TestFixtures.getCompanionVastCampaign();
                    var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    var thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    var operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: configuration,
                        campaign: campaign
                    });
                    var privacy = new Privacy_1.Privacy(nativeBridge, false);
                    var video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                    var overlay = new Overlay_1.Overlay(nativeBridge, true, 'en', 'testGameId', privacy, false);
                    var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    vastAdUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        campaign: campaign,
                        configuration: configuration,
                        request: request,
                        options: {},
                        endScreen: undefined,
                        overlay: overlay,
                        video: video,
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    };
                });
                describe('when calling onClose', function () {
                    it('should hide endcard', function () {
                        var vastEndScreen = new VastEndScreen_1.VastEndScreen(nativeBridge, vastAdUnitParameters.configuration.isCoppaCompliant(), vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
                        vastAdUnitParameters.endScreen = vastEndScreen;
                        var vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        sinon.stub(vastAdUnit, 'hide').returns(sinon.spy());
                        var vastEndScreenEventHandler = new VastEndScreenEventHandler_1.VastEndScreenEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
                        vastEndScreenEventHandler.onVastEndScreenClose();
                        sinon.assert.called(vastAdUnit.hide);
                    });
                });
                describe('when calling onClick', function () {
                    var vastAdUnit;
                    var video;
                    var campaign;
                    var vastEndScreenEventHandler;
                    var vastXml = EventTestVast_xml_1.default;
                    var vastParser = TestFixtures_1.TestFixtures.getVastParser();
                    var vast = vastParser.parseVast(vastXml);
                    beforeEach(function () {
                        video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                        campaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                        vastAdUnitParameters.video = video;
                        vastAdUnitParameters.campaign = campaign;
                        vastAdUnitParameters.placement = TestFixtures_1.TestFixtures.getPlacement();
                        var vastEndScreen = new VastEndScreen_1.VastEndScreen(nativeBridge, vastAdUnitParameters.configuration.isCoppaCompliant(), vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
                        vastAdUnitParameters.endScreen = vastEndScreen;
                        vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        vastEndScreenEventHandler = new VastEndScreenEventHandler_1.VastEndScreenEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
                    });
                    it('should send a tracking event for vast video end card click', function () {
                        sinon.stub(vastAdUnit, 'sendTrackingEvent');
                        return vastEndScreenEventHandler.onVastEndScreenClick().then(function () {
                            sinon.assert.called(vastAdUnit.sendTrackingEvent);
                        });
                    });
                    it('should use video click through url when companion click url is not present', function () {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform_1.Platform.IOS);
                        sinon.stub(nativeBridge.UrlScheme, 'open');
                        sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
                        sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');
                        return vastEndScreenEventHandler.onVastEndScreenClick().then(function () {
                            sinon.assert.calledWith(nativeBridge.UrlScheme.open, 'https://bar.com');
                        });
                    });
                    it('should open click through link on iOS', function () {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform_1.Platform.IOS);
                        sinon.stub(nativeBridge.UrlScheme, 'open');
                        sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
                        return vastEndScreenEventHandler.onVastEndScreenClick().then(function () {
                            sinon.assert.calledWith(nativeBridge.UrlScheme.open, 'https://foo.com');
                        });
                    });
                    it('should open click through link on Android', function () {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform_1.Platform.ANDROID);
                        sinon.stub(nativeBridge.Intent, 'launch');
                        sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
                        return vastEndScreenEventHandler.onVastEndScreenClick().then(function () {
                            sinon.assert.calledWith(nativeBridge.Intent.launch, {
                                'action': 'android.intent.action.VIEW',
                                'uri': 'https://foo.com'
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEVuZFNjcmVlbkV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWYXN0RW5kU2NyZWVuRXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBNEJBLFFBQVEsQ0FBQyxnQ0FBZ0MsRUFBRTtnQkFDdkMsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFNBQTBCLENBQUM7Z0JBQy9CLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxvQkFBMkMsQ0FBQztnQkFDaEQsSUFBSSxnQkFBa0MsQ0FBQztnQkFFdkMsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUM7d0JBQzVCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTtxQkFDakIsQ0FBQyxDQUFDO29CQUVILElBQU0sWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsSUFBTSxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUUxRCxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsbUNBQWdCLENBQUMsQ0FBQztvQkFDOUQsU0FBUyxHQUFHLElBQUksbUJBQVEsQ0FBQyxZQUFZLEVBQUUsMkJBQVksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7b0JBQzlGLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsWUFBWSxFQUFFLElBQUksNkJBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSwyQkFBWSxDQUFD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