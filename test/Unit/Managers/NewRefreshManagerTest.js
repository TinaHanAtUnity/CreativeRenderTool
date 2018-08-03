System.register(["mocha", "chai", "sinon", "Managers/WakeUpManager", "Managers/CampaignManager", "Models/Configuration", "Managers/FocusManager", "Managers/ReinitManager", "Managers/PlacementManager", "../TestHelpers/TestFixtures", "Utilities/CacheBookkeeping", "Utilities/Request", "Utilities/Cache", "Managers/AssetManager", "Managers/SessionManager", "Managers/MetaDataManager", "AdMob/AdMobSignalFactory", "Managers/NewRefreshManager", "Test/Unit/TestHelpers/TestAdUnit", "AdUnits/Containers/AdUnitContainer", "Managers/ThirdPartyEventManager", "Managers/OperativeEventManager", "AdUnits/Containers/Activity", "Native/Api/Sdk", "Native/Api/Listener", "Jaeger/JaegerManager", "Jaeger/JaegerSpan", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, WakeUpManager_1, CampaignManager_1, Configuration_1, FocusManager_1, ReinitManager_1, PlacementManager_1, TestFixtures_1, CacheBookkeeping_1, Request_1, Cache_1, AssetManager_1, SessionManager_1, MetaDataManager_1, AdMobSignalFactory_1, NewRefreshManager_1, TestAdUnit_1, AdUnitContainer_1, ThirdPartyEventManager_1, OperativeEventManager_1, Activity_1, Sdk_1, Listener_1, JaegerManager_1, JaegerSpan_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (CampaignManager_1_1) {
                CampaignManager_1 = CampaignManager_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (ReinitManager_1_1) {
                ReinitManager_1 = ReinitManager_1_1;
            },
            function (PlacementManager_1_1) {
                PlacementManager_1 = PlacementManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (CacheBookkeeping_1_1) {
                CacheBookkeeping_1 = CacheBookkeeping_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (Cache_1_1) {
                Cache_1 = Cache_1_1;
            },
            function (AssetManager_1_1) {
                AssetManager_1 = AssetManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (AdMobSignalFactory_1_1) {
                AdMobSignalFactory_1 = AdMobSignalFactory_1_1;
            },
            function (NewRefreshManager_1_1) {
                NewRefreshManager_1 = NewRefreshManager_1_1;
            },
            function (TestAdUnit_1_1) {
                TestAdUnit_1 = TestAdUnit_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (OperativeEventManager_1_1) {
                OperativeEventManager_1 = OperativeEventManager_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            },
            function (Listener_1_1) {
                Listener_1 = Listener_1_1;
            },
            function (JaegerManager_1_1) {
                JaegerManager_1 = JaegerManager_1_1;
            },
            function (JaegerSpan_1_1) {
                JaegerSpan_1 = JaegerSpan_1_1;
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
            describe('NewRefreshManagerTest', function () {
                var nativeBridge;
                var configuration;
                var focusManager;
                var wakeUpManager;
                var placementManager;
                var clientInfo;
                var deviceInfo;
                var request;
                var cacheBookKeeping;
                var cache;
                var reinitManager;
                var assetManager;
                var sessionManager;
                var metaDataManager;
                var adMobSignalFactory;
                var campaignManager;
                var thirdPartyEventManager;
                var campaign;
                var operativeEventManager;
                var container;
                var adUnit;
                var jaegerManager;
                var gdprManager;
                var programmaticTrackingService;
                var forceQuitManager;
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    cacheBookKeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                    programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookKeeping, programmaticTrackingService);
                    reinitManager = new ReinitManager_1.ReinitManager(nativeBridge, clientInfo, request, cache);
                    assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookKeeping, nativeBridge);
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    adMobSignalFactory = new AdMobSignalFactory_1.AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
                    jaegerManager = sinon.createStubInstance(JaegerManager_1.JaegerManager);
                    jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan_1.JaegerSpan('test'));
                    campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookKeeping, jaegerManager);
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    campaign = TestFixtures_1.TestFixtures.getCampaign();
                    operativeEventManager = new OperativeEventManager_1.OperativeEventManager({
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: configuration,
                        campaign: campaign
                    });
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    container = new Activity_1.Activity(nativeBridge, deviceInfo, forceQuitManager);
                    gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    adUnit = new TestAdUnit_1.TestAdUnit(nativeBridge, {
                        forceOrientation: AdUnitContainer_1.Orientation.NONE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        campaign: TestFixtures_1.TestFixtures.getCampaign(),
                        configuration: configuration,
                        request: request,
                        options: {},
                        adMobSignalFactory: adMobSignalFactory,
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    });
                });
                it('should not refill when SDK must reinitialize', function () {
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    sinon.stub(adUnit, 'isShowing').returns(true);
                    sinon.stub(reinitManager, 'shouldReinitialize').returns(Promise.resolve(true));
                    refreshManager.setCurrentAdUnit(adUnit);
                    return refreshManager.refresh().then(function () {
                        chai_1.assert.isFalse(refreshManager.getRefillState(Date.now()).shouldRefill, 'tried to refill when SDK should reinitialize');
                    });
                });
                it('should not refill immediately after ad unit start', function () {
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    sinon.stub(adUnit, 'isShowing').returns(true);
                    refreshManager.setCurrentAdUnit(adUnit);
                    adUnit.onStart.trigger();
                    chai_1.assert.isFalse(refreshManager.getRefillState(Date.now()).shouldRefill, 'tried to refill immediately after ad unit start');
                });
                it('should not refill when app is in background', function () {
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    sinon.stub(focusManager, 'isAppForeground').returns(false);
                    chai_1.assert.isFalse(refreshManager.getRefillState(Date.now()).shouldRefill, 'tried to refill when app is in background');
                });
                it('should refill after init', function () {
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    chai_1.assert.isTrue(refreshManager.getRefillState(Date.now()).shouldRefill, 'did not refill when SDK is initializing');
                });
                it('should refill according to ad plan TTL', function () {
                    var oneHourInSeconds = 3600;
                    var twoHoursInMilliseconds = 7200000;
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);
                    chai_1.assert.isFalse(refreshManager.getRefillState(Date.now()).shouldRefill, 'tried to refill when valid ad plan was received');
                    chai_1.assert.isTrue(refreshManager.getRefillState(Date.now() + twoHoursInMilliseconds).shouldRefill, 'did not refill after ad plan expired');
                });
                // ideally ad plan TTL and campaign expiration should be in sync but this tests for the desync case where individual campaign has somehow expired before ad plan TTL has expired
                it('should refill when a campaign has expired', function () {
                    var oneHourInSeconds = 3600;
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    sinon.stub(campaign, 'isExpired').returns(true);
                    campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);
                    campaignManager.onCampaign.trigger('video', campaign);
                    chai_1.assert.isTrue(refreshManager.getRefillState(Date.now()).shouldRefill, 'did not refill when there was one expired campaign');
                });
                it('should reinitialize when webview has been updated', function () {
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    sinon.stub(reinitManager, 'shouldReinitialize').returns(Promise.resolve(true));
                    nativeBridge.Sdk = new Sdk_1.SdkApi(nativeBridge);
                    var spy = sinon.spy(nativeBridge.Sdk, 'reinitialize');
                    return refreshManager.refresh().then(function () {
                        chai_1.assert.isTrue(spy.calledOnce, 'native API reinitialize was not invoked');
                    });
                });
                it('should request new fill when webview has not been updated', function () {
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    sinon.stub(reinitManager, 'shouldReinitialize').returns(Promise.resolve(false));
                    var spy = sinon.spy(campaignManager, 'request');
                    return refreshManager.refresh().then(function () {
                        chai_1.assert.isTrue(spy.calledOnce, 'new fill was not requested when webview was not updated');
                    });
                });
                it('should do nothing when current ad plan is valid', function () {
                    var oneHourInSeconds = 3600;
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);
                    var requestSpy = sinon.spy(campaignManager, 'request');
                    var reinitSpy = sinon.spy(reinitManager, 'shouldReinitialize');
                    return refreshManager.refresh().then(function () {
                        chai_1.assert.isFalse(requestSpy.called, 'ad request was triggered for valid ad plan');
                        chai_1.assert.isFalse(reinitSpy.called, 'reinit check was triggered for valid ad plan');
                    });
                });
                it('should handle new campaign', function () {
                    var oneHourInSeconds = 3600;
                    var refreshManager = new NewRefreshManager_1.NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);
                    nativeBridge.Listener = new Listener_1.ListenerApi(nativeBridge);
                    var listenerSpy = sinon.spy(nativeBridge.Listener, 'sendReadyEvent');
                    campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);
                    campaignManager.onCampaign.trigger('video', campaign);
                    chai_1.assert.isDefined(placementManager.getCampaign('video'), 'campaign was not set for correct placement');
                    chai_1.assert.equal(placementManager.getCampaign('video').getId(), campaign.getId(), 'campaign was set incorrectly');
                    chai_1.assert.isTrue(listenerSpy.calledOnceWithExactly('video'), 'ready event was not sent correctly');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV3UmVmcmVzaE1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTmV3UmVmcmVzaE1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFvQ0EsUUFBUSxDQUFDLHVCQUF1QixFQUFFO2dCQUM5QixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksYUFBNEIsQ0FBQztnQkFDakMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksZ0JBQWtDLENBQUM7Z0JBQ3ZDLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxVQUE2QixDQUFDO2dCQUNsQyxJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksZ0JBQWtDLENBQUM7Z0JBQ3ZDLElBQUksS0FBWSxDQUFDO2dCQUNqQixJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLGVBQWdDLENBQUM7Z0JBQ3JDLElBQUksa0JBQXNDLENBQUM7Z0JBQzNDLElBQUksZUFBZ0MsQ0FBQztnQkFDckMsSUFBSSxzQkFBOEMsQ0FBQztnQkFDbkQsSUFBSSxRQUE2QixDQUFDO2dCQUNsQyxJQUFJLHFCQUE0QyxDQUFDO2dCQUNqRCxJQUFJLFNBQW1CLENBQUM7Z0JBQ3hCLElBQUksTUFBa0IsQ0FBQztnQkFDdkIsSUFBSSxhQUE0QixDQUFDO2dCQUNqQyxJQUFJLFdBQXdCLENBQUM7Z0JBQzdCLElBQUksMkJBQXdELENBQUM7Z0JBQzdELElBQUksZ0JBQWtDLENBQUM7Z0JBRXZDLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsMkJBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDOUMsYUFBYSxHQUFHLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDaEQsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDOUMsYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQzlELGdCQUFnQixHQUFHLElBQUksbUNBQWdCLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUNyRSxVQUFVLEdBQUcsMkJBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDMUMsVUFBVSxHQUFHLDJCQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFDakQsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQ25ELGdCQUFnQixHQUFHLElBQUksbUNBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3RELDJCQUEyQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx5REFBMkIsQ0FBQyxDQUFDO29CQUNwRixLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztvQkFDdkcsYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDNUUsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxLQUFLLEVBQUUseUJBQVMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUN2RyxjQUFjLEdBQUcsSUFBSSwrQkFBYyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDM0QsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsa0JBQWtCLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDaEcsYUFBYSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyw2QkFBYSxDQUFDLENBQUM7b0JBQ3hELGFBQWEsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLHVCQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDdkUsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUN4TSxzQkFBc0IsR0FBRyxJQUFJLCtDQUFzQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDM0UsUUFBUSxHQUFHLDJCQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ3RDLHFCQUFxQixHQUFHLElBQUksNkNBQXFCLENBQUM7d0JBQzlDLFlBQVksRUFBRSxZQUFZO3dCQUMxQixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsZUFBZSxFQUFFLGVBQWU7d0JBQ2hDLGNBQWMsRUFBRSxjQUFjO3dCQUM5QixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixRQUFRLEVBQUUsUUFBUTtxQkFDckIsQ0FBQyxDQUFDO29CQUNILGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxDQUFDO29CQUM5RCxTQUFTLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDckUsV0FBVyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDLENBQUM7b0JBRXBELE1BQU0sR0FBRyxJQUFJLHVCQUFVLENBQUMsWUFBWSxFQUFFO3dCQUNsQyxnQkFBZ0IsRUFBRSw2QkFBVyxDQUFDLElBQUk7d0JBQ2xDLFlBQVksRUFBRSxZQUFZO3dCQUMxQixTQUFTLEVBQUUsU0FBUzt3QkFDcEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLFVBQVUsRUFBRSxVQUFVO3dCQUN0QixzQkFBc0IsRUFBRSxzQkFBc0I7d0JBQzlDLHFCQUFxQixFQUFFLHFCQUFxQjt3QkFDNUMsU0FBUyxFQUFFLDJCQUFZLENBQUMsWUFBWSxFQUFFO3dCQUN0QyxRQUFRLEVBQUUsMkJBQVksQ0FBQyxXQUFXLEVBQUU7d0JBQ3BDLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsT0FBTyxFQUFFLEVBQUU7d0JBQ1gsa0JBQWtCLEVBQUUsa0JBQWtCO3dCQUN0QyxXQUFXLEVBQUUsV0FBVzt3QkFDeEIsMkJBQTJCLEVBQUUsMkJBQTJCO3FCQUMzRCxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLDhDQUE4QyxFQUFFO29CQUMvQyxJQUFNLGNBQWMsR0FBc0IsSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUU1SyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzlDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLG9CQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFFL0UsY0FBYyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUV4QyxPQUFPLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7d0JBQ2pDLGFBQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxZQUFZLEVBQUUsOENBQThDLENBQUMsQ0FBQztvQkFDM0gsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLG1EQUFtRCxFQUFFO29CQUNwRCxJQUFNLGNBQWMsR0FBc0IsSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUU1SyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBRTlDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFFekIsYUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxpREFBaUQsQ0FBQyxDQUFDO2dCQUM5SCxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsNkNBQTZDLEVBQUU7b0JBQzlDLElBQU0sY0FBYyxHQUFzQixJQUFJLHFDQUFpQixDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUM7b0JBRTVLLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUUzRCxhQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsWUFBWSxFQUFFLDJDQUEyQyxDQUFDLENBQUM7Z0JBQ3hILENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRTtvQkFDM0IsSUFBTSxjQUFjLEdBQXNCLElBQUkscUNBQWlCLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFFNUssYUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO2dCQUNySCxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUU7b0JBQ3pDLElBQU0sZ0JBQWdCLEdBQVcsSUFBSSxDQUFDO29CQUN0QyxJQUFNLHNCQUFzQixHQUFXLE9BQU8sQ0FBQztvQkFDL0MsSUFBTSxjQUFjLEdBQXNCLElBQUkscUNBQWlCLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFFNUssZUFBZSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFFOUQsYUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxpREFBaUQsQ0FBQyxDQUFDO29CQUMxSCxhQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLHNCQUFzQixDQUFDLENBQUMsWUFBWSxFQUFFLHNDQUFzQyxDQUFDLENBQUM7Z0JBQzNJLENBQUMsQ0FBQyxDQUFDO2dCQUVILGdMQUFnTDtnQkFDaEwsRUFBRSxDQUFDLDJDQUEyQyxFQUFFO29CQUM1QyxJQUFNLGdCQUFnQixHQUFXLElBQUksQ0FBQztvQkFDdEMsSUFBTSxjQUFjLEdBQXNCLElBQUkscUNBQWlCLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFFNUssS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUVoRCxlQUFlLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUM5RCxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBRXRELGFBQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxZQUFZLEVBQUUsb0RBQW9ELENBQUMsQ0FBQztnQkFDaEksQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLG1EQUFtRCxFQUFFO29CQUNwRCxJQUFNLGNBQWMsR0FBc0IsSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUU1SyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBRS9FLFlBQVksQ0FBQyxHQUFHLEdBQUcsSUFBSSxZQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzVDLElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFFeEQsT0FBTyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDO3dCQUNqQyxhQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUseUNBQXlDLENBQUMsQ0FBQztvQkFDN0UsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLDJEQUEyRCxFQUFFO29CQUM1RCxJQUFNLGNBQWMsR0FBc0IsSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUU1SyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBRWhGLElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUVsRCxPQUFPLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7d0JBQ2pDLGFBQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSx5REFBeUQsQ0FBQyxDQUFDO29CQUM3RixDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsaURBQWlELEVBQUU7b0JBQ2xELElBQU0sZ0JBQWdCLEdBQVcsSUFBSSxDQUFDO29CQUV0QyxJQUFNLGNBQWMsR0FBc0IsSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUU1SyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUU5RCxJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDekQsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztvQkFFakUsT0FBTyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDO3dCQUNqQyxhQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsNENBQTRDLENBQUMsQ0FBQzt3QkFDaEYsYUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLDhDQUE4QyxDQUFDLENBQUM7b0JBQ3JGLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyw0QkFBNEIsRUFBRTtvQkFDN0IsSUFBTSxnQkFBZ0IsR0FBVyxJQUFJLENBQUM7b0JBRXRDLElBQU0sY0FBYyxHQUFzQixJQUFJLHFDQUFpQixDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUM7b0JBRTVLLFlBQVksQ0FBQyxRQUFRLEdBQUcsSUFBSSxzQkFBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUN0RCxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFFdkUsZUFBZSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUQsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUV0RCxhQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSw0Q0FBNEMsQ0FBQyxDQUFDO29CQUN0RyxhQUFNLENBQUMsS0FBSyxDQUF1QixnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLDhCQUE4QixDQUFDLENBQUM7b0JBQ3JJLGFBQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFLG9DQUFvQyxDQUFDLENBQUM7Z0JBQ3BHLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==