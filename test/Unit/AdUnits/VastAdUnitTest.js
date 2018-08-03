System.register(["mocha", "chai", "sinon", "AdUnits/VastAdUnit", "Models/Vast/VastCreativeCompanionAd", "Views/Overlay", "Managers/ThirdPartyEventManager", "../TestHelpers/TestFixtures", "Utilities/Request", "Managers/WakeUpManager", "Models/Placement", "Constants/Platform", "Views/VastEndScreen", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "Models/Assets/Video", "Managers/FocusManager", "Managers/SessionManager", "Managers/MetaDataManager", "xml/EventTestVast.xml", "Managers/OperativeEventManagerFactory", "Managers/GdprManager", "Views/Privacy", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, VastAdUnit_1, VastCreativeCompanionAd_1, Overlay_1, ThirdPartyEventManager_1, TestFixtures_1, Request_1, WakeUpManager_1, Placement_1, Platform_1, VastEndScreen_1, AdUnitContainer_1, Activity_1, Video_1, FocusManager_1, SessionManager_1, MetaDataManager_1, EventTestVast_xml_1, OperativeEventManagerFactory_1, GdprManager_1, Privacy_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (VastAdUnit_1_1) {
                VastAdUnit_1 = VastAdUnit_1_1;
            },
            function (VastCreativeCompanionAd_1_1) {
                VastCreativeCompanionAd_1 = VastCreativeCompanionAd_1_1;
            },
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
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
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
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
            function (Video_1_1) {
                Video_1 = Video_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
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
            describe('VastAdUnit', function () {
                var sandbox;
                var thirdPartyEventManager;
                var vastAdUnit;
                var focusManager;
                var vastAdUnitParameters;
                var deviceInfo;
                var clientInfo;
                var placement;
                var vastCampaign;
                var forceQuitManager;
                before(function () {
                    sandbox = sinon.sandbox.create();
                });
                beforeEach(function () {
                    var vastParser = TestFixtures_1.TestFixtures.getVastParser();
                    var vastXml = EventTestVast_xml_1.default;
                    var vast = vastParser.parseVast(vastXml);
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
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    var nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    var request = new Request_1.Request(nativeBridge, wakeUpManager);
                    var activity = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    vastCampaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                    var video = vastCampaign.getVideo();
                    var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    var duration = vastCampaign.getVast().getDuration();
                    if (duration) {
                        duration = duration * 1000;
                        video.setDuration(duration);
                    }
                    var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    var operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: configuration,
                        campaign: vastCampaign
                    });
                    var privacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                    var overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                    var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    vastAdUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: focusManager,
                        container: activity,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: placement,
                        campaign: vastCampaign,
                        configuration: configuration,
                        request: request,
                        options: {},
                        endScreen: undefined,
                        overlay: overlay,
                        video: video,
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    };
                    vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                });
                afterEach(function () { return sandbox.restore(); });
                describe('with click through url', function () {
                    beforeEach(function () {
                        var video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                        vastCampaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                        sinon.stub(vastCampaign, 'getVideo').returns(video);
                        var nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                        var privacy = new Privacy_1.Privacy(nativeBridge, false);
                        var overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                        vastAdUnitParameters.overlay = overlay;
                        vastAdUnitParameters.campaign = vastCampaign;
                        vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                    });
                    it('should return correct http:// url', function () {
                        sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('http://www.example.com/wpstyle/?p=364');
                        var clickThroughURL = vastAdUnit.getVideoClickThroughURL();
                        chai_1.assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
                    });
                    it('should return correct https:// url', function () {
                        sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('https://www.example.com/foo/?bar=baz&inga=42&quux');
                        var clickThroughURL = vastAdUnit.getVideoClickThroughURL();
                        chai_1.assert.equal(clickThroughURL, 'https://www.example.com/foo/?bar=baz&inga=42&quux');
                    });
                    it('should return null for malformed url', function () {
                        sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('www.foo.com');
                        var clickThroughURL = vastAdUnit.getVideoClickThroughURL();
                        chai_1.assert.equal(clickThroughURL, null);
                    });
                    it('should return null for a deeplink to an app', function () {
                        sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('myapp://details?id=foo');
                        var clickThroughURL = vastAdUnit.getVideoClickThroughURL();
                        chai_1.assert.equal(clickThroughURL, null);
                    });
                    it('should call video click tracking url', function () {
                        sandbox.stub(vastCampaign.getVast(), 'getVideoClickTrackingURLs').returns(['https://www.example.com/foo/?bar=baz&inga=42&quux', 'http://wwww.tremor.com/click']);
                        sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
                        vastAdUnit.sendVideoClickTrackingEvent('foo');
                        sinon.assert.calledTwice(thirdPartyEventManager.sendEvent);
                    });
                    it('should not call thirdPartyEvent if there are no tracking urls', function () {
                        sandbox.stub(vastCampaign.getVast(), 'getVideoClickTrackingURLs').returns([]);
                        sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
                        vastAdUnit.sendVideoClickTrackingEvent('foo');
                        sinon.assert.notCalled(thirdPartyEventManager.sendEvent);
                    });
                });
                describe('VastAdUnit progress event test', function () {
                    it('sends video click through tracking event from VAST', function () {
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        mockEventManager.expects('sendEvent').withArgs('vast video click', '123', 'http://myTrackingURL.com/click');
                        vastAdUnit.sendVideoClickTrackingEvent('123');
                        mockEventManager.verify();
                    });
                });
                describe('with companion ad', function () {
                    var vastEndScreen;
                    beforeEach(function () {
                        var video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                        vastCampaign = TestFixtures_1.TestFixtures.getCompanionVastCampaign();
                        sinon.stub(vastCampaign, 'getVideo').returns(video);
                        var nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                        var privacy = new Privacy_1.Privacy(nativeBridge, false);
                        var overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                        vastEndScreen = new VastEndScreen_1.VastEndScreen(nativeBridge, vastAdUnitParameters.configuration.isCoppaCompliant(), vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
                        vastAdUnitParameters.overlay = overlay;
                        vastAdUnitParameters.campaign = vastCampaign;
                        vastAdUnitParameters.endScreen = vastEndScreen;
                        vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                    });
                    it('should return correct companion click through url', function () {
                        sandbox.stub(vastCampaign.getVast(), 'getCompanionClickThroughUrl').returns('http://www.example.com/wpstyle/?p=364');
                        var clickThroughURL = vastAdUnit.getCompanionClickThroughUrl();
                        chai_1.assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
                    });
                    it('should return null when companion click through url is invalid', function () {
                        sandbox.stub(vastCampaign.getVast(), 'getCompanionClickThroughUrl').returns('blah');
                        var clickThroughURL = vastAdUnit.getCompanionClickThroughUrl();
                        chai_1.assert.equal(clickThroughURL, null);
                    });
                    it('should return endscreen', function () {
                        var endScreen = vastAdUnit.getEndScreen();
                        chai_1.assert.equal(endScreen, vastEndScreen);
                    });
                    it('it should fire companion tracking events', function () {
                        var width = 320;
                        var height = 480;
                        var url = 'http://example.com/companionCreativeView';
                        var companion = new VastCreativeCompanionAd_1.VastCreativeCompanionAd('foobarCompanion', 'Creative', height, width, 'http://example.com/img.png', 'http://example.com/clickme', {
                            'creativeView': [url]
                        });
                        sandbox.stub(vastCampaign.getVast(), 'getLandscapeOrientedCompanionAd').returns(companion);
                        sandbox.stub(vastCampaign.getVast(), 'getPortraitOrientedCompanionAd').returns(companion);
                        var mockEventManager = sinon.mock(thirdPartyEventManager);
                        mockEventManager.expects('sendEvent').withArgs('companion', '123', companion.getEventTrackingUrls('creativeView')[0]);
                        vastAdUnit.sendCompanionTrackingEvent('123');
                        mockEventManager.verify();
                    });
                    it('should hide and then remove endscreen on hide', function () {
                        sinon.stub(vastEndScreen, 'hide');
                        sinon.stub(vastEndScreen, 'remove');
                        vastAdUnit.hide();
                        return new Promise(function (resolve, reject) {
                            setTimeout(resolve, 500);
                        }).then(function () {
                            sinon.assert.called(vastEndScreen.hide);
                            sinon.assert.called(vastEndScreen.remove);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVW5pdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWYXN0QWRVbml0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBK0JBLFFBQVEsQ0FBQyxZQUFZLEVBQUU7Z0JBRW5CLElBQUksT0FBMkIsQ0FBQztnQkFDaEMsSUFBSSxzQkFBOEMsQ0FBQztnQkFDbkQsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksb0JBQTJDLENBQUM7Z0JBQ2hELElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLFNBQW9CLENBQUM7Z0JBQ3pCLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxnQkFBa0MsQ0FBQztnQkFFdkMsTUFBTSxDQUFDO29CQUNILE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxVQUFVLENBQUM7b0JBQ1AsSUFBTSxVQUFVLEdBQUcsMkJBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFFaEQsSUFBTSxPQUFPLEdBQUcsMkJBQWEsQ0FBQztvQkFFOUIsSUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFM0MsU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FBQzt3QkFDdEIsRUFBRSxFQUFFLEtBQUs7d0JBQ1QsSUFBSSxFQUFFLE1BQU07d0JBQ1osT0FBTyxFQUFFLElBQUk7d0JBQ2IsU0FBUyxFQUFFLElBQUk7d0JBQ2YsYUFBYSxFQUFFLENBQUM7d0JBQ2hCLGlCQUFpQixFQUFFLElBQUk7d0JBQ3ZCLDRCQUE0QixFQUFFLEtBQUs7d0JBQ25DLFNBQVMsRUFBRSxL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