System.register(["mocha", "sinon", "Native/NativeBridge", "Views/Overlay", "Managers/SessionManager", "../TestHelpers/TestFixtures", "Managers/ThirdPartyEventManager", "Utilities/Request", "Managers/WakeUpManager", "AdUnits/PerformanceAdUnit", "Constants/Platform", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "AdUnits/Containers/ViewController", "Models/Campaigns/PerformanceCampaign", "Managers/MetaDataManager", "Models/Assets/Video", "Managers/FocusManager", "EventHandlers/PerformanceEndScreenEventHandler", "Views/PerformanceEndScreen", "Managers/OperativeEventManagerFactory", "Views/Privacy", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, NativeBridge_1, Overlay_1, SessionManager_1, TestFixtures_1, ThirdPartyEventManager_1, Request_1, WakeUpManager_1, PerformanceAdUnit_1, Platform_1, AdUnitContainer_1, Activity_1, ViewController_1, PerformanceCampaign_1, MetaDataManager_1, Video_1, FocusManager_1, PerformanceEndScreenEventHandler_1, PerformanceEndScreen_1, OperativeEventManagerFactory_1, Privacy_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (PerformanceAdUnit_1_1) {
                PerformanceAdUnit_1 = PerformanceAdUnit_1_1;
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
            function (PerformanceCampaign_1_1) {
                PerformanceCampaign_1 = PerformanceCampaign_1_1;
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
            function (PerformanceEndScreenEventHandler_1_1) {
                PerformanceEndScreenEventHandler_1 = PerformanceEndScreenEventHandler_1_1;
            },
            function (PerformanceEndScreen_1_1) {
                PerformanceEndScreen_1 = PerformanceEndScreen_1_1;
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
            describe('EndScreenEventHandlerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, container, overlay, endScreen;
                var sessionManager;
                var performanceAdUnit;
                var metaDataManager;
                var focusManager;
                var operativeEventManager;
                var deviceInfo;
                var clientInfo;
                var thirdPartyEventManager;
                var performanceAdUnitParameters;
                var endScreenEventHandler;
                var campaign;
                var placement;
                var configuration;
                var forceQuitManager;
                describe('with onDownloadAndroid', function () {
                    var resolvedPromise;
                    beforeEach(function () {
                        nativeBridge = new NativeBridge_1.NativeBridge({
                            handleInvocation: handleInvocation,
                            handleCallback: handleCallback
                        }, Platform_1.Platform.ANDROID);
                        campaign = TestFixtures_1.TestFixtures.getCampaign();
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
                        configuration = TestFixtures_1.TestFixtures.getConfiguration();
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
                        sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
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
                            targetGameName: TestFixtures_1.TestFixtures.getCampaign().getGameName()
                        };
                        endScreen = new PerformanceEndScreen_1.PerformanceEndScreen(endScreenParams, TestFixtures_1.TestFixtures.getCampaign());
                        overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                        placement = TestFixtures_1.TestFixtures.getPlacement();
                        var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                        var programmticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        performanceAdUnitParameters = {
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
                            programmaticTrackingService: programmticTrackingService
                        };
                        performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                        endScreenEventHandler = new PerformanceEndScreenEventHandler_1.PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                    });
                    it('should send a click with session manager', function () {
                        endScreenEventHandler.onEndScreenDownload({
                            appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                            bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                            store: performanceAdUnitParameters.campaign.getStore(),
                            clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                            clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                        });
                        var params = { placement: placement,
                            videoOrientation: 'landscape',
                            adUnitStyle: undefined,
                            asset: performanceAdUnit.getVideo()
                        };
                        sinon.assert.calledWith(operativeEventManager.sendClick, params);
                    });
                    describe('with follow redirects', function () {
                        it('with response that contains location, it should launch intent', function () {
                            performanceAdUnitParameters.campaign = TestFixtures_1.TestFixtures.getCampaignFollowsRedirects();
                            performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                            sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                                url: 'http://foo.url.com',
                                response: 'foo response',
                                responseCode: 200,
                                headers: [['location', 'market://foobar.com']]
                            }));
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                            });
                            return resolvedPromise.then(function () {
                                sinon.assert.calledWith(nativeBridge.Intent.launch, {
                                    'action': 'android.intent.action.VIEW',
                                    'uri': 'market://foobar.com'
                                });
                            });
                        });
                        it('with APK download link and API is greater than or equal to 21, it should launch web search intent', function () {
                            performanceAdUnitParameters.campaign = TestFixtures_1.TestFixtures.getCampaignFollowsRedirects();
                            performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                            sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                                url: 'http://foo.url.com',
                                response: 'foo response',
                                responseCode: 200
                            }));
                            sinon.stub(nativeBridge, 'getApiLevel').returns(21);
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: true,
                                clickAttributionUrl: 'https://blah.com?apk_download_link=https://cdn.apk.com'
                            });
                            return resolvedPromise.then(function () {
                                sinon.assert.calledWith(nativeBridge.Intent.launch, {
                                    'action': 'android.intent.action.WEB_SEARCH',
                                    'extras': [{ key: 'query', value: 'https://cdn.apk.com' }]
                                });
                            });
                        });
                        it('with APK download link and API is less than 21, it should launch view intent', function () {
                            performanceAdUnitParameters.campaign = TestFixtures_1.TestFixtures.getCampaignFollowsRedirects();
                            performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                            sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                                url: 'http://foo.url.com',
                                response: 'foo response',
                                responseCode: 200
                            }));
                            sinon.stub(nativeBridge, 'getApiLevel').returns(20);
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: true,
                                clickAttributionUrl: 'https://blah.com?apk_download_link=https://cdn.apk.com'
                            });
                            return resolvedPromise.then(function () {
                                sinon.assert.calledWith(nativeBridge.Intent.launch, {
                                    'action': 'android.intent.action.VIEW',
                                    'uri': 'https://cdn.apk.com'
                                });
                            });
                        });
                        it('with response that does not contain location, it should not launch intent', function () {
                            performanceAdUnitParameters.campaign = TestFixtures_1.TestFixtures.getCampaignFollowsRedirects();
                            performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                            var response = TestFixtures_1.TestFixtures.getOkNativeResponse();
                            response.headers = [];
                            resolvedPromise = Promise.resolve(response);
                            operativeEventManager.sendClick.restore();
                            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                            });
                            return resolvedPromise.then(function () {
                                sinon.assert.notCalled(nativeBridge.Intent.launch);
                            });
                        });
                    });
                    describe('with no follow redirects', function () {
                        beforeEach(function () {
                            sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                            sinon.stub(campaign, 'getStore').returns(PerformanceCampaign_1.StoreName.GOOGLE);
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                            });
                        });
                        it('should send a click with session manager', function () {
                            var params = { placement: placement,
                                videoOrientation: 'landscape',
                                adUnitStyle: undefined,
                                asset: performanceAdUnit.getVideo()
                            };
                            sinon.assert.calledWith(operativeEventManager.sendClick, params);
                        });
                        it('should launch market view', function () {
                            sinon.assert.calledWith(nativeBridge.Intent.launch, {
                                'action': 'android.intent.action.VIEW',
                                'uri': 'market://details?id=com.iUnity.angryBots'
                            });
                        });
                    });
                });
                describe('with onDownloadIos', function () {
                    var resolvedPromise;
                    beforeEach(function () {
                        nativeBridge = new NativeBridge_1.NativeBridge({
                            handleInvocation: handleInvocation,
                            handleCallback: handleCallback
                        }, Platform_1.Platform.IOS);
                        container = new ViewController_1.ViewController(nativeBridge, TestFixtures_1.TestFixtures.getIosDeviceInfo(), focusManager, clientInfo, forceQuitManager);
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        var request = new Request_1.Request(nativeBridge, wakeUpManager);
                        clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.IOS);
                        deviceInfo = TestFixtures_1.TestFixtures.getIosDeviceInfo();
                        thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                        sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                        resolvedPromise = Promise.resolve(TestFixtures_1.TestFixtures.getOkNativeResponse());
                        sinon.spy(nativeBridge.UrlScheme, 'open');
                        var video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                        campaign = TestFixtures_1.TestFixtures.getCampaign();
                        campaign.set('store', PerformanceCampaign_1.StoreName.APPLE);
                        campaign.set('appStoreId', '11111');
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
                        sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
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
                        endScreen = new PerformanceEndScreen_1.PerformanceEndScreen(endScreenParams, campaign);
                        overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                        var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                        var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        performanceAdUnitParameters = {
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
                        performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                        endScreenEventHandler = new PerformanceEndScreenEventHandler_1.PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                    });
                    it('should send a click with session manager', function () {
                        sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                        performanceAdUnitParameters.deviceInfo = deviceInfo;
                        performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                        endScreenEventHandler = new PerformanceEndScreenEventHandler_1.PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                        endScreenEventHandler.onEndScreenDownload({
                            appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                            bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                            store: performanceAdUnitParameters.campaign.getStore(),
                            clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                            clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                        });
                        var params = { placement: placement,
                            videoOrientation: 'landscape',
                            adUnitStyle: undefined,
                            asset: performanceAdUnit.getVideo()
                        };
                        sinon.assert.calledWith(operativeEventManager.sendClick, params);
                    });
                    describe('with follow redirects', function () {
                        it('with response that contains location, it should open url scheme', function () {
                            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                            performanceAdUnitParameters.deviceInfo = deviceInfo;
                            performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                            endScreenEventHandler = new PerformanceEndScreenEventHandler_1.PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                            campaign = TestFixtures_1.TestFixtures.getCampaignFollowsRedirects();
                            campaign.set('store', PerformanceCampaign_1.StoreName.APPLE);
                            performanceAdUnitParameters.campaign = TestFixtures_1.TestFixtures.getCampaignFollowsRedirects();
                            sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                                url: 'http://foo.url.com',
                                response: 'foo response',
                                responseCode: 200,
                                headers: [['location', 'appstore://foobar.com']]
                            }));
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                            });
                            return resolvedPromise.then(function () {
                                sinon.assert.calledWith(nativeBridge.UrlScheme.open, 'appstore://foobar.com');
                            });
                        });
                        it('with response that does not contain location, it should not call open', function () {
                            var response = TestFixtures_1.TestFixtures.getOkNativeResponse();
                            response.headers = [];
                            resolvedPromise = Promise.resolve(response);
                            operativeEventManager.sendClick.restore();
                            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                            });
                            return resolvedPromise.then(function () {
                                sinon.assert.notCalled(nativeBridge.UrlScheme.open);
                            });
                        });
                    });
                    describe('with no follow redirects and OS version 8.1', function () {
                        beforeEach(function () {
                            sinon.stub(deviceInfo, 'getOsVersion').returns('8.1');
                            campaign = TestFixtures_1.TestFixtures.getCampaign();
                            campaign.set('store', PerformanceCampaign_1.StoreName.APPLE);
                            campaign.set('appStoreId', '11111');
                            sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                            sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                            sinon.stub(campaign, 'getStore').returns(PerformanceCampaign_1.StoreName.APPLE);
                            performanceAdUnitParameters.deviceInfo = deviceInfo;
                            performanceAdUnitParameters.campaign = campaign;
                            performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                            endScreenEventHandler = new PerformanceEndScreenEventHandler_1.PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                            });
                        });
                        it('should launch app store view', function () {
                            sinon.assert.called(nativeBridge.UrlScheme.open);
                            sinon.assert.calledWith(nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
                        });
                    });
                    describe('with no follow redirects and bypass app sheet', function () {
                        beforeEach(function () {
                            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                            campaign = TestFixtures_1.TestFixtures.getCampaign();
                            campaign.set('store', PerformanceCampaign_1.StoreName.APPLE);
                            campaign.set('appStoreId', '11111');
                            sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                            sinon.stub(campaign, 'getBypassAppSheet').returns(true);
                            sinon.stub(campaign, 'getStore').returns(PerformanceCampaign_1.StoreName.APPLE);
                            performanceAdUnitParameters.deviceInfo = deviceInfo;
                            performanceAdUnitParameters.campaign = campaign;
                            performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                            endScreenEventHandler = new PerformanceEndScreenEventHandler_1.PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                            });
                        });
                        it('should launch app store view', function () {
                            sinon.assert.calledWith(nativeBridge.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
                        });
                    });
                    describe('open app sheet', function () {
                        beforeEach(function () {
                            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                            performanceAdUnitParameters.deviceInfo = deviceInfo;
                            performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                            endScreenEventHandler = new PerformanceEndScreenEventHandler_1.PerformanceEndScreenEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                            sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                            sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                            sinon.stub(nativeBridge.AppSheet, 'canOpen').returns(Promise.resolve(true));
                            endScreenEventHandler.onEndScreenDownload({
                                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                                store: performanceAdUnitParameters.campaign.getStore(),
                                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                            });
                        });
                        it('should open app sheet', function () {
                            var resolved = Promise.resolve();
                            sinon.stub(nativeBridge.AppSheet, 'present').returns(resolved);
                            sinon.spy(nativeBridge.AppSheet, 'destroy');
                            return new Promise(function (resolve, reject) { return setTimeout(resolve, 500); }).then(function () {
                                sinon.assert.calledWith(nativeBridge.AppSheet.present, { id: 11111 });
                                sinon.assert.called(nativeBridge.AppSheet.destroy);
                            });
                        });
                        it('should send a click with session manager', function () {
                            var params = { placement: placement,
                                videoOrientation: 'landscape',
                                adUnitStyle: undefined,
                                asset: performanceAdUnit.getVideo()
                            };
                            sinon.assert.calledWith(operativeEventManager.sendClick, params);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW5kU2NyZWVuRXZlbnRIYW5kbGVyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkVuZFNjcmVlbkV2ZW50SGFuZGxlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWtDQSxRQUFRLENBQUMsMkJBQTJCLEVBQUU7Z0JBRWxDLElBQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ25DLElBQUksWUFBMEIsRUFBRSxTQUEwQixFQUFFLE9BQWdCLEVBQUUsU0FBK0IsQ0FBQztnQkFDOUcsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLGlCQUFvQyxDQUFDO2dCQUN6QyxJQUFJLGVBQWdDLENBQUM7Z0JBQ3JDLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxxQkFBNEMsQ0FBQztnQkFDakQsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksc0JBQThDLENBQUM7Z0JBQ25ELElBQUksMkJBQXlELENBQUM7Z0JBQzlELElBQUkscUJBQXVELENBQUM7Z0JBQzVELElBQUksUUFBNkIsQ0FBQztnQkFDbEMsSUFBSSxTQUFvQixDQUFDO2dCQUN6QixJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksZ0JBQWtDLENBQUM7Z0JBRXZDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRTtvQkFDL0IsSUFBSSxlQUF5QyxDQUFDO29CQUU5QyxVQUFVLENBQUM7d0JBQ1AsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQzs0QkFDNUIsZ0JBQWdCLGtCQUFBOzRCQUNoQixjQUFjLGdCQUFBO3lCQUNqQixFQUFFLG1CQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7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