System.register(["mocha", "sinon", "chai", "Models/Vast/VastCampaign", "Models/Campaigns/MRAIDCampaign", "Models/Campaigns/XPromoCampaign", "Utilities/Request", "../TestHelpers/TestFixtures", "Managers/WakeUpManager", "Utilities/Observable", "Constants/Platform", "Managers/AssetManager", "Utilities/Cache", "Models/Configuration", "Parsers/ConfigurationParser", "Errors/WebViewError", "Managers/MetaDataManager", "Managers/ThirdPartyEventManager", "Managers/SessionManager", "Models/Assets/HTML", "Models/Campaigns/PerformanceCampaign", "Managers/CampaignManager", "Managers/FocusManager", "Parsers/ProgrammaticVastParser", "AdMob/AdMobSignalFactory", "Models/AdMobSignal", "Utilities/CacheBookkeeping", "Models/AndroidDeviceInfo", "json/ConfigurationAuctionPlc.json", "json/OnProgrammaticMraidPlcCampaignEmpty.json", "json/OnProgrammaticMraidPlcCampaignNull.json", "json/OnProgrammaticMraidUrlPlcCampaignEmpty.json", "json/OnProgrammaticMraidUrlPlcCampaign.json", "json/OnProgrammaticMraidPlcCampaign.json", "json/OnCometMraidPlcCampaign.json", "json/OnCometVideoPlcCampaign.json", "json/OnXPromoPlcCampaign.json", "xml/VastInlineLinear.xml", "xml/WrappedVast1.xml", "xml/WrappedVast2.xml", "xml/NonWrappedVast.xml", "xml/WrappedVast3.xml", "xml/NoVideoWrappedVast.xml", "json/OnProgrammaticVastPlcCampaignIncorrectWrapped.json", "xml/IncorrectWrappedVast.xml", "json/OnProgrammaticVastPlcCampaign.json", "json/OnProgrammaticVastPlcCampaignInsideOutside.json", "json/OnProgrammaticVastPlcCampaignMaxDepth.json", "json/OnProgrammaticVastPlcCampaignNoVideo.json", "json/OnProgrammaticVastPlcCampaignNoVideoWrapped.json", "json/OnProgrammaticVastPlcCampaignWrapped.json", "json/OnProgrammaticVastPlcCampaignIncorrect.json", "json/OnProgrammaticVastPlcCampaignNoData.json", "json/OnProgrammaticVastPlcCampaignNullData.json", "json/OnProgrammaticVastPlcCampaignFailing.json", "json/OnProgrammaticVastPlcCampaignNoImpression.json", "json/OnProgrammaticVastPlcCampaignTooMuchWrapping.json", "json/OnProgrammaticVastPlcCampaignMissingErrorUrls.json", "json/OnProgrammaticVastPlcCampaignAdLevelErrorUrls.json", "json/OnProgrammaticVastPlcCampaignCustomTracking.json", "json/OnStaticInterstitialDisplayCampaign.json", "json/OnStaticInterstitialDisplayJsCampaign.json", "json/ConfigurationPromoPlacements.json", "json/OnProgrammaticMraidPlcTwoMedia.json", "Jaeger/JaegerManager", "Jaeger/JaegerSpan", "Models/AdMobOptionalSignal", "Models/ABGroup", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Utilities/MixedPlacementUtility", "Utilities/PurchasingUtilities", "Managers/PlacementManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, VastCampaign_1, MRAIDCampaign_1, XPromoCampaign_1, Request_1, TestFixtures_1, WakeUpManager_1, Observable_1, Platform_1, AssetManager_1, Cache_1, Configuration_1, ConfigurationParser_1, WebViewError_1, MetaDataManager_1, ThirdPartyEventManager_1, SessionManager_1, HTML_1, PerformanceCampaign_1, CampaignManager_1, FocusManager_1, ProgrammaticVastParser_1, AdMobSignalFactory_1, AdMobSignal_1, CacheBookkeeping_1, AndroidDeviceInfo_1, ConfigurationAuctionPlc_json_1, OnProgrammaticMraidPlcCampaignEmpty_json_1, OnProgrammaticMraidPlcCampaignNull_json_1, OnProgrammaticMraidUrlPlcCampaignEmpty_json_1, OnProgrammaticMraidUrlPlcCampaign_json_1, OnProgrammaticMraidPlcCampaign_json_1, OnCometMraidPlcCampaign_json_1, OnCometVideoPlcCampaign_json_1, OnXPromoPlcCampaign_json_1, VastInlineLinear_xml_1, WrappedVast1_xml_1, WrappedVast2_xml_1, NonWrappedVast_xml_1, WrappedVast3_xml_1, NoVideoWrappedVast_xml_1, OnProgrammaticVastPlcCampaignIncorrectWrapped_json_1, IncorrectWrappedVast_xml_1, OnProgrammaticVastPlcCampaign_json_1, OnProgrammaticVastPlcCampaignInsideOutside_json_1, OnProgrammaticVastPlcCampaignMaxDepth_json_1, OnProgrammaticVastPlcCampaignNoVideo_json_1, OnProgrammaticVastPlcCampaignNoVideoWrapped_json_1, OnProgrammaticVastPlcCampaignWrapped_json_1, OnProgrammaticVastPlcCampaignIncorrect_json_1, OnProgrammaticVastPlcCampaignNoData_json_1, OnProgrammaticVastPlcCampaignNullData_json_1, OnProgrammaticVastPlcCampaignFailing_json_1, OnProgrammaticVastPlcCampaignNoImpression_json_1, OnProgrammaticVastPlcCampaignTooMuchWrapping_json_1, OnProgrammaticVastPlcCampaignMissingErrorUrls_json_1, OnProgrammaticVastPlcCampaignAdLevelErrorUrls_json_1, OnProgrammaticVastPlcCampaignCustomTracking_json_1, OnStaticInterstitialDisplayCampaign_json_1, OnStaticInterstitialDisplayJsCampaign_json_1, ConfigurationPromoPlacements_json_1, OnProgrammaticMraidPlcTwoMedia_json_1, JaegerManager_1, JaegerSpan_1, AdMobOptionalSignal_1, ABGroup_1, ProgrammaticTrackingService_1, MixedPlacementUtility_1, PurchasingUtilities_1, PlacementManager_1;
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
            function (VastCampaign_1_1) {
                VastCampaign_1 = VastCampaign_1_1;
            },
            function (MRAIDCampaign_1_1) {
                MRAIDCampaign_1 = MRAIDCampaign_1_1;
            },
            function (XPromoCampaign_1_1) {
                XPromoCampaign_1 = XPromoCampaign_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (AssetManager_1_1) {
                AssetManager_1 = AssetManager_1_1;
            },
            function (Cache_1_1) {
                Cache_1 = Cache_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (WebViewError_1_1) {
                WebViewError_1 = WebViewError_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (HTML_1_1) {
                HTML_1 = HTML_1_1;
            },
            function (PerformanceCampaign_1_1) {
                PerformanceCampaign_1 = PerformanceCampaign_1_1;
            },
            function (CampaignManager_1_1) {
                CampaignManager_1 = CampaignManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (ProgrammaticVastParser_1_1) {
                ProgrammaticVastParser_1 = ProgrammaticVastParser_1_1;
            },
            function (AdMobSignalFactory_1_1) {
                AdMobSignalFactory_1 = AdMobSignalFactory_1_1;
            },
            function (AdMobSignal_1_1) {
                AdMobSignal_1 = AdMobSignal_1_1;
            },
            function (CacheBookkeeping_1_1) {
                CacheBookkeeping_1 = CacheBookkeeping_1_1;
            },
            function (AndroidDeviceInfo_1_1) {
                AndroidDeviceInfo_1 = AndroidDeviceInfo_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            },
            function (OnProgrammaticMraidPlcCampaignEmpty_json_1_1) {
                OnProgrammaticMraidPlcCampaignEmpty_json_1 = OnProgrammaticMraidPlcCampaignEmpty_json_1_1;
            },
            function (OnProgrammaticMraidPlcCampaignNull_json_1_1) {
                OnProgrammaticMraidPlcCampaignNull_json_1 = OnProgrammaticMraidPlcCampaignNull_json_1_1;
            },
            function (OnProgrammaticMraidUrlPlcCampaignEmpty_json_1_1) {
                OnProgrammaticMraidUrlPlcCampaignEmpty_json_1 = OnProgrammaticMraidUrlPlcCampaignEmpty_json_1_1;
            },
            function (OnProgrammaticMraidUrlPlcCampaign_json_1_1) {
                OnProgrammaticMraidUrlPlcCampaign_json_1 = OnProgrammaticMraidUrlPlcCampaign_json_1_1;
            },
            function (OnProgrammaticMraidPlcCampaign_json_1_1) {
                OnProgrammaticMraidPlcCampaign_json_1 = OnProgrammaticMraidPlcCampaign_json_1_1;
            },
            function (OnCometMraidPlcCampaign_json_1_1) {
                OnCometMraidPlcCampaign_json_1 = OnCometMraidPlcCampaign_json_1_1;
            },
            function (OnCometVideoPlcCampaign_json_1_1) {
                OnCometVideoPlcCampaign_json_1 = OnCometVideoPlcCampaign_json_1_1;
            },
            function (OnXPromoPlcCampaign_json_1_1) {
                OnXPromoPlcCampaign_json_1 = OnXPromoPlcCampaign_json_1_1;
            },
            function (VastInlineLinear_xml_1_1) {
                VastInlineLinear_xml_1 = VastInlineLinear_xml_1_1;
            },
            function (WrappedVast1_xml_1_1) {
                WrappedVast1_xml_1 = WrappedVast1_xml_1_1;
            },
            function (WrappedVast2_xml_1_1) {
                WrappedVast2_xml_1 = WrappedVast2_xml_1_1;
            },
            function (NonWrappedVast_xml_1_1) {
                NonWrappedVast_xml_1 = NonWrappedVast_xml_1_1;
            },
            function (WrappedVast3_xml_1_1) {
                WrappedVast3_xml_1 = WrappedVast3_xml_1_1;
            },
            function (NoVideoWrappedVast_xml_1_1) {
                NoVideoWrappedVast_xml_1 = NoVideoWrappedVast_xml_1_1;
            },
            function (OnProgrammaticVastPlcCampaignIncorrectWrapped_json_1_1) {
                OnProgrammaticVastPlcCampaignIncorrectWrapped_json_1 = OnProgrammaticVastPlcCampaignIncorrectWrapped_json_1_1;
            },
            function (IncorrectWrappedVast_xml_1_1) {
                IncorrectWrappedVast_xml_1 = IncorrectWrappedVast_xml_1_1;
            },
            function (OnProgrammaticVastPlcCampaign_json_1_1) {
                OnProgrammaticVastPlcCampaign_json_1 = OnProgrammaticVastPlcCampaign_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignInsideOutside_json_1_1) {
                OnProgrammaticVastPlcCampaignInsideOutside_json_1 = OnProgrammaticVastPlcCampaignInsideOutside_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignMaxDepth_json_1_1) {
                OnProgrammaticVastPlcCampaignMaxDepth_json_1 = OnProgrammaticVastPlcCampaignMaxDepth_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignNoVideo_json_1_1) {
                OnProgrammaticVastPlcCampaignNoVideo_json_1 = OnProgrammaticVastPlcCampaignNoVideo_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignNoVideoWrapped_json_1_1) {
                OnProgrammaticVastPlcCampaignNoVideoWrapped_json_1 = OnProgrammaticVastPlcCampaignNoVideoWrapped_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignWrapped_json_1_1) {
                OnProgrammaticVastPlcCampaignWrapped_json_1 = OnProgrammaticVastPlcCampaignWrapped_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignIncorrect_json_1_1) {
                OnProgrammaticVastPlcCampaignIncorrect_json_1 = OnProgrammaticVastPlcCampaignIncorrect_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignNoData_json_1_1) {
                OnProgrammaticVastPlcCampaignNoData_json_1 = OnProgrammaticVastPlcCampaignNoData_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignNullData_json_1_1) {
                OnProgrammaticVastPlcCampaignNullData_json_1 = OnProgrammaticVastPlcCampaignNullData_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignFailing_json_1_1) {
                OnProgrammaticVastPlcCampaignFailing_json_1 = OnProgrammaticVastPlcCampaignFailing_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignNoImpression_json_1_1) {
                OnProgrammaticVastPlcCampaignNoImpression_json_1 = OnProgrammaticVastPlcCampaignNoImpression_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignTooMuchWrapping_json_1_1) {
                OnProgrammaticVastPlcCampaignTooMuchWrapping_json_1 = OnProgrammaticVastPlcCampaignTooMuchWrapping_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignMissingErrorUrls_json_1_1) {
                OnProgrammaticVastPlcCampaignMissingErrorUrls_json_1 = OnProgrammaticVastPlcCampaignMissingErrorUrls_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignAdLevelErrorUrls_json_1_1) {
                OnProgrammaticVastPlcCampaignAdLevelErrorUrls_json_1 = OnProgrammaticVastPlcCampaignAdLevelErrorUrls_json_1_1;
            },
            function (OnProgrammaticVastPlcCampaignCustomTracking_json_1_1) {
                OnProgrammaticVastPlcCampaignCustomTracking_json_1 = OnProgrammaticVastPlcCampaignCustomTracking_json_1_1;
            },
            function (OnStaticInterstitialDisplayCampaign_json_1_1) {
                OnStaticInterstitialDisplayCampaign_json_1 = OnStaticInterstitialDisplayCampaign_json_1_1;
            },
            function (OnStaticInterstitialDisplayJsCampaign_json_1_1) {
                OnStaticInterstitialDisplayJsCampaign_json_1 = OnStaticInterstitialDisplayJsCampaign_json_1_1;
            },
            function (ConfigurationPromoPlacements_json_1_1) {
                ConfigurationPromoPlacements_json_1 = ConfigurationPromoPlacements_json_1_1;
            },
            function (OnProgrammaticMraidPlcTwoMedia_json_1_1) {
                OnProgrammaticMraidPlcTwoMedia_json_1 = OnProgrammaticMraidPlcTwoMedia_json_1_1;
            },
            function (JaegerManager_1_1) {
                JaegerManager_1 = JaegerManager_1_1;
            },
            function (JaegerSpan_1_1) {
                JaegerSpan_1 = JaegerSpan_1_1;
            },
            function (AdMobOptionalSignal_1_1) {
                AdMobOptionalSignal_1 = AdMobOptionalSignal_1_1;
            },
            function (ABGroup_1_1) {
                ABGroup_1 = ABGroup_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            },
            function (MixedPlacementUtility_1_1) {
                MixedPlacementUtility_1 = MixedPlacementUtility_1_1;
            },
            function (PurchasingUtilities_1_1) {
                PurchasingUtilities_1 = PurchasingUtilities_1_1;
            },
            function (PlacementManager_1_1) {
                PlacementManager_1 = PlacementManager_1_1;
            }
        ],
        execute: function () {
            describe('CampaignManager', function () {
                var deviceInfo;
                var clientInfo;
                var nativeBridge;
                var wakeUpManager;
                var request;
                var vastParser;
                var warningSpy;
                var configuration;
                var metaDataManager;
                var thirdPartyEventManager;
                var sessionManager;
                var focusManager;
                var adMobSignalFactory;
                var cacheBookkeeping;
                var jaegerManager;
                var programmaticTrackingService;
                var placementManager;
                beforeEach(function () {
                    configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc_json_1.default));
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    vastParser = TestFixtures_1.TestFixtures.getVastParser();
                    warningSpy = sinon.spy();
                    nativeBridge = {
                        Storage: {
                            get: function (storageType, key) {
                                return Promise.resolve('123');
                            },
                            set: function () {
                                return Promise.resolve();
                            },
                            write: function () {
                                return Promise.resolve();
                            },
                            delete: function () {
                                return Promise.resolve();
                            },
                            getKeys: sinon.stub().callsFake(function (type, key, recursive) {
                                if (key && key === 'cache.campaigns') {
                                    return Promise.resolve(['12345', '67890']);
                                }
                                return Promise.resolve([]);
                            }),
                            onSet: new Observable_1.Observable2()
                        },
                        Request: {
                            onComplete: {
                                subscribe: sinon.spy()
                            },
                            onFailed: {
                                subscribe: sinon.spy()
                            }
                        },
                        Cache: {
                            setProgressInterval: sinon.spy(),
                            onDownloadStarted: new Observable_1.Observable0(),
                            onDownloadProgress: new Observable_1.Observable0(),
                            onDownloadEnd: new Observable_1.Observable0(),
                            onDownloadStopped: new Observable_1.Observable0(),
                            onDownloadError: new Observable_1.Observable0()
                        },
                        Sdk: {
                            logWarning: warningSpy,
                            logInfo: sinon.spy(),
                            logDebug: sinon.spy()
                        },
                        Connectivity: {
                            onConnected: new Observable_1.Observable2()
                        },
                        Broadcast: {
                            onBroadcastAction: new Observable_1.Observable4()
                        },
                        Notification: {
                            onNotification: new Observable_1.Observable2()
                        },
                        DeviceInfo: {
                            getConnectionType: sinon.stub().returns(Promise.resolve('wifi')),
                            getNetworkType: sinon.stub().returns(Promise.resolve(0)),
                            getAdvertisingTrackingId: sinon.stub().returns(Promise.resolve('12345')),
                            getLimitAdTrackingFlag: sinon.stub().returns(Promise.resolve(true)),
                            getOsVersion: sinon.stub().returns(Promise.resolve('testVersion')),
                            getModel: sinon.stub().returns(Promise.resolve('testModel')),
                            getScreenHeight: sinon.stub().returns(Promise.resolve(1200)),
                            getScreenWidth: sinon.stub().returns(Promise.resolve(800)),
                            getSystemLanguage: sinon.stub().returns(Promise.resolve('fi')),
                            isRooted: sinon.stub().returns(Promise.resolve(true)),
                            getTimeZone: sinon.stub().returns(Promise.resolve('+0100')),
                            getTotalMemory: sinon.stub().returns(Promise.resolve(1024)),
                            getHeadset: sinon.stub().returns(Promise.resolve(true)),
                            getScreenBrightness: sinon.stub().returns(Promise.resolve(0.7)),
                            getBatteryLevel: sinon.stub().returns(Promise.resolve(0.3)),
                            getBatteryStatus: sinon.stub().returns(Promise.resolve(1)),
                            getFreeMemory: sinon.stub().returns(Promise.resolve(1024)),
                            getNetworkOperatorName: sinon.stub().returns(Promise.resolve('operatorName')),
                            getNetworkOperator: sinon.stub().returns(Promise.resolve('operator')),
                            getUniqueEventId: sinon.stub().returns(Promise.resolve('12345')),
                            Ios: {
                                getScreenScale: sinon.stub().returns(Promise.resolve(2)),
                                isSimulator: sinon.stub().returns(Promise.resolve(true)),
                                getTotalSpace: sinon.stub().returns(Promise.resolve(1024)),
                                getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
                                getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
                                getStatusBarHeight: sinon.stub().returns(Promise.resolve(40))
                            },
                            Android: {
                                getAndroidId: sinon.stub().returns(Promise.resolve('17')),
                                getApiLevel: sinon.stub().returns(Promise.resolve(16)),
                                getManufacturer: sinon.stub().returns(Promise.resolve('N')),
                                getScreenDensity: sinon.stub().returns(Promise.resolve(2)),
                                getScreenLayout: sinon.stub().returns(Promise.resolve(1)),
                                getTotalSpace: sinon.stub().returns(Promise.resolve(2048)),
                                getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
                                getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
                                isAppInstalled: sinon.stub().returns(Promise.resolve(true)),
                                getPackageInfo: sinon.stub().returns(Promise.resolve(TestFixtures_1.TestFixtures.getPackageInfo()))
                            }
                        },
                        Lifecycle: {
                            onActivityResumed: new Observable_1.Observable1(),
                            onActivityPaused: new Observable_1.Observable1(),
                            onActivityDestroyed: new Observable_1.Observable1()
                        },
                        getPlatform: function () {
                            return Platform_1.Platform.TEST;
                        }
                    };
                    cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    deviceInfo = new AndroidDeviceInfo_1.AndroidDeviceInfo(nativeBridge);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory_1.AdMobSignalFactory);
                    jaegerManager = sinon.createStubInstance(JaegerManager_1.JaegerManager);
                    jaegerManager.isJaegerTracingEnabled = sinon.stub().returns(false);
                    jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan_1.JaegerSpan('test'));
                    adMobSignalFactory.getAdRequestSignal.returns(Promise.resolve(new AdMobSignal_1.AdMobSignal()));
                    adMobSignalFactory.getOptionalSignal.returns(Promise.resolve(new AdMobOptionalSignal_1.AdMobOptionalSignal()));
                    placementManager = sinon.createStubInstance(PlacementManager_1.PlacementManager);
                    PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                    programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                });
                describe('on VAST campaign', function () {
                    it('should trigger onCampaign after requesting a valid vast placement', function () {
                        // given a valid VAST placement
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnProgrammaticVastPlcCampaign_json_1.default
                        }));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        var triggeredError;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        // when the campaign manager requests the placement
                        return campaignManager.request().then(function () {
                            if (triggeredError) {
                                throw triggeredError;
                            }
                            // then the onVastCampaign observable is triggered with the correct campaign data
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredCampaign.getVideo().getUrl(), 'https://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                        });
                    });
                    it('should have data from inside and outside the wrapper for a wrapped VAST', function (done) {
                        // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnProgrammaticVastPlcCampaignInsideOutside_json_1.default
                        }));
                        mockRequest.expects('get').withArgs('http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml', [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).returns(Promise.resolve({
                            response: VastInlineLinear_xml_1.default
                        }));
                        vastParser.setMaxWrapperDepth(1);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            if (!triggeredCampaign && campaign) {
                                triggeredCampaign = campaign;
                                // then the onVastCampaign observable is triggered with the correct campaign data
                                mockRequest.verify();
                                chai_1.assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://cdnp.tremormedia.com/video/acudeo/Carrot_400x300_500kb.mp4');
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getAd().getErrorURLTemplates(), [
                                    'http://myErrorURL/error',
                                    'http://myErrorURL/wrapper/error'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getImpressionUrls(), [
                                    'http://myTrackingURL/impression',
                                    'http://myTrackingURL/wrapper/impression'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('creativeView'), [
                                    'http://myTrackingURL/creativeView',
                                    'http://myTrackingURL/wrapper/creativeView'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                                    'http://myTrackingURL/start',
                                    'http://myTrackingURL/wrapper/start'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('firstQuartile'), [
                                    'http://myTrackingURL/firstQuartile',
                                    'http://myTrackingURL/wrapper/firstQuartile'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('midpoint'), [
                                    'http://myTrackingURL/midpoint',
                                    'http://myTrackingURL/wrapper/midpoint'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('thirdQuartile'), [
                                    'http://myTrackingURL/thirdQuartile',
                                    'http://myTrackingURL/wrapper/thirdQuartile'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('complete'), [
                                    'http://myTrackingURL/complete',
                                    'http://myTrackingURL/wrapper/complete'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('mute'), [
                                    'http://myTrackingURL/wrapper/mute'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('unmute'), [
                                    'http://myTrackingURL/wrapper/unmute'
                                ]);
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getVideoClickTrackingURLs(), [
                                    'http://myTrackingURL/click'
                                ]);
                                chai_1.assert.equal(triggeredCampaign.getVast().getVideoClickThroughURL(), 'http://www.tremormedia.com');
                                chai_1.assert.equal(triggeredCampaign.getVast().getDuration(), 30);
                                done();
                            }
                        });
                        // when the campaign manager requests the placement
                        campaignManager.request();
                    });
                    it('should have data from both wrappers and the final wrapped vast for vast with 2 levels of wrapping', function (done) {
                        // given a valid wrapped VAST placement that points at a valid VAST with an inline ad
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnProgrammaticVastPlcCampaignWrapped_json_1.default
                        }));
                        mockRequest.expects('get').withArgs('https://x.vindicosuite.com/?l=454826&t=x&rnd=[Cachebuster_If_Supported_In_Console]', [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).returns(Promise.resolve({
                            response: WrappedVast1_xml_1.default
                        }));
                        mockRequest.expects('get').withArgs('https://ads.pointroll.com/PortalServe/?pid=2810492V01420160323193924&pos=o&secure=1&r=1466475479', [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).returns(Promise.resolve({
                            response: WrappedVast2_xml_1.default
                        }));
                        vastParser.setMaxWrapperDepth(2);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        campaignManager.onError.subscribe(function (error) {
                            chai_1.assert.equal(1, 2, error.message);
                        });
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                            // then the onVastCampaign observable is triggered with the correct campaign data
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredCampaign.getVideo().getUrl(), 'https://speed-s.pointroll.com/pointroll/media/asset/Nissan/221746/Nissan_FY16_FTC_GM_Generic_Instream_1280x720_400kbps_15secs.mp4');
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getAd().getErrorURLTemplates(), [
                                'https://bid.g.doubleclick.net/xbbe/notify/tremorvideo?creative_id=17282869&usl_id=0&errorcode=[ERRORCODE]&asseturi=[ASSETURI]&ord=[CACHEBUSTING]&offset=[CONTENTPLAYHEAD]&d=APEucNX6AnAylHZpx52AcFEstrYbL-_q_2ud9qCaXyViLGR4yz7SDI0QjLTfTgW5N60hztCt5lwtX-qOtPbrEbEH7AkfRc7aI04dfJWGCQhTntCRkpOC6UUNuHBWGPhsjDpKl8_I-piRwwFMMkZSXe8jaPe6gsJMdwmNCBn8OfpcbVAS0bknPVh1KkaXOZY-wnjj6kR0_VFyzS1fPi5lD3kj3lnBaEliKv-aqtH6SRbhBZoP7J-M9hM',
                                'http://events.tremorhub.com/diag?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&rid=fd53cdbe934c44c68c57467d184160d7&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=rwd19-1059849-video&seatId=60673&pbid=1585&brid=3418&sid=9755&sdom=demo.app.com&asid=5097&nid=3&lid=3&adom=nissanusa.com&crid=17282869&aid=13457'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getImpressionUrls(), [
                                'https://ads.pointroll.com/PortalServe/?secure=1&pid=2810492V01420160323193924&pos=o&oimp=C0350500-4E6E-9A6D-0314-A20018D20101&fcook=~&actid=-1206&cid=2183676&playmode=$PLAYMODE$&r=1466475479',
                                'https://ad.doubleclick.net/ddm/ad/N3340.1922318VIANTINC.COM/B9495003.129068239;sz=1x1;ord=1466475479;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=?',
                                'https://x.vindicosuite.com/dserve/t=d;l=454826;c=918974;b=3968433;ta=4981097;cr=497788800;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;a=82365;ts=1466475479',
                                'https://sb.scorecardresearch.com/p?c1=1&c2=3000027&c3=&c4=&c5=01&cA1=3&cA2=2101&cA3=918974&cA4=3968433&cA5=454826&cA6=1&rn=1466475479',
                                'https://sb.scorecardresearch.com/p?c1=1&c2=15796101&c3=&c4=&c5=01&cA1=3&cA2=2101&cA3=918974&cA4=3968433&cA5=454826&cA6=1&rn=1466475479',
                                'https://googleads4.g.doubleclick.net/pcs/view?xai=AKAOjstYlfbiBdblfXq6LMym7IC5jwoF21UXuGUDBRde_xEZcfAEOwcQjxvzCqZC5xoBrfhSWeKfI9Vz-D1j&sai=AMfl-YQb2HT6IsBYPlBStYINPJzmMSeKis_RCNPsUxYoiKpSFPeIiBL5vp5CBf3w5bw&sig=Cg0ArKJSzFyUVtx3UaXREAE&urlfix=1&adurl=',
                                'https://bid.g.doubleclick.net/xbbe/view?d=APEucNXGC7uCkDFg7_FYyowfGrx3gCKqhj3JqV93eVSng28OzYoBI8eE3HMmMaZotBjcJre8GVivuBgii_YOG0AJuoUi5TTrE7Zbb21k0RzF9urGsENZJLmfN1rU1WL1GJdWq5e-cfjN-RNzdogp_BDoCo7AbTtBNu9yXLyQZYjDjv9YQQm_9nJjbhG5s-lNtk8OxpEKZkS6qGU8UsI1Ox8YtPSXjIJ3obdROAlANqs5ptxYWId2hu8&pr=1.022',
                                'https://bid.g.doubleclick.net/xbbe/pixel?d=CPYDEKyCFxi17p4IIAE&v=APEucNVfdw4VBtAGiqhdQ4w6G19gKA3EINCPdqNCuaourBH1J2uL8UN6cqxVJdM0ostWINYYDJCq',
                                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=IMP',
                                'http://b.scorecardresearch.com/b?C1=1&C2=6000001&C3=&C4=&C5=010000&rnd=8202933074266195079',
                                'http://adserver.unityads.unity3d.com/brands/1059849/%ZONE%/start?value=715&gm=1022&nm=715&cc=USD&seat=60673&pubId=1585&brandId=3418&supplyId=9755&unit=13457&code=rwd19-1059849-video&source=5097&demand=60004&nt=3&domain=nissanusa.com&cId=17282869&deal='
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('creativeView'), [
                                'https://x.vindicosuite.com/event/?e=11;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=95458;cr=2686135030;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href='
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                                'https://x.vindicosuite.com/event/?e=12;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=91256;cr=2539347201;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=11;',
                                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=start&vastcrtype=linear&crid=67817785'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('firstQuartile'), [
                                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-201&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                                'https://x.vindicosuite.com/event/?e=13;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=52835;cr=3022585079;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960584;',
                                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=firstQuartile&vastcrtype=linear&crid=67817785'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('midpoint'), [
                                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-202&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                                'https://x.vindicosuite.com/event/?e=14;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=23819;cr=99195890;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=18;',
                                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=midpoint&vastcrtype=linear&crid=67817785'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('thirdQuartile'), [
                                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-203&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                                'https://x.vindicosuite.com/event/?e=15;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=9092;cr=1110035921;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=960585;',
                                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=thirdQuartile&vastcrtype=linear&crid=67817785'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('complete'), [
                                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=-204&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                                'https://x.vindicosuite.com/event/?e=16;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=93062;cr=3378288114;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=13;',
                                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=complete&vastcrtype=linear&crid=67817785'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('mute'), [
                                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1004&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                                'https://x.vindicosuite.com/event/?e=17;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=45513;cr=483982038;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=16;'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('unmute'), [
                                'https://t.pointroll.com/PointRoll/Track/?q=ba&o=1&c=1005&i=C0350500-4E6E-9A6D-0314-A20018D20101&r=1466475479',
                                'https://x.vindicosuite.com/event/?e=18;l=454826;b=3968433;c=918974;smuid=;msd=;a=82365;ta=1466475479;tk=5138;cr=1883451934;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;href=',
                                'https://ad.doubleclick.net/ddm/activity/dc_oe=ChMIgM6PxqOwzQIVDg-BCh1U9QzEEAAYACC5oqsg;met=1;ecn1=1;etm1=0;eid1=149645;'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getVideoClickTrackingURLs(), [
                                'https://www.tremor.com/click-last-wrapped',
                                'https://x.vindicosuite.com/click/?v=5;m=3;l=454826;c=918974;b=3968433;ts=1466475479;ui=Mzxw7vcjJKIYUBr51X6qI4T75yHPBloC4oFyIzlnzuseNOCWolB7mBUvaYyxz5q64WKJSiV1f2Vkqdfz1Uc8_w;pc=1;ad=CKrhGxDmgQwYjgwgASgEMId3ONiZAUDdhxJIvrwSUL6LOFixm%2FIBYL2DBWjDlyFwAngBiAEAkAEAmAEBogETMjU5NDc1MTUzODc3MTAwMjAxNbIBBVZJREVPuAEBwAEAyAEA0AEA2AEA;xid=2594751538771002015;ep=1',
                                'https://adclick.g.doubleclick.net/pcs/click?xai=AKAOjstYlfbiBdblfXq6LMym7IC5jwoF21UXuGUDBRde_xEZcfAEOwcQjxvzCqZC5xoBrfhSWeKfI9Vz-D1j&sai=AMfl-YT-yQK5ngqbHCt-MCth_f3g6Ql6PBVZa7-oecKkqrVqkSNK6jTjavZZXhulRKo&sig=Cg0ArKJSzI2sXx3KmnQbEAE&urlfix=1&adurl=',
                                'http://events.tremorhub.com/evt?rid=fd53cdbe934c44c68c57467d184160d7&pbid=1585&seatid=60673&aid=13457&asid=5097&lid=3&evt=click&vastcrtype=linear&crid=67817785'
                            ]);
                            chai_1.assert.equal(triggeredCampaign.getVast().getVideoClickThroughURL(), 'http://clk.pointroll.com/bc/?a=2183676&c=9001&i=C0350500-4E6E-9A6D-0314-A20018D20101&clickurl=https://ad.doubleclick.net/ddm/clk/302764234%3B129068239%3Bg%3Fhttp://www.choosenissan.com/altima/%3Fdcp=zmm.%25epid!.%26dcc=%25ecid!.%25eaid!%26utm_source=%25esid!%26utm_medium=%25epid!%26utm_content=%25ecid!.%25eaid!%26dcn=1');
                            chai_1.assert.equal(triggeredCampaign.getVast().getDuration(), 15);
                            done();
                        });
                        // when the campaign manager requests the placement
                        campaignManager.request();
                    });
                    it('should fail when max depth is exceeded', function (done) {
                        // given a valid wrapped VAST placement that points at a valid VAST with a wrapper
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnProgrammaticVastPlcCampaignMaxDepth_json_1.default
                        }));
                        var nonWrappedVAST = NonWrappedVast_xml_1.default;
                        var wrappedVAST = WrappedVast3_xml_1.default;
                        // create intermediate wrappers
                        for (var i = 0; i < 8; i++) {
                            mockRequest.expects('get').returns(Promise.resolve({
                                response: wrappedVAST
                            }));
                        }
                        // return last non wrapped VAST
                        mockRequest.expects('get').returns(Promise.resolve({
                            response: nonWrappedVAST
                        }));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        campaignManager.onError.subscribe(function (err) {
                            chai_1.assert.equal(err.message, 'VAST wrapper depth exceeded');
                            done();
                        });
                        // when the campaign manager requests the placement
                        campaignManager.request();
                    });
                    var verifyErrorForResponse = function (response, expectedErrorMessage) {
                        // given a VAST placement with invalid XML
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve(response));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredError;
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        // when the campaign manager requests the placement
                        return campaignManager.request().then(function () {
                            // then the onError observable is triggered with an appropriate error
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredError.message, expectedErrorMessage);
                        });
                    };
                    var verifyErrorForWrappedResponse = function (response, wrappedUrl, wrappedResponse, expectedErrorMessage, done) {
                        // given a VAST placement that wraps another VAST
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve(response));
                        mockRequest.expects('get').withArgs(wrappedUrl, [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).returns(wrappedResponse);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredError;
                        var verify = function () {
                            // then the onError observable is triggered with an appropriate error
                            mockRequest.verify();
                            if (triggeredError instanceof Error) {
                                chai_1.assert.equal(triggeredError.message, expectedErrorMessage);
                            }
                            else if (triggeredError instanceof WebViewError_1.WebViewError) {
                                chai_1.assert.equal(triggeredError.message, expectedErrorMessage);
                            }
                            else {
                                chai_1.assert.equal(triggeredError, expectedErrorMessage);
                            }
                        };
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                            if (done) {
                                // then the onError observable is triggered with an appropriate error
                                verify();
                                done();
                            }
                        });
                        // when the campaign manager requests the placement
                        campaignManager.request();
                    };
                    describe('VAST error handling', function () {
                        it('should trigger onError after requesting a vast placement without a video url', function () {
                            var response = {
                                response: OnProgrammaticVastPlcCampaignNoVideo_json_1.default
                            };
                            return verifyErrorForResponse(response, 'No video URL found for VAST');
                        });
                        it('should trigger onError after requesting a wrapped vast placement without a video url', function (done) {
                            var response = {
                                response: OnProgrammaticVastPlcCampaignNoVideoWrapped_json_1.default
                            };
                            var wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                            var wrappedResponse = Promise.resolve({
                                response: NoVideoWrappedVast_xml_1.default
                            });
                            return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'No video URL found for VAST', done);
                        });
                        it('should trigger onError after requesting a vast placement with incorrect document element node name', function () {
                            var response = {
                                response: OnProgrammaticVastPlcCampaignIncorrect_json_1.default
                            };
                            return verifyErrorForResponse(response, 'VAST xml data is missing');
                        });
                        it('should trigger onError after requesting a wrapped vast placement with incorrect document element node name', function () {
                            var response = {
                                response: OnProgrammaticVastPlcCampaignIncorrectWrapped_json_1.default
                            };
                            var wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                            var wrappedResponse = Promise.resolve({
                                response: IncorrectWrappedVast_xml_1.default
                            });
                            return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'VAST xml is invalid - document element must be VAST but was foo');
                        });
                        it('should trigger onError after requesting a vast placement with no vast data', function () {
                            var response = {
                                response: OnProgrammaticVastPlcCampaignNoData_json_1.default
                            };
                            return verifyErrorForResponse(response, 'VAST xml data is missing');
                        });
                        it('should trigger onError after requesting a wrapped vast placement when a failure occurred requesting the wrapped VAST', function () {
                            var response = {
                                response: OnProgrammaticVastPlcCampaignFailing_json_1.default
                            };
                            var wrappedUrl = 'http://demo.tremormedia.com/proddev/vast/vast_inline_linear.xml';
                            var wrappedResponse = Promise.reject('Some kind of request error happened');
                            return verifyErrorForWrappedResponse(response, wrappedUrl, wrappedResponse, 'Some kind of request error happened');
                        });
                        it('should trigger onError after requesting a vast placement with null vast data', function () {
                            // given a VAST placement with null vast
                            var response = {
                                response: OnProgrammaticVastPlcCampaignNullData_json_1.default
                            };
                            var mockRequest = sinon.mock(request);
                            mockRequest.expects('post').returns(Promise.resolve(response));
                            var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                            var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                            var noFillTriggered = false;
                            var triggeredError;
                            campaignManager.onNoFill.subscribe(function () {
                                noFillTriggered = true;
                            });
                            campaignManager.onError.subscribe(function (error) {
                                triggeredError = error;
                            });
                            // when the campaign manager requests the placement
                            return campaignManager.request().then(function () {
                                mockRequest.verify();
                                return verifyErrorForResponse(response, 'model: AuctionResponse key: content with value: null: null is not in: string');
                            });
                        });
                        it('should trigger onError after requesting a vast placement without an impression url', function () {
                            var response = {
                                response: OnProgrammaticVastPlcCampaignNoImpression_json_1.default
                            };
                            return verifyErrorForResponse(response, 'Campaign does not have an impression url');
                        });
                        it('should bail out when max wrapper depth is reached for a wrapped VAST', function () {
                            // given a valid VAST response containing a wrapper
                            var response = {
                                response: OnProgrammaticVastPlcCampaignTooMuchWrapping_json_1.default
                            };
                            // when the parser's max wrapper depth is set to 0 to disallow wrapping
                            ProgrammaticVastParser_1.ProgrammaticVastParser.setVastParserMaxDepth(0);
                            // then we should get an error because there was no video URL,
                            // because the video url would have been in the wrapped xml
                            return verifyErrorForResponse(response, 'VAST wrapper depth exceeded');
                        });
                    });
                    var verifyCampaignForResponse = function (response) {
                        // given a valid VAST placement
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve(response));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        var triggeredError;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        // when the campaign manager requests the placement
                        return campaignManager.request().then(function () {
                            if (triggeredError) {
                                throw triggeredError;
                            }
                            // then the onVastCampaign observable is triggered with the correct campaign data
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                        });
                    };
                    describe('VAST warnings', function () {
                        it('should warn about missing error urls', function () {
                            // given a VAST response that has no error URLs
                            var response = {
                                response: OnProgrammaticVastPlcCampaignMissingErrorUrls_json_1.default
                            };
                            // when the campaign manager requests the placement
                            return verifyCampaignForResponse(response).then(function () {
                                // then the SDK's logWarning function is called with an appropriate message
                                chai_1.assert.isTrue(warningSpy.calledWith('Campaign does not have an error url!'));
                            });
                        });
                        it('should not warn about missing error urls if error url exists at ad level', function () {
                            // given a VAST response that an error URL in the ad
                            var response = {
                                response: OnProgrammaticVastPlcCampaignAdLevelErrorUrls_json_1.default
                            };
                            // when the campaign manager requests the placement
                            return verifyCampaignForResponse(response).then(function () {
                                // then the SDK's logWarning function is called with an appropriate message
                                chai_1.assert.equal(warningSpy.callCount, 0);
                            });
                        });
                    });
                    it('should process custom tracking urls', function () {
                        // given a valid VAST placement
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnProgrammaticVastPlcCampaignCustomTracking_json_1.default
                        }));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        var triggeredError;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        // when the campaign manager requests the placement
                        return campaignManager.request().then(function () {
                            if (triggeredError) {
                                throw triggeredError;
                            }
                            // then the onVastCampaign observable is triggered with the correct campaign data
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredCampaign.getVideo().getUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                                'http://customTrackingUrl/start',
                                'http://customTrackingUrl/start2',
                                'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=?%SDK_VERSION%'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('firstQuartile'), [
                                'http://customTrackingUrl/firstQuartile'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('midpoint'), [
                                'http://customTrackingUrl/midpoint'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('thirdQuartile'), [
                                'http://customTrackingUrl/thirdQuartile'
                            ]);
                            chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('complete'), [
                                'http://customTrackingUrl/complete'
                            ]);
                        });
                    });
                });
                describe('on MRAID campaign', function () {
                    it('should trigger onMRAIDCampaign after receiving a MRAID campaign inlined', function () {
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnProgrammaticMraidUrlPlcCampaign_json_1.default
                        }));
                        var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                        var content = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        var triggeredError;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        return campaignManager.request().then(function () {
                            if (triggeredError) {
                                throw triggeredError;
                            }
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredCampaign.getId(), 'UNKNOWN');
                            var asset = new HTML_1.HTML(content.inlinedUrl, triggeredCampaign.getSession());
                            chai_1.assert.deepEqual(triggeredCampaign.getResourceUrl(), asset);
                            chai_1.assert.deepEqual(triggeredCampaign.getRequiredAssets(), [asset]);
                            chai_1.assert.deepEqual(triggeredCampaign.getOptionalAssets(), []);
                            chai_1.assert.equal(triggeredCampaign.getDynamicMarkup(), content.dynamicMarkup);
                            var willExpireAt = triggeredCampaign.getWillExpireAt();
                            chai_1.assert.isDefined(willExpireAt, 'Will expire at should be defined');
                            if (willExpireAt) {
                                var timeDiff = willExpireAt - (Date.now() + json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL * 1000);
                                chai_1.assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                            }
                        });
                    });
                    it('should trigger onMRAIDCampaign after receiving a MRAID campaign non-inlined', function () {
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnProgrammaticMraidPlcCampaign_json_1.default
                        }));
                        var json = JSON.parse(OnProgrammaticMraidPlcCampaign_json_1.default);
                        var content = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        var triggeredError;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        return campaignManager.request().then(function () {
                            if (triggeredError) {
                                throw triggeredError;
                            }
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredCampaign.getId(), 'UNKNOWN');
                            chai_1.assert.deepEqual(triggeredCampaign.getOptionalAssets(), []);
                            chai_1.assert.equal(triggeredCampaign.getResource(), content.markup);
                            var willExpireAt = triggeredCampaign.getWillExpireAt();
                            chai_1.assert.isDefined(willExpireAt, 'Will expire at should be defined');
                            if (willExpireAt) {
                                var timeDiff = willExpireAt - (Date.now() + json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL * 1000);
                                chai_1.assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
                            }
                        });
                    });
                    it('should trigger onError if mraid property is null', function (done) {
                        var response = {
                            response: OnProgrammaticMraidPlcCampaignNull_json_1.default
                        };
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve(response));
                        var doneCalled = false;
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredError;
                        campaignManager.onNoFill.subscribe(function () {
                            if (!doneCalled) {
                                doneCalled = true;
                                done();
                            }
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        campaignManager.request().then(function () {
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredError.message, 'model: AuctionResponse key: content with value: null: null is not in: string');
                        });
                    });
                    it('should trigger onError if there is no markup', function () {
                        var response = {
                            response: OnProgrammaticMraidPlcCampaignEmpty_json_1.default
                        };
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve(response));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredError;
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        return campaignManager.request().then(function () {
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredError.message, 'MRAID Campaign missing markup');
                        });
                    });
                    it('should trigger onError if there is no inlinedUrl', function () {
                        var response = {
                            response: OnProgrammaticMraidUrlPlcCampaignEmpty_json_1.default
                        };
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve(response));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredError;
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        return campaignManager.request().then(function () {
                            mockRequest.verify();
                            chai_1.assert.equal(triggeredError.message, 'MRAID Campaign missing inlinedUrl');
                        });
                    });
                });
                describe('static interstitial display html', function () {
                    it('should process the programmatic/static-interstitial-html', function () {
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnStaticInterstitialDisplayCampaign_json_1.default
                        }));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        var triggeredError;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        return campaignManager.request().then(function () {
                            if (triggeredError) {
                                throw triggeredError;
                            }
                            mockRequest.verify();
                            chai_1.assert.deepEqual(triggeredCampaign.getOptionalAssets(), []);
                        });
                    });
                });
                describe('static interstitial display js', function () {
                    it('should process the programmatic/static-interstitial-js', function () {
                        var mockRequest = sinon.mock(request);
                        mockRequest.expects('post').returns(Promise.resolve({
                            response: OnStaticInterstitialDisplayJsCampaign_json_1.default
                        }));
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        var triggeredError;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        return campaignManager.request().then(function () {
                            if (triggeredError) {
                                throw triggeredError;
                            }
                            mockRequest.verify();
                            chai_1.assert.deepEqual(triggeredCampaign.getOptionalAssets(), []);
                        });
                    });
                });
                describe('on PLC', function () {
                    var assetManager;
                    var campaignManager;
                    var triggeredCampaign;
                    var triggeredError;
                    var triggeredPlacement;
                    var mockRequest;
                    var ConfigurationAuctionPlcJson = JSON.parse(ConfigurationAuctionPlc_json_1.default);
                    beforeEach(function () {
                        assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, ConfigurationParser_1.ConfigurationParser.parse(ConfigurationAuctionPlcJson), assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        campaignManager.onCampaign.subscribe(function (placement, campaign) {
                            triggeredCampaign = campaign;
                            triggeredPlacement = placement;
                        });
                        campaignManager.onError.subscribe(function (error) {
                            triggeredError = error;
                        });
                        mockRequest = sinon.mock(request);
                    });
                    describe('performance campaign', function () {
                        it('should process correct Auction comet/performance Campaign content type', function () {
                            mockRequest.expects('post').returns(Promise.resolve({
                                response: OnCometVideoPlcCampaign_json_1.default
                            }));
                            return campaignManager.request().then(function () {
                                if (triggeredError) {
                                    throw triggeredError;
                                }
                                mockRequest.verify();
                                chai_1.assert.isTrue(triggeredCampaign instanceof PerformanceCampaign_1.PerformanceCampaign);
                                chai_1.assert.equal(triggeredPlacement, 'video');
                            });
                        });
                        it('should process correct Auction comet/performance Campaign content type with mraidUrl', function () {
                            mockRequest.expects('post').returns(Promise.resolve({
                                response: OnCometMraidPlcCampaign_json_1.default
                            }));
                            return campaignManager.request().then(function () {
                                if (triggeredError) {
                                    throw triggeredError;
                                }
                                mockRequest.verify();
                                chai_1.assert.isTrue(triggeredCampaign instanceof MRAIDCampaign_1.MRAIDCampaign);
                                chai_1.assert.equal(triggeredPlacement, 'mraid');
                                chai_1.assert.deepEqual(triggeredCampaign.getResourceUrl(), new HTML_1.HTML('https://cdn.unityads.unity3d.com/playables/sma_re2.0.0_ios/index.html', triggeredCampaign.getSession(), 'mraid-test-creative-id'));
                            });
                        });
                    });
                    describe('XPromo campaign', function () {
                        it('should process correct Auction xpromo/video Campaign content type', function () {
                            mockRequest.expects('post').returns(Promise.resolve({
                                response: OnXPromoPlcCampaign_json_1.default
                            }));
                            return campaignManager.request().then(function () {
                                if (triggeredError) {
                                    throw triggeredError;
                                }
                                mockRequest.verify();
                                chai_1.assert.isTrue(triggeredCampaign instanceof XPromoCampaign_1.XPromoCampaign);
                                chai_1.assert.equal(triggeredPlacement, 'video');
                            });
                        });
                    });
                    describe('programmatic campaign', function () {
                        it('should process custom tracking urls for Auction programmatic/vast Campaign', function () {
                            mockRequest.expects('post').returns(Promise.resolve({
                                response: OnProgrammaticVastPlcCampaign_json_1.default
                            }));
                            return campaignManager.request().then(function () {
                                if (triggeredError) {
                                    throw triggeredError;
                                }
                                mockRequest.verify();
                                chai_1.assert.isTrue(triggeredCampaign instanceof VastCampaign_1.VastCampaign);
                                chai_1.assert.equal(triggeredPlacement, 'video');
                                chai_1.assert.equal(triggeredCampaign.getAdType(), 'vast-sample-ad-type');
                                chai_1.assert.equal(triggeredCampaign.getCreativeId(), 'vast-sample-creative-id');
                                chai_1.assert.equal(triggeredCampaign.getSeatId(), 900);
                                chai_1.assert.equal(triggeredCampaign.getCorrelationId(), 'zzzz');
                                chai_1.assert.equal(triggeredCampaign.getVideo().getUrl(), 'https://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4');
                                chai_1.assert.deepEqual(triggeredCampaign.getVast().getTrackingEventUrls('start'), [
                                    'https://ads-brand-postback.unityads.unity3d.com/brands/2000/%ZONE%/impression/common?data=HriweFDQPzT1jnyWbt-UA8UKb9IOsNlB9YIUyM9eE5ujdz4eYZgsoFvzcfOR0945o8vsJZHvyi000XO4SVoOkgxlWcUpHRArDKtM16J5jLAhZkWxULyJ0JywIVC3Tebds1o5ZYQ5_KsbpqCbO-q56Jd3AKgbIlTgIDjATlSFf8AiOl96Y81UkZutA8jx4E2sQTCKg1ar6uXQvuXV6KG4IYdx8Jr5e9ZFvgjy6kxbgbuyuEw2_SKzmBCsj3Q2qOM_YxDzaxd5xa2kJ5H9udVwtLUs8OnndWj-k0f__xj958kx6pBvcCwm-xfQiP8zA0DuMq7IHqGt9uvzuvcSN8XX3klwoaYNjZGcggH_AvNoJMPM2lfBidn6cPGOk9IXNNdvT7s42Ss05RSVVqIm87eGmWWVfoSut_UIMTMes1JtxuSuBKCk3abJdUm1GhdJ8OTF3mOVJ1vKj7M%3D',
                                    'https://www.dummy-url.com'
                                ]);
                            });
                        });
                        it('should process correct Auction programmatic/mraid-url Campaign content type', function () {
                            mockRequest.expects('post').returns(Promise.resolve({
                                response: OnProgrammaticMraidUrlPlcCampaign_json_1.default
                            }));
                            return campaignManager.request().then(function () {
                                if (triggeredError) {
                                    throw triggeredError;
                                }
                                mockRequest.verify();
                                chai_1.assert.isTrue(triggeredCampaign instanceof MRAIDCampaign_1.MRAIDCampaign);
                                chai_1.assert.equal(triggeredPlacement, 'mraid');
                                chai_1.assert.equal(triggeredCampaign.getAdType(), 'mraid-url-sample-ad-type');
                                chai_1.assert.equal(triggeredCampaign.getCreativeId(), 'mraid-url-sample-creative-id');
                                chai_1.assert.equal(triggeredCampaign.getSeatId(), 901);
                                chai_1.assert.equal(triggeredCampaign.getCorrelationId(), '0zGg2TfRsBNbqlc7AVdhLAw');
                                chai_1.assert.deepEqual(triggeredCampaign.getResourceUrl(), new HTML_1.HTML('https://img.serveroute.com/mini_8ball_fast/inlined.html', triggeredCampaign.getSession()));
                                chai_1.assert.deepEqual(triggeredCampaign.getDynamicMarkup(), 'var markup = \'dynamic\';');
                                chai_1.assert.deepEqual(triggeredCampaign.getTrackingUrls(), {
                                    'impression': [
                                        'http://test.impression.com/blah1',
                                        'http://test.impression.com/blah2',
                                        'http://test.impression.com/%ZONE%/blah?sdkVersion=%SDK_VERSION%'
                                    ],
                                    'complete': [
                                        'http://test.complete.com/complete1'
                                    ],
                                    'click': [
                                        'http://test.complete.com/click1'
                                    ]
                                });
                            });
                        });
                        it('should process correct Auction programmatic/mraid Campaign content type', function () {
                            mockRequest.expects('post').returns(Promise.resolve({
                                response: OnProgrammaticMraidPlcCampaign_json_1.default
                            }));
                            return campaignManager.request().then(function () {
                                if (triggeredError) {
                                    throw triggeredError;
                                }
                                mockRequest.verify();
                                chai_1.assert.isTrue(triggeredCampaign instanceof MRAIDCampaign_1.MRAIDCampaign);
                                chai_1.assert.equal(triggeredPlacement, 'mraid');
                                chai_1.assert.equal(triggeredCampaign.getAdType(), 'mraid-sample-ad-type');
                                chai_1.assert.equal(triggeredCampaign.getCreativeId(), 'mraid-sample-creative-id');
                                chai_1.assert.equal(triggeredCampaign.getSeatId(), 902);
                                chai_1.assert.equal(triggeredCampaign.getCorrelationId(), 'zGg2TfRsBNbqlc7AVdhLAw');
                                chai_1.assert.deepEqual(triggeredCampaign.getResource(), '<div>markup</div>');
                                chai_1.assert.deepEqual(triggeredCampaign.getTrackingUrls(), { impression: ['https://ads-brand-postback.unityads.unity3d.com/brands/2000/%ZONE%/impression/common?data=Kz2J'] });
                            });
                        });
                        it('should correct programmatic campaign id for android', function () {
                            nativeBridge.getPlatform = function () {
                                return Platform_1.Platform.ANDROID;
                            };
                            assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                            campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, ConfigurationParser_1.ConfigurationParser.parse(ConfigurationAuctionPlcJson), assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                            campaignManager.onCampaign.subscribe(function (placement, campaign) {
                                triggeredCampaign = campaign;
                                triggeredPlacement = placement;
                            });
                            campaignManager.onError.subscribe(function (error) {
                                triggeredError = error;
                            });
                            mockRequest.expects('post').returns(Promise.resolve({
                                response: OnProgrammaticMraidPlcCampaign_json_1.default
                            }));
                            return campaignManager.request().then(function () {
                                if (triggeredError) {
                                    throw triggeredError;
                                }
                                mockRequest.verify();
                                chai_1.assert.equal(triggeredCampaign.getId(), '005472656d6f7220416e6472');
                            });
                        });
                        it('should correct programmatic campaign id for ios', function () {
                            nativeBridge.getPlatform = function () {
                                return Platform_1.Platform.IOS;
                            };
                            assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                            campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, ConfigurationParser_1.ConfigurationParser.parse(ConfigurationAuctionPlcJson), assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                            campaignManager.onCampaign.subscribe(function (placement, campaign) {
                                triggeredCampaign = campaign;
                                triggeredPlacement = placement;
                            });
                            campaignManager.onError.subscribe(function (error) {
                                triggeredError = error;
                            });
                            mockRequest.expects('post').returns(Promise.resolve({
                                response: OnProgrammaticMraidPlcCampaign_json_1.default
                            }));
                            return campaignManager.request().then(function () {
                                if (triggeredError) {
                                    throw triggeredError;
                                }
                                mockRequest.verify();
                                chai_1.assert.equal(triggeredCampaign.getId(), '00005472656d6f7220694f53');
                            });
                        });
                    });
                });
                it('test previous campaign', function () {
                    var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                    var previousCampaign = campaignManager.getPreviousPlacementId();
                    chai_1.assert.equal(previousCampaign, undefined);
                    campaignManager.setPreviousPlacementId('defaultPlacement');
                    previousCampaign = campaignManager.getPreviousPlacementId();
                    chai_1.assert.equal(previousCampaign, 'defaultPlacement');
                });
                describe('backup campaign', function () {
                    var nowStub;
                    beforeEach(function () {
                        nowStub = sinon.stub(Date, 'now').returns(0);
                    });
                    afterEach(function () {
                        nowStub.restore();
                    });
                    it('should have cachedCampaigns in request body', function () {
                        var requestData = '{}';
                        sinon.stub(request, 'post').callsFake(function (url, data, headers, options) {
                            if (data === void 0) { data = ''; }
                            if (headers === void 0) { headers = []; }
                            requestData = data;
                            return Promise.resolve();
                        });
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        return campaignManager.request().then(function () {
                            var requestBody = JSON.parse(requestData);
                            chai_1.assert.equal(2, requestBody.cachedCampaigns.length, 'Cached campaigns should contain 2 entries');
                            chai_1.assert.equal('12345', requestBody.cachedCampaigns[0], 'Cached campaigns first entry not what was expected');
                            chai_1.assert.equal('67890', requestBody.cachedCampaigns[1], 'Cached campaigns second entry not whas was expected');
                        });
                    });
                    it('should have cached campaign response', function () {
                        var requestData = '{}';
                        sinon.stub(request, 'post').callsFake(function (url, data, headers, options) {
                            if (data === void 0) { data = ''; }
                            if (headers === void 0) { headers = []; }
                            requestData = data;
                            return Promise.resolve({ url: 'http://test/request', response: OnProgrammaticMraidUrlPlcCampaign_json_1.default, responseCode: 200, headers: [] });
                        });
                        var actualResponse;
                        sinon.stub(cacheBookkeeping, 'setCachedCampaignResponse').callsFake(function (response) {
                            actualResponse = response;
                            return Promise.resolve();
                        });
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var now = new Date(Date.now());
                        var utcTimestamp = Math.floor(new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()).getTime() / 1000);
                        return campaignManager.request().then(function () {
                            chai_1.assert.isObject(actualResponse);
                            chai_1.assert.equal(actualResponse.url, 'http://test/request');
                            var data = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                            data.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].absoluteCacheTTL = utcTimestamp + 12345;
                            chai_1.assert.deepEqual(JSON.parse(actualResponse.response), data);
                        });
                    });
                    it('should request from cached response', function () {
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        var onAdPlanReceived = false;
                        campaignManager.onAdPlanReceived.subscribe(function () {
                            onAdPlanReceived = true;
                        });
                        return campaignManager.requestFromCache({
                            response: OnProgrammaticMraidUrlPlcCampaign_json_1.default,
                            url: 'https://auction.unityads.unity3d.com/v4/games/12345/requests?&platform=android&sdkVersion=2000&stores=none&&screenWidth=800&screenHeight=1200&connectionType=wifi&networkType=0'
                        }).then(function () {
                            chai_1.assert.isDefined(triggeredCampaign);
                            chai_1.assert.equal(configuration.getAbGroup(), ABGroup_1.ABGroupBuilder.getAbGroup(99));
                            chai_1.assert.isFalse(onAdPlanReceived, 'onAdPlanReceived was triggered');
                        });
                    });
                    it('should ignore cached response if game id mismatch', function () {
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        var onAdPlanReceived = false;
                        campaignManager.onAdPlanReceived.subscribe(function () {
                            onAdPlanReceived = true;
                        });
                        return campaignManager.requestFromCache({
                            response: OnProgrammaticMraidUrlPlcCampaign_json_1.default,
                            url: 'https://auction.unityads.unity3d.com/v4/games/500/requests?&platform=android&sdkVersion=2000&stores=none&&screenWidth=800&screenHeight=1200&connectionType=wifi&networkType=0'
                        }).then(function () {
                            chai_1.assert.isUndefined(triggeredCampaign);
                            chai_1.assert.isFalse(onAdPlanReceived, 'onAdPlanReceived was triggered');
                        });
                    });
                    it('should ignore cached response if campaign expired', function () {
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        nowStub.reset();
                        nowStub.returns(36000 * 1000);
                        var now = new Date(Date.now());
                        var utcTimestamp = Math.floor(new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()).getTime() / 1000);
                        var triggeredCampaign;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        var onAdPlanReceived = false;
                        campaignManager.onAdPlanReceived.subscribe(function () {
                            onAdPlanReceived = true;
                        });
                        var data = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                        data.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].absoluteCacheTTL = utcTimestamp - 12345;
                        return campaignManager.requestFromCache({
                            response: JSON.stringify(data),
                            url: 'https://auction.unityads.unity3d.com/v4/games/12345/requests?&platform=android&sdkVersion=2000&stores=none&&screenWidth=800&screenHeight=1200&connectionType=wifi&networkType=0s'
                        }).then(function () {
                            chai_1.assert.isUndefined(triggeredCampaign);
                            chai_1.assert.isFalse(onAdPlanReceived, 'onAdPlanReceived was triggered');
                        });
                    });
                    it('should ignore expired placements', function () {
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        nowStub.reset();
                        nowStub.returns(36000 * 1000);
                        var now = new Date(Date.now());
                        var utcTimestamp = Math.floor(new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds()).getTime() / 1000);
                        var campaignCount = 0;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            campaignCount++;
                        });
                        var onAdPlanReceived = false;
                        campaignManager.onAdPlanReceived.subscribe(function () {
                            onAdPlanReceived = true;
                        });
                        var data = JSON.parse(OnProgrammaticMraidPlcTwoMedia_json_1.default);
                        data.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85_1'].absoluteCacheTTL = utcTimestamp - 12345;
                        return campaignManager.requestFromCache({
                            response: JSON.stringify(data),
                            url: 'https://auction.unityads.unity3d.com/v4/games/12345/requests?&platform=android&sdkVersion=2000&stores=none&&screenWidth=800&screenHeight=1200&connectionType=wifi&networkType=0s'
                        }).then(function () {
                            chai_1.assert.equal(campaignCount, 1);
                            chai_1.assert.isFalse(onAdPlanReceived, 'onAdPlanReceived was triggered');
                        });
                    });
                    it('should request from cached response even with different connection type and network', function () {
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        var onAdPlanReceived = false;
                        campaignManager.onAdPlanReceived.subscribe(function () {
                            onAdPlanReceived = true;
                        });
                        return campaignManager.requestFromCache({
                            response: OnProgrammaticMraidUrlPlcCampaign_json_1.default,
                            url: 'https://auction.unityads.unity3d.com/v4/games/12345/requests?&platform=android&sdkVersion=2000&stores=none&&screenWidth=800&screenHeight=1200&connectionType=test&networkType=1'
                        }).then(function () {
                            chai_1.assert.equal(configuration.getAbGroup(), ABGroup_1.ABGroupBuilder.getAbGroup(99));
                            chai_1.assert.isFalse(onAdPlanReceived, 'onAdPlanReceived was triggered');
                        });
                    });
                    it('should request from cached response, no fill', function () {
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        var noFill = false;
                        campaignManager.onNoFill.subscribe(function () {
                            noFill = true;
                        });
                        var onError = false;
                        campaignManager.onError.subscribe(function () {
                            onError = true;
                        });
                        var onAdPlanReceived = false;
                        campaignManager.onAdPlanReceived.subscribe(function () {
                            onAdPlanReceived = true;
                        });
                        return campaignManager.requestFromCache({
                            response: OnProgrammaticVastPlcCampaignNullData_json_1.default,
                            url: 'https://auction.unityads.unity3d.com/v4/games/500/requests?&platform=android&sdkVersion=2000&stores=none&&screenWidth=800&screenHeight=1200&connectionType=wifi&networkType=0'
                        }).then(function () {
                            chai_1.assert.isUndefined(triggeredCampaign);
                            chai_1.assert.isFalse(noFill, 'onNoFill was triggered');
                            chai_1.assert.isFalse(onError, 'onError was triggered');
                            chai_1.assert.isFalse(onAdPlanReceived, 'onAdPlanReceived was triggered');
                        });
                    });
                    it('should request from cached response, error', function () {
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        var triggeredCampaign;
                        campaignManager.onCampaign.subscribe(function (placementId, campaign) {
                            triggeredCampaign = campaign;
                        });
                        var noFill = false;
                        campaignManager.onNoFill.subscribe(function () {
                            noFill = true;
                        });
                        var onError = false;
                        campaignManager.onError.subscribe(function () {
                            onError = true;
                        });
                        var onAdPlanReceived = false;
                        campaignManager.onAdPlanReceived.subscribe(function () {
                            onAdPlanReceived = true;
                        });
                        return campaignManager.requestFromCache({
                            response: OnProgrammaticVastPlcCampaignNullData_json_1.default,
                            url: 'https://auction.unityads.unity3d.com/v4/games/500/requests?&platform=android&sdkVersion=2000&stores=none&&screenWidth=800&screenHeight=1200&connectionType=wifi&networkType=0'
                        }).then(function () {
                            chai_1.assert.isUndefined(triggeredCampaign);
                            chai_1.assert.isFalse(noFill, 'onNoFill was triggered');
                            chai_1.assert.isFalse(onError, 'onError was triggered');
                            chai_1.assert.isFalse(onAdPlanReceived, 'onAdPlanReceived was triggered');
                        });
                    });
                });
                describe('the organizationId-property', function () {
                    var requestData = '{}';
                    var assetManager;
                    var campaignManager;
                    beforeEach(function () {
                        sinon.stub(request, 'post').callsFake(function (url, data, headers, options) {
                            if (data === void 0) { data = ''; }
                            if (headers === void 0) { headers = []; }
                            requestData = data;
                            return Promise.resolve();
                        });
                        assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                    });
                    it('should be in request body when defined in config response', function () {
                        return campaignManager.request().then(function () {
                            var requestBody = JSON.parse(requestData);
                            chai_1.assert.equal(5552368, requestBody.organizationId, 'organizationId should be in ad request body when it was defined in the config response');
                        });
                    });
                    it('should not be in request body when not defined in config response', function () {
                        sinon.stub(configuration, 'getOrganizationId').returns(undefined);
                        return campaignManager.request().then(function () {
                            var requestBody = JSON.parse(requestData);
                            chai_1.assert.isUndefined(requestBody.organizationId, 'organizationId should NOT be in ad request body when it was NOT defined in the config response');
                        });
                    });
                });
                describe('on mixed placement request', function () {
                    var requestData = '{}';
                    var assetManager;
                    var campaignManager;
                    var placements = MixedPlacementUtility_1.MixedPlacementUtility.originalPlacements;
                    var placementRequestMap = {};
                    beforeEach(function () {
                        sinon.stub(request, 'post').callsFake(function (url, data, headers, options) {
                            if (data === void 0) { data = ''; }
                            if (headers === void 0) { headers = []; }
                            requestData = data;
                            return Promise.resolve();
                        });
                        var clientInfoMixedExperiment = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID, '1003628');
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default), clientInfoMixedExperiment);
                        assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfoMixedExperiment, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                    });
                    afterEach(function () {
                        MixedPlacementUtility_1.MixedPlacementUtility.originalPlacements = {};
                    });
                    it('should strip mixedPlacements from the placement request map in request body sent to auction when mixedplacment experiment is enabled', function () {
                        for (var placementid in placements) {
                            if (placements.hasOwnProperty(placementid)) {
                                placementRequestMap[placementid] = {
                                    adTypes: placements[placementid].getAdTypes(),
                                    allowSkip: placements[placementid].allowSkip()
                                };
                                if (placementRequestMap[placementid].adTypes === undefined) {
                                    delete placementRequestMap[placementid].adTypes;
                                }
                            }
                        }
                        return campaignManager.request().then(function () {
                            var requestBody = JSON.parse(requestData);
                            chai_1.assert.notEqual(MixedPlacementUtility_1.MixedPlacementUtility.originalPlacements, configuration.getPlacements());
                            chai_1.assert.notEqual(requestBody.placements, {});
                            chai_1.assert.deepEqual(requestBody.placements, placementRequestMap);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25NYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkNhbXBhaWduTWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWtGQSxRQUFRLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3hCLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksYUFBNEIsQ0FBQztnQkFDakMsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksVUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxhQUE0QixDQUFDO2dCQUNqQyxJQUFJLGVBQWdDLENBQUM7Z0JBQ3JDLElBQUksc0JBQThDLENBQUM7Z0JBQ25ELElBQUksY0FBOEIsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLGtCQUFzQyxDQUFDO2dCQUMzQyxJQUFJLGdCQUFrQyxDQUFDO2dCQUN2QyxJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksMkJBQXdELENBQUM7Z0JBQzdELElBQUksZ0JBQWtDLENBQUM7Z0JBRXZDLFVBQVUsQ0FBQztvQkFDUCxhQUFhLEdBQUcseUNBQW1CLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsc0NBQXVCLENBQUMsQ0FBQyxDQUFDO29CQUUvRSxVQUFVLEdBQUcsMkJBQVksQ0FBQyxhQUFhLEVB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