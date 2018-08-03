System.register(["mocha", "sinon", "Native/NativeBridge", "Managers/SessionManager", "EventHandlers/VastOverlayEventHandler", "../TestHelpers/TestFixtures", "Views/Overlay", "Managers/ThirdPartyEventManager", "Managers/WakeUpManager", "Constants/Platform", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "AdUnits/VastAdUnit", "Views/VastEndScreen", "Managers/MetaDataManager", "Managers/FocusManager", "Utilities/Request", "Views/MOAT", "Utilities/MoatViewabilityService", "Managers/OperativeEventManagerFactory", "Managers/GdprManager", "Views/Privacy", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, NativeBridge_1, SessionManager_1, VastOverlayEventHandler_1, TestFixtures_1, Overlay_1, ThirdPartyEventManager_1, WakeUpManager_1, Platform_1, AdUnitContainer_1, Activity_1, VastAdUnit_1, VastEndScreen_1, MetaDataManager_1, FocusManager_1, Request_1, MOAT_1, MoatViewabilityService_1, OperativeEventManagerFactory_1, GdprManager_1, Privacy_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (VastOverlayEventHandler_1_1) {
                VastOverlayEventHandler_1 = VastOverlayEventHandler_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (VastAdUnit_1_1) {
                VastAdUnit_1 = VastAdUnit_1_1;
            },
            function (VastEndScreen_1_1) {
                VastEndScreen_1 = VastEndScreen_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (MOAT_1_1) {
                MOAT_1 = MOAT_1_1;
            },
            function (MoatViewabilityService_1_1) {
                MoatViewabilityService_1 = MoatViewabilityService_1_1;
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
            describe('VastOverlayEventHandlersTest', function () {
                var campaign;
                var overlay;
                var metaDataManager;
                var focusManager;
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var vastAdUnit;
                var container;
                var sessionManager;
                var deviceInfo;
                var clientInfo;
                var thirdPartyEventManager;
                var request;
                var vastAdUnitParameters;
                var vastOverlayEventHandler;
                var moat;
                var sandbox;
                var privacy;
                var programmaticTrackingService;
                var forceQuitManager;
                before(function () {
                    sandbox = sinon.sandbox.create();
                });
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    campaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    privacy = new Privacy_1.Privacy(nativeBridge, true);
                    overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, new FocusManager_1.FocusManager(nativeBridge)));
                    sinon.stub(request, 'followRedirectChain').callsFake(function (url) {
                        return Promise.resolve(url);
                    });
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
                    var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
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
                        video: campaign.getVideo(),
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    };
                    vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                    vastOverlayEventHandler = new VastOverlayEventHandler_1.VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
                    moat = sinon.createStubInstance(MOAT_1.MOAT);
                    sandbox.stub(MoatViewabilityService_1.MoatViewabilityService, 'getMoat').returns(moat);
                });
                afterEach(function () {
                    sandbox.restore();
                });
                describe('When calling onSkip', function () {
                    beforeEach(function () {
                        sinon.spy(vastAdUnit, 'hide');
                    });
                    it('should hide ad unit', function () {
                        vastOverlayEventHandler.onOverlaySkip(1);
                        sinon.assert.called(vastAdUnit.hide);
                    });
                    describe('When ad unit has an endscreen', function () {
                        it('should hide endcard', function () {
                            var vastEndScreen = new VastEndScreen_1.VastEndScreen(nativeBridge, vastAdUnitParameters.configuration.isCoppaCompliant(), vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
                            sinon.spy(vastEndScreen, 'show');
                            vastAdUnitParameters.endScreen = vastEndScreen;
                            vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                            sinon.spy(vastAdUnit, 'hide');
                            vastOverlayEventHandler = new VastOverlayEventHandler_1.VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
                            vastOverlayEventHandler.onOverlaySkip(1);
                            sinon.assert.called(vastEndScreen.show);
                        });
                    });
                });
                describe('When calling onMute', function () {
                    beforeEach(function () {
                        vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        vastOverlayEventHandler = new VastOverlayEventHandler_1.VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
                    });
                    var testMuteEvent = function (muted) {
                        var eventName = muted ? 'mute' : 'unmute';
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        mockEventManager.expects('sendEvent').withArgs("vast " + eventName, '12345', "http://localhost:3500/brands/14851/" + eventName + "?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%");
                        vastOverlayEventHandler.onOverlayMute(muted);
                        mockEventManager.verify();
                    };
                    it('sends mute events from VAST', function () {
                        // given a VAST placement
                        // when the session manager is told that the video has been muted
                        // then the VAST mute callback URL should be requested by the event manager
                        testMuteEvent(true);
                    });
                    it('sends unmute events from VAST', function () {
                        // given a VAST placement
                        // when the session manager is told that the video has been unmuted
                        // then the VAST unmute callback URL should be requested by the event manager
                        testMuteEvent(false);
                    });
                    it('should call volumeChange when mute is true', function () {
                        vastOverlayEventHandler.onOverlayMute(true);
                        sinon.assert.called(moat.volumeChange);
                    });
                    it('should call play when mute is false', function () {
                        vastOverlayEventHandler.onOverlayMute(false);
                        sinon.assert.called(moat.volumeChange);
                    });
                });
                describe('When calling onCallButton', function () {
                    beforeEach(function () {
                        vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        vastOverlayEventHandler = new VastOverlayEventHandler_1.VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
                        sinon.spy(nativeBridge.VideoPlayer, 'pause');
                        sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
                        sinon.stub(vastAdUnit, 'sendVideoClickTrackingEvent').returns(sinon.spy());
                    });
                    it('should call video click through tracking url', function () {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform_1.Platform.IOS);
                        sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
                        vastOverlayEventHandler.onOverlayCallButton().then(function () {
                            sinon.assert.calledOnce(vastAdUnit.sendVideoClickTrackingEvent);
                        });
                    });
                    it('should open click trough link in iOS web browser when call button is clicked', function () {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform_1.Platform.IOS);
                        sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
                        vastOverlayEventHandler.onOverlayCallButton().then(function () {
                            sinon.assert.calledWith(nativeBridge.UrlScheme.open, 'http://foo.com');
                        });
                    });
                    it('should open click trough link in Android web browser when call button is clicked', function () {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform_1.Platform.ANDROID);
                        sinon.stub(nativeBridge.Intent, 'launch').resolves();
                        vastOverlayEventHandler.onOverlayCallButton().then(function () {
                            sinon.assert.calledWith(nativeBridge.Intent.launch, {
                                'action': 'android.intent.action.VIEW',
                                'uri': 'http://foo.com'
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE92ZXJsYXlFdmVudEhhbmRsZXJzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlZhc3RPdmVybGF5RXZlbnRIYW5kbGVyc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWdDQSxRQUFRLENBQUMsOEJBQThCLEVBQUU7Z0JBQ3JDLElBQUksUUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLGVBQWdDLENBQUM7Z0JBQ3JDLElBQUksWUFBMEIsQ0FBQztnQkFFL0IsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksU0FBMEIsQ0FBQztnQkFDL0IsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxzQkFBOEMsQ0FBQztnQkFDbkQsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLG9CQUEyQyxDQUFDO2dCQUNoRCxJQUFJLHVCQUFnRCxDQUFDO2dCQUNyRCxJQUFJLElBQVUsQ0FBQztnQkFDZixJQUFJLE9BQTJCLENBQUM7Z0JBQ2hDLElBQUksT0FBd0IsQ0FBQztnQkFDN0IsSUFBSSwyQkFBd0QsQ0FBQztnQkFDN0QsSUFBSSxnQkFBa0MsQ0FBQztnQkFFdkMsTUFBTSxDQUFDO29CQUNILE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxVQUFVLENBQUM7b0JBQ1AsWUFBWSxH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