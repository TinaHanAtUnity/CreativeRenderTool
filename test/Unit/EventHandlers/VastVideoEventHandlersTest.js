System.register(["mocha", "sinon", "chai", "EventHandlers/VastVideoEventHandler", "Native/NativeBridge", "Managers/ThirdPartyEventManager", "Managers/SessionManager", "Models/Placement", "Utilities/Request", "AdUnits/VastAdUnit", "Managers/WakeUpManager", "../TestHelpers/TestFixtures", "Views/Overlay", "Views/VastEndScreen", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "Managers/MetaDataManager", "Managers/FocusManager", "Views/MOAT", "Utilities/MoatViewabilityService", "Models/AndroidDeviceInfo", "Managers/OperativeEventManagerFactory", "AdUnits/VideoAdUnit", "Managers/GdprManager", "Views/Privacy", "xml/EventTestVast.xml", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, VastVideoEventHandler_1, NativeBridge_1, ThirdPartyEventManager_1, SessionManager_1, Placement_1, Request_1, VastAdUnit_1, WakeUpManager_1, TestFixtures_1, Overlay_1, VastEndScreen_1, AdUnitContainer_1, Activity_1, MetaDataManager_1, FocusManager_1, MOAT_1, MoatViewabilityService_1, AndroidDeviceInfo_1, OperativeEventManagerFactory_1, VideoAdUnit_1, GdprManager_1, Privacy_1, EventTestVast_xml_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (VastVideoEventHandler_1_1) {
                VastVideoEventHandler_1 = VastVideoEventHandler_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (VastAdUnit_1_1) {
                VastAdUnit_1 = VastAdUnit_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (VastEndScreen_1_1) {
                VastEndScreen_1 = VastEndScreen_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (MOAT_1_1) {
                MOAT_1 = MOAT_1_1;
            },
            function (MoatViewabilityService_1_1) {
                MoatViewabilityService_1 = MoatViewabilityService_1_1;
            },
            function (AndroidDeviceInfo_1_1) {
                AndroidDeviceInfo_1 = AndroidDeviceInfo_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            },
            function (VideoAdUnit_1_1) {
                VideoAdUnit_1 = VideoAdUnit_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            },
            function (EventTestVast_xml_1_1) {
                EventTestVast_xml_1 = EventTestVast_xml_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            },
            function (ForceQuitManager_1_1) {
                ForceQuitManager_1 = ForceQuitManager_1_1;
            }
        ],
        execute: function () {
            describe('VastVideoEventHandler tests', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var container;
                var campaign;
                var placement;
                var deviceInfo;
                var clientInfo;
                var overlay;
                var vastEndScreen;
                var wakeUpManager;
                var request;
                var thirdPartyEventManager;
                var sessionManager;
                var testAdUnit;
                var metaDataManager;
                var focusManager;
                var vastAdUnitParameters;
                var moat;
                var sandbox;
                var vastVideoEventHandler;
                var videoEventHandlerParams;
                var gdprManager;
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
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    campaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    privacy = new Privacy_1.Privacy(nativeBridge, true);
                    overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                    programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    placement = new Placement_1.Placement({
                        id: '123',
                        name: 'test',
                        default: true,
                        allowSkip: true,
                        skipInSeconds: 5,
                        disableBackButton: true,
                        useDeviceOrientationForVideo: false,
                        muteVideo: false
                    });
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
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
                    gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    vastAdUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: placement,
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
                    testAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                    sinon.spy(testAdUnit, 'hide');
                    moat = sinon.createStubInstance(MOAT_1.MOAT);
                    sandbox.stub(MoatViewabilityService_1.MoatViewabilityService, 'getMoat').returns(moat);
                    videoEventHandlerParams = {
                        nativeBrige: nativeBridge,
                        adUnit: testAdUnit,
                        campaign: campaign,
                        operativeEventManager: operativeEventManager,
                        thirdPartyEventManager: thirdPartyEventManager,
                        configuration: configuration,
                        placement: placement,
                        video: campaign.getVideo(),
                        adUnitStyle: undefined,
                        clientInfo: clientInfo
                    };
                    vastVideoEventHandler = new VastVideoEventHandler_1.VastVideoEventHandler(videoEventHandlerParams);
                });
                afterEach(function () {
                    sandbox.restore();
                });
                describe('onVideoPrepared', function () {
                    beforeEach(function () {
                        vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
                    });
                    it('initalizes moat', function () {
                        sinon.assert.called(moat.init);
                    });
                });
                describe('onVideoStart', function () {
                    it('sends start events from VAST', function () {
                        // given a VAST placement
                        // when the session manager is told that the video has started
                        // then the VAST start callback URL should be requested by the event manager
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
                        mockEventManager.expects('sendEvent').withArgs('vast impression', '12345', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=123');
                        mockEventManager.expects('sendEvent').withArgs('vast creativeView', '12345', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
                        vastVideoEventHandler.onPlay('https://test.com');
                        mockEventManager.verify();
                    });
                    it('sends start events from VAST and custom tracking URLs', function () {
                        // given a VAST placement
                        // when the session manager is told that the video has started
                        // then the VAST start callback URL should be requested by the event manager
                        var vastParser = TestFixtures_1.TestFixtures.getVastParser();
                        var vastXml = EventTestVast_xml_1.default;
                        var vast = vastParser.parseVast(vastXml);
                        var customTracking = {
                            'start': [
                                'http://customTrackingUrl/start',
                                'http://customTrackingUrl/start2',
                                'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=%SDK_VERSION%'
                            ]
                        };
                        var campaignWithTrackers = TestFixtures_1.TestFixtures.getEventVastCampaign();
                        campaignWithTrackers.getVast().set('additionalTrackingEvents', customTracking);
                        vastAdUnitParameters.campaign = campaignWithTrackers;
                        var adUnitWithTrackers = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        videoEventHandlerParams.adUnit = adUnitWithTrackers;
                        videoEventHandlerParams.campaign = vastAdUnitParameters.campaign;
                        vastVideoEventHandler = new VastVideoEventHandler_1.VastVideoEventHandler(videoEventHandlerParams);
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://customTrackingUrl/start');
                        mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://customTrackingUrl/start2');
                        mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://customTrackingUrl/start3/123/blah?sdkVersion=2000');
                        mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
                        mockEventManager.expects('sendEvent').withArgs('vast impression', '12345', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=123');
                        mockEventManager.expects('sendEvent').withArgs('vast creativeView', '12345', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
                        vastVideoEventHandler.onPlay('https://test.com');
                        mockEventManager.verify();
                    });
                    it('tiggers moat play event', function () {
                        vastVideoEventHandler.onPlay('https://test.com');
                        sinon.assert.called(moat.play);
                    });
                });
                describe('onVideoProgress', function () {
                    it('sends moat video progress event', function () {
                        vastVideoEventHandler.onProgress(1);
                        sinon.assert.called(moat.triggerVideoEvent);
                    });
                });
                describe('onVideoCompleted', function () {
                    it('sends complete events from VAST', function () {
                        // given a VAST placement
                        // when the session manager is told that the video has completed
                        // then the VAST complete callback URL should be requested by the event manager
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        var expectation = mockEventManager.expects('sendEvent').once();
                        vastVideoEventHandler.onCompleted('https://test.com');
                        mockEventManager.verify();
                        chai_1.assert.equal(expectation.getCall(0).args[0], 'vast complete', 'Second event sent should be \'vast complete\'');
                        chai_1.assert.equal(expectation.getCall(0).args[1], '12345', 'Second event session id should be 12345');
                        chai_1.assert.equal(expectation.getCall(0).args[2], 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123', 'Incorrect second event URL');
                    });
                    it('should hide ad unit', function () {
                        vastVideoEventHandler.onCompleted('https://test.com');
                        sinon.assert.called(testAdUnit.hide);
                    });
                    it('should trigger moat completed event', function () {
                        vastVideoEventHandler.onCompleted('https://test.com');
                        sinon.assert.called(moat.completed);
                    });
                });
                describe('onVideoStopped', function () {
                    beforeEach(function () {
                        vastVideoEventHandler.onStop('https://test.com');
                    });
                    it('should send moat stop event', function () {
                        sinon.assert.called(moat.stop);
                    });
                });
                describe('onVideoPaused', function () {
                    beforeEach(function () {
                        testAdUnit.setVolume(4);
                        vastVideoEventHandler.onPause('https://test.com');
                    });
                    it('should send moat pause event', function () {
                        sinon.assert.calledWith(moat.pause, 4);
                    });
                });
                describe('onVolumeChange', function () {
                    beforeEach(function () {
                        vastVideoEventHandler.onVolumeChange(1, 10);
                    });
                    it('should call moat volumeChange event', function () {
                        sinon.assert.calledWith(moat.volumeChange, 0.1);
                    });
                });
                describe('onVideoError', function () {
                    it('should hide ad unit', function () {
                        // Cause an error by giving too large duration
                        testAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);
                        sinon.assert.called(testAdUnit.hide);
                    });
                });
                describe('with companion ad', function () {
                    var vastAdUnit;
                    beforeEach(function () {
                        sandbox.restore();
                        vastEndScreen = new VastEndScreen_1.VastEndScreen(nativeBridge, vastAdUnitParameters.configuration.isCoppaCompliant(), vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
                        sinon.spy(vastEndScreen, 'show');
                        vastAdUnitParameters.endScreen = vastEndScreen;
                        vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        videoEventHandlerParams.adUnit = vastAdUnit;
                        vastVideoEventHandler = new VastVideoEventHandler_1.VastVideoEventHandler(videoEventHandlerParams);
                    });
                    it('should show end screen when onVideoCompleted', function () {
                        vastVideoEventHandler.onCompleted('https://test.com');
                        sinon.assert.called(vastEndScreen.show);
                        sinon.assert.notCalled(testAdUnit.hide);
                    });
                    it('should show end screen when onVideoError', function () {
                        // Cause an error by giving too large duration
                        vastAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);
                        sinon.assert.called(vastEndScreen.show);
                        sinon.assert.notCalled(testAdUnit.hide);
                    });
                });
                describe('sendImpressionEvent', function () {
                    it('should replace "%ZONE%" in the url with the placement id', function () {
                        var urlTemplate = 'http://foo.biz/%ZONE%/456';
                        sandbox.stub(campaign, 'getImpressionUrls').returns([urlTemplate]);
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        var expectation = mockEventManager.expects('sendEvent').thrice();
                        vastVideoEventHandler.onPlay('https://test.com');
                        mockEventManager.verify();
                        chai_1.assert.equal(expectation.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
                        chai_1.assert.equal(expectation.getCall(0).args[2], 'http://foo.biz/' + placement.getId() + '/456', 'First event url incorrect');
                    });
                    it('should replace "%SDK_VERSION%" in the url with the SDK version', function () {
                        var urlTemplate = 'http://foo.biz/%SDK_VERSION%/456';
                        sandbox.stub(campaign, 'getImpressionUrls').returns([urlTemplate]);
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        var expectation = mockEventManager.expects('sendEvent').thrice();
                        vastVideoEventHandler.onPlay('https://test.com');
                        mockEventManager.verify();
                        chai_1.assert.equal(expectation.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
                        chai_1.assert.equal(expectation.getCall(0).args[2], 'http://foo.biz/2000/456', 'First event url incorrect');
                    });
                    it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', function () {
                        var urlTemplate = 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%';
                        sandbox.stub(campaign, 'getImpressionUrls').returns([urlTemplate]);
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        var expectation = mockEventManager.expects('sendEvent').thrice();
                        vastVideoEventHandler.onPlay('https://test.com');
                        mockEventManager.verify();
                        chai_1.assert.equal(expectation.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
                        chai_1.assert.equal(expectation.getCall(0).args[2], 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=2000', 'First event url incorrect');
                    });
                    it('should replace both "%ZONE%" and "%SDK_VERSION%" in the url with corresponding parameters', function () {
                        var urlTemplate = 'http://foo.biz/%ZONE%/%SDK_VERSION%/456';
                        sandbox.stub(campaign, 'getImpressionUrls').returns([urlTemplate]);
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        var expectation = mockEventManager.expects('sendEvent').thrice();
                        vastVideoEventHandler.onPlay('https://test.com');
                        mockEventManager.verify();
                        chai_1.assert.equal(expectation.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
                        chai_1.assert.equal(expectation.getCall(0).args[2], 'http://foo.biz/' + placement.getId() + '/2000/456', 'First event url incorrect');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFZpZGVvRXZlbnRIYW5kbGVyc1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWYXN0VmlkZW9FdmVudEhhbmRsZXJzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBcUNBLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRTtnQkFDcEMsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFNBQTBCLENBQUM7Z0JBQy9CLElBQUksUUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxTQUFvQixDQUFDO2dCQUN6QixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksYUFBNEIsQ0FBQztnQkFDakMsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLHNCQUE4QyxDQUFDO2dCQUNuRCxJQUFJLGNBQThCLENBQUM7Z0JBQ25DLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxlQUFnQyxDQUFDO2dCQUNyQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksb0JBQTJDLENBQUM7Z0JBQ2hELElBQUksSUFBVSxDQUFDO2dCQUNmLElBQUksT0FBMkIsQ0FBQztnQkFDaEMsSUFBSSxxQkFBNEMsQ0FBQztnQkFDakQsSUFBSSx1QkFBaUQsQ0FBQztnQkFDdEQsSUFBSSxXQUF3QixDQUFDO2dCQUM3QixJQUFJLE9BQXdCLENBQUM7Z0JBQzdCLElBQUksMkJBQXdELENBQUM7Z0JBQzdELElBQUksZ0JBQWtD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