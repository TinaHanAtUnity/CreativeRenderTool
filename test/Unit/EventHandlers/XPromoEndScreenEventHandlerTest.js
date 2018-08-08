System.register(["mocha", "sinon", "Native/NativeBridge", "Views/Overlay", "Managers/SessionManager", "../TestHelpers/TestFixtures", "Managers/ThirdPartyEventManager", "Utilities/Request", "Managers/WakeUpManager", "Constants/Platform", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "AdUnits/Containers/ViewController", "Models/Campaigns/XPromoCampaign", "Managers/MetaDataManager", "Models/Assets/Video", "Managers/FocusManager", "Views/XPromoEndScreen", "EventHandlers/XPromoEndScreenEventHandler", "AdUnits/XPromoAdUnit", "Managers/OperativeEventManagerFactory", "Views/Privacy", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, NativeBridge_1, Overlay_1, SessionManager_1, TestFixtures_1, ThirdPartyEventManager_1, Request_1, WakeUpManager_1, Platform_1, AdUnitContainer_1, Activity_1, ViewController_1, XPromoCampaign_1, MetaDataManager_1, Video_1, FocusManager_1, XPromoEndScreen_1, XPromoEndScreenEventHandler_1, XPromoAdUnit_1, OperativeEventManagerFactory_1, Privacy_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
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
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (ViewController_1_1) {
                ViewController_1 = ViewController_1_1;
            },
            function (XPromoCampaign_1_1) {
                XPromoCampaign_1 = XPromoCampaign_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (Video_1_1) {
                Video_1 = Video_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (XPromoEndScreen_1_1) {
                XPromoEndScreen_1 = XPromoEndScreen_1_1;
            },
            function (XPromoEndScreenEventHandler_1_1) {
                XPromoEndScreenEventHandler_1 = XPromoEndScreenEventHandler_1_1;
            },
            function (XPromoAdUnit_1_1) {
                XPromoAdUnit_1 = XPromoAdUnit_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
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
            describe('XPromoEndScreenEventHandlerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, container, overlay, endScreen;
                var sessionManager;
                var xPromoAdUnit;
                var metaDataManager;
                var focusManager;
                var operativeEventManager;
                var deviceInfo;
                var clientInfo;
                var thirdPartyEventManager;
                var xPromoAdUnitParameters;
                var endScreenEventHandler;
                var campaign;
                var placement;
                var programmaticTrackingService;
                var forceQuitManager;
                describe('with onDownloadAndroid', function () {
                    var resolvedPromise;
                    beforeEach(function () {
                        nativeBridge = new NativeBridge_1.NativeBridge({
                            handleInvocation: handleInvocation,
                            handleCallback: handleCallback
                        }, Platform_1.Platform.ANDROID);
                        campaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                        focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                        container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                        metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        var request = new Request_1.Request(nativeBridge, wakeUpManager);
                        clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                        deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                        thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                        sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                        var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: configuration,
                            campaign: campaign
                        });
                        resolvedPromise = Promise.resolve(TestFixtures_1.TestFixtures.getOkNativeResponse());
                        sinon.spy(operativeEventManager, 'sendClick');
                        sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);
                        sinon.spy(nativeBridge.Intent, 'launch');
                        var video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                        var privacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                        var endScreenParams = {
                            nativeBridge: nativeBridge,
                            language: deviceInfo.getLanguage(),
                            gameId: clientInfo.getGameId(),
                            privacy: privacy,
                            showGDPRBanner: false,
                            abGroup: configuration.getAbGroup(),
                            targetGameName: TestFixtures_1.TestFixtures.getXPromoCampaign().getGameName()
                        };
                        endScreen = new XPromoEndScreen_1.XPromoEndScreen(endScreenParams, TestFixtures_1.TestFixtures.getXPromoCampaign());
                        overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                        placement = TestFixtures_1.TestFixtures.getPlacement();
                        var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                        xPromoAdUnitParameters = {
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
                            endScreen: endScreen,
                            overlay: overlay,
                            video: video,
                            privacy: privacy,
                            gdprManager: gdprManager,
                            programmaticTrackingService: programmaticTrackingService
                        };
                        xPromoAdUnit = new XPromoAdUnit_1.XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
                        endScreenEventHandler = new XPromoEndScreenEventHandler_1.XPromoEndScreenEventHandler(nativeBridge, xPromoAdUnit, xPromoAdUnitParameters);
                    });
                    it('should send a click to HttpKafka', function () {
                        endScreenEventHandler.onEndScreenDownload({
                            appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                            bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                            store: xPromoAdUnitParameters.campaign.getStore(),
                            clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                            clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
                        });
                        var params = { placement: xPromoAdUnitParameters.placement,
                            videoOrientation: xPromoAdUnit.getVideoOrientation(), adUnitStyle: undefined, asset: undefined };
                        sinon.assert.called(operativeEventManager.sendClick);
                        sinon.assert.calledWith(operativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoclick.v1.json', 'click', params);
                    });
                });
                describe('with onDownloadIos', function () {
                    var resolvedPromise;
                    beforeEach(function () {
                        nativeBridge = new NativeBridge_1.NativeBridge({
                            handleInvocation: handleInvocation,
                            handleCallback: handleCallback
                        }, Platform_1.Platform.IOS);
                        campaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                        campaign.set('store', XPromoCampaign_1.StoreName.APPLE);
                        campaign.set('appStoreId', '11111');
                        clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.IOS);
                        container = new ViewController_1.ViewController(nativeBridge, TestFixtures_1.TestFixtures.getIosDeviceInfo(), focusManager, clientInfo, forceQuitManager);
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        var request = new Request_1.Request(nativeBridge, wakeUpManager);
                        deviceInfo = TestFixtures_1.TestFixtures.getIosDeviceInfo();
                        thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                        sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                        var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                        operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: configuration,
                            campaign: campaign
                        });
                        resolvedPromise = Promise.resolve(TestFixtures_1.TestFixtures.getOkNativeResponse());
                        sinon.spy(operativeEventManager, 'sendClick');
                        sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').returns(resolvedPromise);
                        sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                        var video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                        var privacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                        var endScreenParams = {
                            nativeBridge: nativeBridge,
                            language: deviceInfo.getLanguage(),
                            gameId: clientInfo.getGameId(),
                            privacy: privacy,
                            showGDPRBanner: false,
                            abGroup: configuration.getAbGroup(),
                            targetGameName: campaign.getGameName()
                        };
                        endScreen = new XPromoEndScreen_1.XPromoEndScreen(endScreenParams, campaign);
                        overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                        var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                        xPromoAdUnitParameters = {
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
                            endScreen: endScreen,
                            overlay: overlay,
                            video: video,
                            privacy: privacy,
                            gdprManager: gdprManager,
                            programmaticTrackingService: programmaticTrackingService
                        };
                        xPromoAdUnit = new XPromoAdUnit_1.XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
                        endScreenEventHandler = new XPromoEndScreenEventHandler_1.XPromoEndScreenEventHandler(nativeBridge, xPromoAdUnit, xPromoAdUnitParameters);
                    });
                    it('should send a click to HttpKafka', function () {
                        endScreenEventHandler.onEndScreenDownload({
                            appStoreId: xPromoAdUnitParameters.campaign.getAppStoreId(),
                            bypassAppSheet: xPromoAdUnitParameters.campaign.getBypassAppSheet(),
                            store: xPromoAdUnitParameters.campaign.getStore(),
                            clickAttributionUrlFollowsRedirects: xPromoAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                            clickAttributionUrl: xPromoAdUnitParameters.campaign.getClickAttributionUrl()
                        });
                        var params = { placement: xPromoAdUnitParameters.placement,
                            videoOrientation: xPromoAdUnit.getVideoOrientation(), adUnitStyle: undefined, asset: undefined };
                        sinon.assert.called(operativeEventManager.sendClick);
                        sinon.assert.calledWith(operativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoclick.v1.json', 'click', params);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vRW5kU2NyZWVuRXZlbnRIYW5kbGVyVGVzdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJYUHJvbW9FbmRTY3JlZW5FdmVudEhhbmRsZXJUZXN0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBa0NBLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRTtnQkFFeEMsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixFQUFFLFNBQTBCLEVBQUUsT0FBZ0IsRUFBRSxTQUEwQixDQUFDO2dCQUN6RyxJQUFJLGNBQThCLENBQUM7Z0JBQ25DLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxlQUFnQyxDQUFDO2dCQUNyQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUkscUJBQWtELENBQUM7Z0JBQ3ZELElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLHNCQUE4QyxDQUFDO2dCQUNuRCxJQUFJLHNCQUErQyxDQUFDO2dCQUNwRCxJQUFJLHFCQUFrRCxDQUFDO2dCQUN2RCxJQUFJLFFBQXdCLENBQUM7Z0JBQzdCLElBQUksU0FBb0IsQ0FBQztnQkFDekIsSUFBSSwyQkFBd0QsQ0FBQztnQkFDN0QsSUFBSSxnQkFBa0MsQ0FBQztnQkFFdkMsUUFBUSxDQUFDLHdCQUF3QixFQUFFO29CQUMvQixJQUFJLGVBQXlDLENBQUM7b0JBRTlDLFVBQVUsQ0FBQzt3QkFDUCxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDOzRCQUM1QixnQkFBZ0Isa0JBQUE7NEJBQ2hCLGNBQWMsZ0JBQUE7eUJBQ2pCLEVBQUUsbUJBQVEsQ0FBQyxP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