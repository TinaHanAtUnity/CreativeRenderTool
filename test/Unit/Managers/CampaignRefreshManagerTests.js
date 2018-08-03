System.register(["tslib", "mocha", "sinon", "chai", "Models/Configuration", "Managers/CampaignManager", "Managers/WakeUpManager", "Managers/RefreshManager", "Models/Campaigns/PerformanceCampaign", "Utilities/Observable", "Constants/Platform", "Utilities/Request", "Test/Unit/TestHelpers/TestFixtures", "Managers/AssetManager", "Utilities/Cache", "Models/Placement", "Managers/SessionManager", "Managers/ThirdPartyEventManager", "AdUnits/Containers/AdUnitContainer", "AdUnits/AbstractAdUnit", "Models/Vast/VastCampaign", "Models/Campaigns/MRAIDCampaign", "Models/Campaigns/XPromoCampaign", "Managers/MetaDataManager", "Managers/FocusManager", "Parsers/ConfigurationParser", "json/ConfigurationAuctionPlc.json", "json/ConfigurationPromoPlacements.json", "json/OnCometVideoPlcCampaign.json", "Utilities/Diagnostics", "AdMob/AdMobSignalFactory", "Models/AdMobSignal", "Models/AdMobOptionalSignal", "Utilities/CacheBookkeeping", "Managers/OldCampaignRefreshManager", "Managers/OperativeEventManagerFactory", "Jaeger/JaegerManager", "Jaeger/JaegerSpan", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Models/Campaigns/PromoCampaign", "Utilities/PurchasingUtilities", "Managers/PlacementManager"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, sinon, chai_1, Configuration_1, CampaignManager_1, WakeUpManager_1, RefreshManager_1, PerformanceCampaign_1, Observable_1, Platform_1, Request_1, TestFixtures_1, AssetManager_1, Cache_1, Placement_1, SessionManager_1, ThirdPartyEventManager_1, AdUnitContainer_1, AbstractAdUnit_1, VastCampaign_1, MRAIDCampaign_1, XPromoCampaign_1, MetaDataManager_1, FocusManager_1, ConfigurationParser_1, ConfigurationAuctionPlc_json_1, ConfigurationPromoPlacements_json_1, OnCometVideoPlcCampaign_json_1, Diagnostics_1, AdMobSignalFactory_1, AdMobSignal_1, AdMobOptionalSignal_1, CacheBookkeeping_1, OldCampaignRefreshManager_1, OperativeEventManagerFactory_1, JaegerManager_1, JaegerSpan_1, GdprManager_1, ProgrammaticTrackingService_1, PromoCampaign_1, PurchasingUtilities_1, PlacementManager_1, TestContainer, TestAdUnit;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (CampaignManager_1_1) {
                CampaignManager_1 = CampaignManager_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (RefreshManager_1_1) {
                RefreshManager_1 = RefreshManager_1_1;
            },
            function (PerformanceCampaign_1_1) {
                PerformanceCampaign_1 = PerformanceCampaign_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (AssetManager_1_1) {
                AssetManager_1 = AssetManager_1_1;
            },
            function (Cache_1_1) {
                Cache_1 = Cache_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (AbstractAdUnit_1_1) {
                AbstractAdUnit_1 = AbstractAdUnit_1_1;
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
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            },
            function (ConfigurationPromoPlacements_json_1_1) {
                ConfigurationPromoPlacements_json_1 = ConfigurationPromoPlacements_json_1_1;
            },
            function (OnCometVideoPlcCampaign_json_1_1) {
                OnCometVideoPlcCampaign_json_1 = OnCometVideoPlcCampaign_json_1_1;
            },
            function (Diagnostics_1_1) {
                Diagnostics_1 = Diagnostics_1_1;
            },
            function (AdMobSignalFactory_1_1) {
                AdMobSignalFactory_1 = AdMobSignalFactory_1_1;
            },
            function (AdMobSignal_1_1) {
                AdMobSignal_1 = AdMobSignal_1_1;
            },
            function (AdMobOptionalSignal_1_1) {
                AdMobOptionalSignal_1 = AdMobOptionalSignal_1_1;
            },
            function (CacheBookkeeping_1_1) {
                CacheBookkeeping_1 = CacheBookkeeping_1_1;
            },
            function (OldCampaignRefreshManager_1_1) {
                OldCampaignRefreshManager_1 = OldCampaignRefreshManager_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
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
            function (PromoCampaign_1_1) {
                PromoCampaign_1 = PromoCampaign_1_1;
            },
            function (PurchasingUtilities_1_1) {
                PurchasingUtilities_1 = PurchasingUtilities_1_1;
            },
            function (PlacementManager_1_1) {
                PlacementManager_1 = PlacementManager_1_1;
            }
        ],
        execute: function () {
            TestContainer = /** @class */ (function (_super) {
                tslib_1.__extends(TestContainer, _super);
                function TestContainer() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestContainer.prototype.open = function (adUnit, views, allowRotation, forceOrientation, disableBackbutton, options) {
                    return Promise.resolve();
                };
                TestContainer.prototype.close = function () {
                    return Promise.resolve();
                };
                TestContainer.prototype.reconfigure = function (configuration) {
                    return Promise.all([]);
                };
                TestContainer.prototype.reorient = function (allowRotation, forceOrientation) {
                    return Promise.all([]);
                };
                TestContainer.prototype.isPaused = function () {
                    return false;
                };
                TestContainer.prototype.setViewFrame = function (view, x, y, width, height) {
                    return Promise.resolve();
                };
                TestContainer.prototype.getViews = function () {
                    return Promise.all([]);
                };
                return TestContainer;
            }(AdUnitContainer_1.AdUnitContainer));
            exports_1("TestContainer", TestContainer);
            TestAdUnit = /** @class */ (function (_super) {
                tslib_1.__extends(TestAdUnit, _super);
                function TestAdUnit() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestAdUnit.prototype.show = function () {
                    return Promise.resolve();
                };
                TestAdUnit.prototype.hide = function () {
                    return Promise.resolve();
                };
                TestAdUnit.prototype.description = function () {
                    return 'TestAdUnit';
                };
                TestAdUnit.prototype.isShowing = function () {
                    return true;
                };
                TestAdUnit.prototype.isCached = function () {
                    return false;
                };
                return TestAdUnit;
            }(AbstractAdUnit_1.AbstractAdUnit));
            exports_1("TestAdUnit", TestAdUnit);
            describe('CampaignRefreshManager', function () {
                var deviceInfo;
                var clientInfo;
                var vastParser;
                var configuration;
                var campaignManager;
                var wakeUpManager;
                var nativeBridge;
                var request;
                var assetManager;
                var sessionManager;
                var thirdPartyEventManager;
                var container;
                var campaignRefreshManager;
                var metaDataManager;
                var focusManager;
                var adUnitParams;
                var operativeEventManager;
                var adMobSignalFactory;
                var cacheBookkeeping;
                var cache;
                var jaegerManager;
                var gdprManager;
                var programmaticTrackingService;
                var placementManager;
                beforeEach(function () {
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    vastParser = TestFixtures_1.TestFixtures.getVastParser();
                    nativeBridge = {
                        Placement: {
                            setPlacementState: sinon.spy()
                        },
                        Listener: {
                            sendPlacementStateChangedEvent: sinon.spy(),
                            sendReadyEvent: sinon.spy()
                        },
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
                            getKeys: sinon.stub().returns(Promise.resolve([])),
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
                            logWarning: sinon.spy(),
                            logInfo: sinon.spy(),
                            logError: sinon.spy(),
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
                            getUniqueEventId: sinon.stub().returns(Promise.resolve('12345'))
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
                    placementManager = sinon.createStubInstance(PlacementManager_1.PlacementManager);
                    PurchasingUtilities_1.PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                    programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                    container = new TestContainer();
                    var campaign = TestFixtures_1.TestFixtures.getCampaign();
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
                    adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory_1.AdMobSignalFactory);
                    adMobSignalFactory.getAdRequestSignal.returns(Promise.resolve(new AdMobSignal_1.AdMobSignal()));
                    adMobSignalFactory.getOptionalSignal.returns(Promise.resolve(new AdMobOptionalSignal_1.AdMobOptionalSignal()));
                    gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    adUnitParams = {
                        forceOrientation: AdUnitContainer_1.Orientation.NONE,
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
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    };
                    RefreshManager_1.RefreshManager.ParsingErrorRefillDelay = 0; // prevent tests from hanging due to long retry timeouts
                    jaegerManager = sinon.createStubInstance(JaegerManager_1.JaegerManager);
                    jaegerManager.isJaegerTracingEnabled = sinon.stub().returns(false);
                    jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan_1.JaegerSpan('test'));
                });
                describe('PLC campaigns', function () {
                    beforeEach(function () {
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc_json_1.default));
                        campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        campaignRefreshManager = new OldCampaignRefreshManager_1.OldCampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, sessionManager, clientInfo, request, cache);
                    });
                    it('get campaign should return undefined', function () {
                        chai_1.assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                    });
                    it('get campaign should return a campaign (Performance)', function () {
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('premium', TestFixtures_1.TestFixtures.getCampaign());
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.notEqual(campaignRefreshManager.getCampaign('premium'), undefined);
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof PerformanceCampaign_1.PerformanceCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('premium');
                            chai_1.assert.notEqual(undefined, tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                            }
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onCampaign.trigger('video', TestFixtures_1.TestFixtures.getCampaign());
                            chai_1.assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof PerformanceCampaign_1.PerformanceCampaign);
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.READY);
                        });
                    });
                    it('get campaign should return a campaign (XPromo)', function () {
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('premium', TestFixtures_1.TestFixtures.getXPromoCampaign());
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.notEqual(campaignRefreshManager.getCampaign('premium'), undefined);
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof XPromoCampaign_1.XPromoCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('premium');
                            chai_1.assert.notEqual(undefined, tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                            }
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onCampaign.trigger('video', TestFixtures_1.TestFixtures.getXPromoCampaign());
                            chai_1.assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof XPromoCampaign_1.XPromoCampaign);
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.READY);
                        });
                    });
                    it('get campaign should return a campaign (Vast)', function () {
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('premium', TestFixtures_1.TestFixtures.getCompanionVastCampaign());
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('premium'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof VastCampaign_1.VastCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('premium');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '12345');
                            }
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onCampaign.trigger('video', TestFixtures_1.TestFixtures.getCompanionVastCampaign());
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('video'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof VastCampaign_1.VastCampaign);
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.READY);
                        });
                    });
                    it('get campaign should return a campaign (MRAID)', function () {
                        var mraid = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaign();
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('premium', mraid);
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('premium'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof MRAIDCampaign_1.MRAIDCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('premium');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '58dec182f01b1c0cdef54f0f');
                            }
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onCampaign.trigger('video', mraid);
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('video'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof MRAIDCampaign_1.MRAIDCampaign);
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.READY);
                        });
                    });
                    it('should not refresh', function () {
                        var campaign = TestFixtures_1.TestFixtures.getCampaign();
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('premium', campaign);
                            campaign = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaign();
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            var tmpCampaign = campaignRefreshManager.getCampaign('premium');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                            }
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            return campaignRefreshManager.refresh().then(function () {
                                var tmpCampaign2 = campaignRefreshManager.getCampaign('premium');
                                chai_1.assert.isDefined(tmpCampaign2);
                                if (tmpCampaign2) {
                                    chai_1.assert.notEqual(tmpCampaign2.getId(), '58dec182f01b1c0cdef54f0f');
                                }
                                var tmpCampaign3 = campaignRefreshManager.getCampaign('premium');
                                chai_1.assert.isDefined(tmpCampaign3);
                                if (tmpCampaign3) {
                                    chai_1.assert.equal(tmpCampaign3.getId(), '582bb5e352e4c4abd7fab850');
                                }
                                chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                                chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            });
                        });
                    });
                    it('placement states should end up with NO_FILL', function () {
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('premium', TestFixtures_1.TestFixtures.getCampaign());
                            campaignManager.onNoFill.trigger('premium');
                            return Promise.resolve();
                        });
                        chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.NOT_AVAILABLE);
                        chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.NOT_AVAILABLE);
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.NO_FILL);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onNoFill.trigger('video');
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.NO_FILL);
                        });
                    });
                    it('should invalidate campaigns', function () {
                        var campaign = TestFixtures_1.TestFixtures.getCampaign();
                        var placement = configuration.getPlacement('premium');
                        adUnitParams.campaign = campaign;
                        adUnitParams.placement = placement;
                        var currentAdUnit = new TestAdUnit(nativeBridge, adUnitParams);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('premium', TestFixtures_1.TestFixtures.getCampaign());
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            var tmpCampaign = campaignRefreshManager.getCampaign('premium');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                            }
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onCampaign.trigger('video', TestFixtures_1.TestFixtures.getCampaign());
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.READY);
                            campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                            currentAdUnit.onStart.trigger();
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('video'), undefined);
                        });
                    });
                    it('should set campaign status to ready after close', function () {
                        var campaign = TestFixtures_1.TestFixtures.getCampaign();
                        var campaign2 = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaign();
                        var placement = configuration.getPlacement('premium');
                        adUnitParams.campaign = campaign;
                        adUnitParams.placement = placement;
                        var currentAdUnit = new TestAdUnit(nativeBridge, adUnitParams);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('premium', campaign);
                            campaign = campaign2;
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            var tmpCampaign = campaignRefreshManager.getCampaign('premium');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                            }
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onCampaign.trigger('video', campaign);
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.READY);
                            campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                            currentAdUnit.onStart.trigger();
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('video'), undefined);
                            return campaignRefreshManager.refresh().then(function () {
                                var tmpCampaign2 = campaignRefreshManager.getCampaign('premium');
                                chai_1.assert.isDefined(tmpCampaign2);
                                if (tmpCampaign2) {
                                    chai_1.assert.equal(tmpCampaign2.getId(), '58dec182f01b1c0cdef54f0f');
                                }
                                chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.WAITING);
                                chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                                currentAdUnit.onClose.trigger();
                                chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                                chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                                campaignManager.onCampaign.trigger('video', campaign);
                                currentAdUnit.onClose.trigger();
                                chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.READY);
                                chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.READY);
                            });
                        });
                    });
                    it('campaign error should set no fill', function () {
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            var error = new Error('TestErrorMessage');
                            error.name = 'TestErrorMessage';
                            error.stack = 'TestErrorStack';
                            campaignManager.onError.trigger(error, ['premium', 'video'], 'test_diagnostics_type', undefined);
                            return Promise.resolve();
                        });
                        chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.NOT_AVAILABLE);
                        chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.NOT_AVAILABLE);
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                            chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_1.PlacementState.NO_FILL);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.NO_FILL);
                        });
                    });
                    it('should send diagnostics when campaign caching fails', function () {
                        sinon.stub(assetManager, 'setup').callsFake(function () {
                            throw Cache_1.CacheStatus.FAILED;
                        });
                        var receivedErrorType;
                        var receivedError;
                        var diagnosticsStub = sinon.stub(Diagnostics_1.Diagnostics, 'trigger').callsFake(function (type, error) {
                            receivedErrorType = type;
                            receivedError = error;
                        });
                        sinon.stub(request, 'post').callsFake(function () {
                            return Promise.resolve({
                                response: OnCometVideoPlcCampaign_json_1.default,
                                url: 'www.test.com',
                                responseCode: 200,
                                headers: []
                            });
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            diagnosticsStub.restore();
                            chai_1.assert.equal(receivedErrorType, 'campaign_caching_failed', 'Incorrect error type');
                        });
                    });
                    it('should send diagnostics when campaign request fails', function () {
                        var receivedErrorType;
                        var receivedError;
                        var diagnosticsStub = sinon.stub(Diagnostics_1.Diagnostics, 'trigger').callsFake(function (type, error) {
                            receivedErrorType = type;
                            receivedError = error;
                        });
                        sinon.stub(request, 'post').callsFake(function () {
                            return Promise.reject(new Error('test error'));
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            diagnosticsStub.restore();
                            chai_1.assert.equal(receivedErrorType, 'auction_request_failed', 'Incorrect error type');
                            chai_1.assert.equal(receivedError.error.message, 'test error', 'Incorrect error message');
                        });
                    });
                    it('should send diagnostics when campaign response content type is wrong', function () {
                        var receivedErrorType;
                        var receivedError;
                        var diagnosticsStub = sinon.stub(Diagnostics_1.Diagnostics, 'trigger').callsFake(function (type, error) {
                            receivedErrorType = type;
                            receivedError = error;
                        });
                        sinon.stub(request, 'post').callsFake(function () {
                            var json = JSON.parse(OnCometVideoPlcCampaign_json_1.default);
                            json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].contentType = 'wrong/contentType';
                            return Promise.resolve({
                                response: JSON.stringify(json),
                                url: 'www.test.com',
                                responseCode: 200,
                                headers: []
                            });
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            diagnosticsStub.restore();
                            chai_1.assert.equal(receivedErrorType, 'handle_campaign_error', 'Incorrect error type');
                            chai_1.assert.equal(receivedError.error.message, 'Unsupported content-type: wrong/contentType', 'Incorrect error message');
                        });
                    });
                    it('should send diagnostics when campaign response parsing fails because of wrong types', function () {
                        var receivedErrorType;
                        var receivedError;
                        var diagnosticsStub = sinon.stub(Diagnostics_1.Diagnostics, 'trigger').callsFake(function (type, error) {
                            receivedErrorType = type;
                            receivedError = error;
                        });
                        sinon.stub(request, 'post').callsFake(function () {
                            var json = JSON.parse(OnCometVideoPlcCampaign_json_1.default);
                            json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].contentType = 1;
                            return Promise.resolve({
                                response: JSON.stringify(json),
                                url: 'www.test.com',
                                responseCode: 200,
                                headers: []
                            });
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            diagnosticsStub.restore();
                            chai_1.assert.equal(receivedErrorType, 'error_creating_handle_campaign_chain', 'Incorrect error type');
                            chai_1.assert.equal(receivedError.error.message, 'model: AuctionResponse key: contentType with value: 1: integer is not in: string', 'Incorrect error message');
                        });
                    });
                });
                describe('On Promo', function () {
                    var sandbox;
                    beforeEach(function () {
                        sandbox = sinon.createSandbox();
                        var clientInfoPromoGame = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID, '00000');
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfoPromoGame, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        campaignRefreshManager = new OldCampaignRefreshManager_1.OldCampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, sessionManager, clientInfoPromoGame, request, cache);
                    });
                    afterEach(function () {
                        sandbox.restore();
                    });
                    it('should mark a placement for a promo campaign as ready', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('promoPlacement', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('promoPlacement'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('promoPlacement') instanceof PromoCampaign_1.PromoCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('promoPlacement');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                                chai_1.assert.equal(tmpCampaign.getAdType(), 'purchasing/iap');
                            }
                            chai_1.assert.equal(configuration.getPlacement('promoPlacement').getState(), Placement_1.PlacementState.READY);
                        });
                    });
                    it('should mark a placement for a promo campaign as nofill if product is not available', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(false);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('promoPlacement', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.equal(configuration.getPlacement('promoPlacement').getState(), Placement_1.PlacementState.NO_FILL);
                        });
                    });
                });
                describe('With mixed placement campaigns', function () {
                    var sandbox;
                    beforeEach(function () {
                        sandbox = sinon.createSandbox();
                        var clientInfoPromoGame = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID, '1003628');
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfoPromoGame, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        campaignRefreshManager = new OldCampaignRefreshManager_1.OldCampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, sessionManager, clientInfoPromoGame, request, cache);
                    });
                    afterEach(function () {
                        sandbox.restore();
                    });
                    it('should mark a placement for a mixed placement promo campaign as ready', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('mixedPlacement-promo'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('mixedPlacement-promo') instanceof PromoCampaign_1.PromoCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('mixedPlacement-promo');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                                chai_1.assert.equal(tmpCampaign.getAdType(), 'purchasing/iap');
                            }
                            chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.READY);
                        });
                    });
                    it('should mark a placement for a mixed placement promo campaign as nofill if product is not available', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(false);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.NO_FILL);
                        });
                    });
                    it('should mark a placement for a mixed placement with rewarded campaign as ready', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('testDashPlacement-rewarded', TestFixtures_1.TestFixtures.getCampaign());
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('testDashPlacement-rewarded'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('testDashPlacement-rewarded') instanceof PerformanceCampaign_1.PerformanceCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('testDashPlacement-rewarded');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                            }
                            chai_1.assert.equal(configuration.getPlacement('testDashPlacement-rewarded').getState(), Placement_1.PlacementState.READY);
                        });
                    });
                    it('should mark a placement for a mixed placement with rewardedpromo campaign as ready', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('rewardedPromoPlacement-rewardedpromo', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap', true));
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('rewardedPromoPlacement-rewardedpromo'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('rewardedPromoPlacement-rewardedpromo') instanceof PromoCampaign_1.PromoCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('rewardedPromoPlacement-rewardedpromo');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                            }
                            chai_1.assert.equal(configuration.getPlacement('rewardedPromoPlacement-rewardedpromo').getState(), Placement_1.PlacementState.READY);
                        });
                    });
                    it('if mixed placement is already marked as ready then any other mixed placement should be marked as nofill', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            campaignManager.onCampaign.trigger('testDashPlacement-rewarded', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            campaignManager.onCampaign.trigger('rewardedPromoPlacement-rewardedpromo', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            return Promise.resolve();
                        });
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.isDefined(campaignRefreshManager.getCampaign('mixedPlacement-promo'));
                            chai_1.assert.isTrue(campaignRefreshManager.getCampaign('mixedPlacement-promo') instanceof PromoCampaign_1.PromoCampaign);
                            var tmpCampaign = campaignRefreshManager.getCampaign('mixedPlacement-promo');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                                chai_1.assert.equal(tmpCampaign.getAdType(), 'purchasing/iap');
                            }
                            chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('testDashPlacement-rewarded').getState(), Placement_1.PlacementState.NO_FILL);
                            chai_1.assert.equal(configuration.getPlacement('rewardedPromoPlacement-rewardedpromo').getState(), Placement_1.PlacementState.NO_FILL);
                        });
                    });
                    it('should invalidate mixed rewarded campaigns and set suffixed placement as ready the second time onCampaign is triggered after being invalidated', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        var campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                        var placement = configuration.getPlacement('premium');
                        adUnitParams.campaign = campaign;
                        adUnitParams.placement = placement;
                        var currentAdUnit = new TestAdUnit(nativeBridge, adUnitParams);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            return Promise.resolve();
                        });
                        sinon.stub(campaignRefreshManager, 'shouldRefill').returns(true);
                        return campaignRefreshManager.refresh().then(function () {
                            var tmpCampaign = campaignRefreshManager.getCampaign('mixedPlacement-promo');
                            chai_1.assert.isDefined(tmpCampaign);
                            if (tmpCampaign) {
                                chai_1.assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                            }
                            chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onCampaign.trigger('video', TestFixtures_1.TestFixtures.getCampaign());
                            chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.READY);
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('mixedPlacement-rewarded'), undefined);
                            chai_1.assert.notEqual(campaignRefreshManager.getCampaign('mixedPlacement-promo'), undefined);
                            chai_1.assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                            campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                            currentAdUnit.onStart.trigger();
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('mixedPlacement'), undefined);
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('mixedPlacement-promo'), undefined);
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('video'), undefined);
                            campaignRefreshManager.refresh().then(function () {
                                var tmpCampaign2 = campaignRefreshManager.getCampaign('mixedPlacement-promo');
                                chai_1.assert.isDefined(tmpCampaign2);
                                if (tmpCampaign2) {
                                    chai_1.assert.equal(tmpCampaign2.getId(), '000000000000000000000123');
                                }
                                chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.WAITING);
                                chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                                currentAdUnit.onClose.trigger();
                                chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.READY);
                                chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            });
                        });
                    });
                    it('placement states should end up with NO_FILL if mixed', function () {
                        sandbox.stub(PurchasingUtilities_1.PurchasingUtilities, 'isProductAvailable').returns(true);
                        sinon.stub(campaignManager, 'request').callsFake(function () {
                            campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap'));
                            campaignManager.onNoFill.trigger('mixedPlacement-promo');
                            return Promise.resolve();
                        });
                        chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.NOT_AVAILABLE);
                        chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.NOT_AVAILABLE);
                        return campaignRefreshManager.refresh().then(function () {
                            chai_1.assert.equal(campaignRefreshManager.getCampaign('mixedPlacement-promo'), undefined);
                            chai_1.assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), Placement_1.PlacementState.NO_FILL);
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.WAITING);
                            campaignManager.onNoFill.trigger('video');
                            chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_1.PlacementState.NO_FILL);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25SZWZyZXNoTWFuYWdlclRlc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ2FtcGFpZ25SZWZyZXNoTWFuYWdlclRlc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFvREE7Z0JBQW1DLHlDQUFlO2dCQUFsRDs7Z0JBc0JBLENBQUM7Z0JBckJVLDRCQUFJLEdBQVgsVUFBWSxNQUFzQixFQUFFLEtBQWUsRUFBRSxhQUFzQixFQUFFLGdCQUE2QixFQUFFLGlCQUEwQixFQUFFLE9BQVk7b0JBQ2hKLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM3QixDQUFDO2dCQUNNLDZCQUFLLEdBQVo7b0JBQ0ksT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzdCLENBQUM7Z0JBQ00sbUNBQVcsR0FBbEIsVUFBbUIsYUFBZ0M7b0JBQy9DLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0IsQ0FBQztnQkFDTSxnQ0FBUSxHQUFmLFVBQWdCLGFBQXNCLEVBQUUsZ0JBQTZCO29CQUNqRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzNCLENBQUM7Z0JBQ00sZ0NBQVEsR0FBZjtvQkFDSSxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFDTSxvQ0FBWSxHQUFuQixVQUFvQixJQUFZLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFhLEVBQUUsTUFBYztvQkFDakYsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzdCLENBQUM7Z0JBQ00sZ0NBQVEsR0FBZjtvQkFDSSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzNCLENBQUM7Z0JBQ0wsb0JBQUM7WUFBRCxDQUFDLEFBdEJELENBQW1DLGlDQUFlLEdBc0JqRDs7WUFFRDtnQkFBZ0Msc0NBQWM7Z0JBQTlDOztnQkFnQkEsQ0FBQztnQkFmVSx5QkFBSSxHQUFYO29CQUNJLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM3QixDQUFDO2dCQUNNLHlCQUFJLEdBQVg7b0JBQ0ksT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzdCLENBQUM7Z0JBQ00sZ0NBQVcsR0FBbEI7b0JBQ0ksT0FBTyxZQUFZLENBQUM7Z0JBQ3hCLENBQUM7Z0JBQ00sOEJBQVMsR0FBaEI7b0JBQ0ksT0FBTyxJQUFJLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQ00sNkJBQVEsR0FBZjtvQkFDSSxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFDTCxpQkFBQztZQUFELENBQUMsQUFoQkQsQ0FBZ0MsK0JBQWMsR0FnQjdDOztZQUVELFFBQVEsQ0FBQyx3QkFBd0IsRUFBRTtnQkFDL0IsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxhQUE0QixDQUFDO2dCQUNqQyxJQUFJLGVBQWdDLENBQUM7Z0JBQ3JDLElBQUksYUFBNEIsQ0FBQztnQkFDakMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLHNCQUE4QyxDQUFDO2dCQUNuRCxJQUFJLFNBQTBCLENBQUM7Z0JBQy9CLElBQUksc0JBQXNDLENBQUM7Z0JBQzNDLElBQUksZUFBZ0MsQ0FBQztnQkFDckMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFlBQXlDLENBQUM7Z0JBQzlDLElBQUkscUJBQTRDLENBQUM7Z0JBQ2pELElBQUksa0JBQXNDLENBQUM7Z0JBQzNDLElBQUksZ0JBQWtDLENBQUM7Z0JBQ3ZDLElBQUksS0FBWSxDQUFDO2dCQUNqQixJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksV0FBd0IsQ0FBQztnQkFDN0IsSUFBSSwyQkFBd0QsQ0FBQztnQkFDN0QsSUFBSSxnQkFBa0MsQ0FBQztnQkFFdkMsVUFBVSxDQUFDO29CQUNQLFVBQVUsR0FBRywyQkFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUMxQyxVQUFVLEdBQUcsMkJBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztvQkFDMUMsWUFBWSxHQUFzQjt3QkFDOUIsU0FBUyxFQUFFOzRCQUNQLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7eUJBQ2pDO3dCQUNELFFBQVEsRUFBRTs0QkFDTiw4QkFBOEIsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFOzRCQUMzQyxjQUFjLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRTt5QkFDOUI7d0JBQ0QsT0FBTyxFQUFFOzRCQUNMLEdBQUcsRUFBRSxVQUFDLFdBQW1CLEVBQUUsR0FBVztnQ0FDbEMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNsQyxDQUFDOzRCQUNELEdBQUcsRUFBRTtnQ0FDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzs0QkFDN0IsQ0FBQzs0QkFDRCxLQUFLLEVBQUU7Z0NBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQzdCLENBQUM7NEJBQ0QsTUFBTSxFQUFFO2dDQUNKLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUM3QixDQUFDOzRCQUNELE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQ2xELEtBQUssRUFBRSxJQUFJLHdCQUFXLEVBQUU7eUJBQzNCO3dCQUNELE9BQU8sRUFBRTs0QkFDTCxVQUFVLEVBQUU7Z0NBQ1IsU0FBUyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7NkJBQ3pCOzRCQUNELFFBQVEsRUFBRTtnQ0FDTixTQUFTLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRTs2QkFDekI7eUJBQ0o7d0JBQ0QsS0FBSyxFQUFFOzRCQUNILG1CQUFtQixFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7NEJBQ2hDLGlCQUFpQixFQUFFLElBQUksd0JBQVcsRUFBRTs0QkFDcEMsa0JBQWtCLEVBQUUsSUFBSSx3QkFBVyxFQUFFOzRCQUNyQyxhQUFhLEVBQUUsSUFBSSx3QkFBVyxFQUFFOzRCQUNoQyxpQkFBaUIsRUFBRSxJQUFJLHdCQUFXLEVBQUU7NEJBQ3BDLGVBQWUsRUFBRSxJQUFJLHdCQUFXLEVBQUU7eUJBQ3JDO3dCQUNELEdBQUcsRUFBRTs0QkFDRCxVQUFVLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRTs0QkFDdkIsT0FBTyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUU7NEJBQ3BCLFFBQVEsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFOzRCQUNyQixRQUFRLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRTt5QkFDeEI7d0JBQ0QsWUFBWSxFQUFFOzRCQUNWLFdBQVcsRUFBRSxJQUFJLHdCQUFXLEVBQUU7eUJBQ2pDO3dCQUNELFNBQVMsRUFBRTs0QkFDUCxpQkFBaUIsRUFBRSxJQUFJLHdCQUFXLEVBQUU7eUJBQ3ZDO3dCQUNELFlBQVksRUFBRTs0QkFDVixjQUFjLEVBQUUsSUFBSSx3QkFBVyxFQUFFO3lCQUNwQzt3QkFDRCxVQUFVLEVBQUU7NEJBQ1IsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOzRCQUNoRSxjQUFjLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN4RCxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7eUJBQ25FO3dCQUNELFNBQVMsRUFBRTs0QkFDUCxpQkFBaUIsRUFBRSxJQUFJLHdCQUFXLEVBQUU7NEJBQ3BDLGdCQUFnQixFQUFFLElBQUksd0JBQVcsRUFBRTs0QkFDbkMsbUJBQW1CLEVBQUUsSUFBSSx3QkFBVyxFQUFFO3lCQUN6Qzt3QkFDRCxXQUFXLEVBQUU7NEJBQ1QsT0FBTyxtQkFBUSxDQUFDLElBQUksQ0FBQzt3QkFDekIsQ0FBQztxQkFDSixDQUFDO29CQUVGLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxDQUFDO29CQUM5RCx5Q0FBbUIsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDMUYsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDOUMsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQzlELE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUNuRCxzQkFBc0IsR0FBRyxJQUFJLCtDQUFzQixDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDM0UsY0FBYyxHQUFHLElBQUksK0JBQWMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQzNELFVBQVUsR0FBRywyQkFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQ2pELGdCQUFnQixHQUFHLElBQUksbUNBQWdCLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3RELDJCQUEyQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx5REFBMkIsQ0FBQyxDQUFDO29CQUNwRixLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztvQkFDdkcsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxLQUFLLEVBQUUseUJBQVMsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUN2RyxTQUFTLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztvQkFDaEMsSUFBTSxRQUFRLEdBQUcsMkJBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDNUMscUJBQXFCLEdBQUcsMkRBQTRCLENBQUMsMkJBQTJCLENBQUM7d0JBQzdFLFlBQVksRUFBRSxZQUFZO3dCQUMxQixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsZUFBZSxFQUFFLGVBQWU7d0JBQ2hDLGNBQWMsRUFBRSxjQUFjO3dCQUM5QixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixRQUFRLEVBQUUsUUFBUTtxQkFDckIsQ0FBQyxDQUFDO29CQUNILGtCQUFrQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx1Q0FBa0IsQ0FBQyxDQUFDO29CQUNoRCxrQkFBa0IsQ0FBQyxrQkFBbUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLHlCQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ25GLGtCQUFrQixDQUFDLGlCQUFrQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUkseUNBQW1CLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBRTVHLFdBQVcsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxDQUFDO29CQUVwRCxZQUFZLEdBQUc7d0JBQ1gsZ0JBQWdCLEVBQUUsNkJBQVcsQ0FBQyxJQUFJO3dCQUNsQyxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLFVBQVUsRUFBRSxVQUFVO3dCQUN0QixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsc0JBQXNCLEVBQUUsc0JBQXNCO3dCQUM5QyxxQkFBcUIsRUFBRSxxQkFBcUI7d0JBQzVDLFNBQVMsRUFBRSwyQkFBWSxDQUFDLFlBQVksRUFBRTt3QkFDdEMsUUFBUSxFQUFFLFFBQVE7d0JBQ2xCLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsT0FBTyxFQUFFLEVBQUU7d0JBQ1gsV0FBVyxFQUFFLFdBQVc7d0JBQ3hCLDJCQUEyQixFQUFFLDJCQUEyQjtxQkFDM0QsQ0FBQztvQkFFRiwrQkFBYyxDQUFDLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxDQUFDLHdEQUF3RDtvQkFDcEcsYUFBYSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyw2QkFBYSxDQUFDLENBQUM7b0JBQ3hELGFBQWEsQ0FBQyxzQkFBc0IsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNuRSxhQUFhLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSx1QkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQzNFLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyxlQUFlLEVBQUU7b0JBQ3RCLFVBQVUsQ0FBQzt3QkFDUCxhQUFhLEdBQUcseUNBQW1CLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsc0NBQXVCLENBQUMsQ0FBQyxDQUFDO3dCQUMvRSxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQ3hNLHNCQUFzQixHQUFHLElBQUkscURBQXlCLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDbEwsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHNDQUFzQyxFQUFFO3dCQUN2QyxhQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDM0UsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHFEQUFxRCxFQUFFO3dCQUN0RCxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQzdDLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSwyQkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7NEJBQzFFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDekMsYUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQzFFLGFBQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxZQUFZLHlDQUFtQixDQUFDLENBQUM7NEJBRTVGLElBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDbEUsYUFBTSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7NEJBQ3hDLElBQUksV0FBVyxFQUFFO2dDQUNiLGFBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLDBCQUEwQixDQUFDLENBQUM7NkJBQ2pFOzRCQUVELGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNyRixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFFckYsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLDJCQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzs0QkFDeEUsYUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ3hFLGFBQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxZQUFZLHlDQUFtQixDQUFDLENBQUM7NEJBQzFGLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNyRixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdkYsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLGdEQUFnRCxFQUFFO3dCQUNqRCxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQzdDLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSwyQkFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQzs0QkFDaEYsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQzdCLENBQUMsQ0FBQyxDQUFDO3dCQUVILE9BQU8sc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUN6QyxhQUFNLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDMUUsYUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksK0JBQWMsQ0FBQyxDQUFDOzRCQUV2RixJQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ2xFLGFBQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDOzRCQUN4QyxJQUFJLFdBQVcsRUFBRTtnQ0FDYixhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDOzZCQUNqRTs0QkFFRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDckYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBRXJGLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSwyQkFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQzs0QkFDOUUsYUFBTSxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ3hFLGFBQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxZQUFZLCtCQUFjLENBQUMsQ0FBQzs0QkFDckYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3JGLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2RixDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsOENBQThDLEVBQUU7d0JBQy9DLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDN0MsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLDJCQUFZLENBQUMsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDOzRCQUN2RixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDN0IsQ0FBQyxDQUFDLENBQUM7d0JBRUgsT0FBTyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7NEJBQ3pDLGFBQU0sQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQ2hFLGFBQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxZQUFZLDJCQUFZLENBQUMsQ0FBQzs0QkFFckYsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUNsRSxhQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUM5QixJQUFJLFdBQVcsRUFBRTtnQ0FDYixhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzs2QkFDOUM7NEJBRUQsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3JGLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUVyRixlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsMkJBQVksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7NEJBRXJGLGFBQU0sQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7NEJBQzlELGFBQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxZQUFZLDJCQUFZLENBQUMsQ0FBQzs0QkFDbkYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3JGLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN2RixDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsK0NBQStDLEVBQUU7d0JBQ2hELElBQU0sS0FBSyxHQUFHLDJCQUFZLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzt3QkFFdEQsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM3QyxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7NEJBQ3JELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDekMsYUFBTSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQzs0QkFDaEUsYUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFlBQVksNkJBQWEsQ0FBQyxDQUFDOzRCQUV0RixJQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ2xFLGFBQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzlCLElBQUksV0FBVyxFQUFFO2dDQUNiLGFBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLDBCQUEwQixDQUFDLENBQUM7NkJBQ2pFOzRCQUVELGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNyRixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFFckYsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDOzRCQUNuRCxhQUFNLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzRCQUM5RCxhQUFNLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsWUFBWSw2QkFBYSxDQUFDLENBQUM7NEJBQ3BGLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNyRixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdkYsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFO3dCQUNyQixJQUFJLFFBQVEsR0FBYSwyQkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUVwRCxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQzdDLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFDeEQsUUFBUSxHQUFHLDJCQUFZLENBQUMsd0JBQXdCLEVBQUUsQ0FBQzs0QkFDbkQsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQzdCLENBQUMsQ0FBQyxDQUFDO3dCQUVILE9BQU8sc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUN6QyxJQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7NEJBQ2xFLGFBQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzlCLElBQUksV0FBVyxFQUFFO2dDQUNiLGFBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLDBCQUEwQixDQUFDLENBQUM7NkJBQ2pFOzRCQUVELGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNyRixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFFckYsT0FBTyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0NBQ3pDLElBQU0sWUFBWSxHQUFHLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQ0FDbkUsYUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQ0FDL0IsSUFBSSxZQUFZLEVBQUU7b0NBQ2QsYUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEVBQUUsMEJBQTBCLENBQUMsQ0FBQztpQ0FDckU7Z0NBRUQsSUFBTSxZQUFZLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dDQUNuRSxhQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dDQUMvQixJQUFJLFlBQVksRUFBRTtvQ0FDZCxhQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO2lDQUNsRTtnQ0FFRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQ0FDckYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQ3pGLENBQUMsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRTt3QkFDOUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM3QyxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsMkJBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDOzRCQUMxRSxlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDNUMsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQzdCLENBQUMsQ0FBQyxDQUFDO3dCQUVILGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLGFBQWEsQ0FBQyxDQUFDO3dCQUM3RixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFFM0YsT0FBTyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7NEJBQ3pDLGFBQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUN2RSxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDdkYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBRXJGLGVBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUUxQyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDekYsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFO3dCQUM5QixJQUFNLFFBQVEsR0FBRywyQkFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO3dCQUM1QyxJQUFNLFNBQVMsR0FBYyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNuRSxZQUFZLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzt3QkFDakMsWUFBWSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7d0JBQ25DLElBQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQzt3QkFFakUsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM3QyxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsMkJBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDOzRCQUMxRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDN0IsQ0FBQyxDQUFDLENBQUM7d0JBRUgsT0FBTyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7NEJBQ3pDLElBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs0QkFDbEUsYUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQzs0QkFDOUIsSUFBSSxXQUFXLEVBQUU7Z0NBQ2IsYUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsMEJBQTBCLENBQUMsQ0FBQzs2QkFDakU7NEJBRUQsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3JGLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUVyRixlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsMkJBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDOzRCQUV4RSxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDckYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRW5GLHNCQUFzQixDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDOzRCQUN2RCxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUVoQyxhQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDdkUsYUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQ3pFLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBRSxpREFBaUQsRUFBRTt3QkFDbkQsSUFBSSxRQUFRLEdBQWEsMkJBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFDcEQsSUFBTSxTQUFTLEdBQUcsMkJBQVksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO3dCQUMxRCxJQUFNLFNBQVMsR0FBYyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNuRSxZQUFZLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQzt3QkFDakMsWUFBWSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7d0JBQ25DLElBQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQzt3QkFFakUsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM3QyxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQ3hELFFBQVEsR0FBRyxTQUFTLENBQUM7NEJBQ3JCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDekMsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDOzRCQUNsRSxhQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUM5QixJQUFJLFdBQVcsRUFBRTtnQ0FDYixhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDOzZCQUNqRTs0QkFFRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDckYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBRXJGLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQzs0QkFFdEQsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3JGLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUVuRixzQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDdkQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzs0QkFFaEMsYUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ3ZFLGFBQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUVyRSxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztnQ0FDekMsSUFBTSxZQUFZLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dDQUNuRSxhQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dDQUMvQixJQUFJLFlBQVksRUFBRTtvQ0FDZCxhQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO2lDQUNsRTtnQ0FFRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQ0FDdkYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7Z0NBRXJGLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0NBRWhDLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUNyRixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQ0FFckYsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dDQUN0RCxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dDQUVoQyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQ0FDckYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3ZGLENBQUMsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxtQ0FBbUMsRUFBRTt3QkFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM3QyxJQUFNLEtBQUssR0FBVSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOzRCQUNuRCxLQUFLLENBQUMsSUFBSSxHQUFHLGtCQUFrQixDQUFDOzRCQUNoQyxLQUFLLENBQUMsS0FBSyxHQUFHLGdCQUFnQixDQUFDOzRCQUMvQixlQUFlLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ2pHLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDN0YsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBRTNGLE9BQU8sc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUN6QyxhQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDdkUsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBQ3ZGLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN6RixDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMscURBQXFELEVBQUU7d0JBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDeEMsTUFBTSxtQkFBVyxDQUFDLE1BQU0sQ0FBQzt3QkFDN0IsQ0FBQyxDQUFDLENBQUM7d0JBRUgsSUFBSSxpQkFBeUIsQ0FBQzt3QkFDOUIsSUFBSSxhQUFrQixDQUFDO3dCQUV2QixJQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLHlCQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQUMsSUFBWSxFQUFFLEtBQVM7NEJBQ3pGLGlCQUFpQixHQUFHLElBQUksQ0FBQzs0QkFDekIsYUFBYSxHQUFHLEtBQUssQ0FBQzt3QkFDMUIsQ0FBQyxDQUFDLENBQUM7d0JBRUgsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUNsQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQW1CO2dDQUNyQyxRQUFRLEVBQUUsc0NBQXVCO2dDQUNqQyxHQUFHLEVBQUUsY0FBYztnQ0FDbkIsWUFBWSxFQUFFLEdBQUc7Z0NBQ2pCLE9BQU8sRUFBRSxFQUFFOzZCQUNkLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDekMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUMxQixhQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFHLHlCQUF5QixFQUFFLHNCQUFzQixDQUFDLENBQUM7d0JBQ3hGLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxxREFBcUQsRUFBRTt3QkFDdEQsSUFBSSxpQkFBeUIsQ0FBQzt3QkFDOUIsSUFBSSxhQUFrQixDQUFDO3dCQUV2QixJQUFNLGVBQWUsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLHlCQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQUMsSUFBWSxFQUFFLEtBQVM7NEJBQ3pGLGlCQUFpQixHQUFHLElBQUksQ0FBQzs0QkFDekIsYUFBYSxHQUFHLEtBQUssQ0FBQzt3QkFDMUIsQ0FBQyxDQUFDLENBQUM7d0JBRUgsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUNsQyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQzt3QkFDbkQsQ0FBQyxDQUFDLENBQUM7d0JBRUgsT0FBTyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7NEJBQ3pDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs0QkFDMUIsYUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRyx3QkFBd0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDOzRCQUNuRixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFHLFlBQVksRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO3dCQUN4RixDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsc0VBQXNFLEVBQUU7d0JBQ3ZFLElBQUksaUJBQXlCLENBQUM7d0JBQzlCLElBQUksYUFBa0IsQ0FBQzt3QkFFdkIsSUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyx5QkFBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFDLElBQVksRUFBRSxLQUFTOzRCQUN6RixpQkFBaUIsR0FBRyxJQUFJLENBQUM7NEJBQ3pCLGFBQWEsR0FBRyxLQUFLLENBQUM7d0JBQzFCLENBQUMsQ0FBQyxDQUFDO3dCQUVILEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDbEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQ0FBdUIsQ0FBQyxDQUFDOzRCQUNqRCxJQUFJLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUMsV0FBVyxHQUFHLG1CQUFtQixDQUFDOzRCQUN4RixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQW1CO2dDQUNyQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7Z0NBQzlCLEdBQUcsRUFBRSxjQUFjO2dDQUNuQixZQUFZLEVBQUUsR0FBRztnQ0FDakIsT0FBTyxFQUFFLEVBQUU7NkJBQ2QsQ0FBQyxDQUFDO3dCQUNQLENBQUMsQ0FBQyxDQUFDO3dCQUVILE9BQU8sc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUN6QyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQzFCLGFBQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUcsdUJBQXVCLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzs0QkFDbEYsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRyw2Q0FBNkMsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO3dCQUN6SCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMscUZBQXFGLEVBQUU7d0JBQ3RGLElBQUksaUJBQXlCLENBQUM7d0JBQzlCLElBQUksYUFBa0IsQ0FBQzt3QkFFdkIsSUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyx5QkFBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFDLElBQVksRUFBRSxLQUFTOzRCQUN6RixpQkFBaUIsR0FBRyxJQUFJLENBQUM7NEJBQ3pCLGFBQWEsR0FBRyxLQUFLLENBQUM7d0JBQzFCLENBQUMsQ0FBQyxDQUFDO3dCQUVILEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDbEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQ0FBdUIsQ0FBQyxDQUFDOzRCQUNqRCxJQUFJLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQzs0QkFDdEUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFtQjtnQ0FDckMsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO2dDQUM5QixHQUFHLEVBQUUsY0FBYztnQ0FDbkIsWUFBWSxFQUFFLEdBQUc7Z0NBQ2pCLE9BQU8sRUFBRSxFQUFFOzZCQUNkLENBQUMsQ0FBQzt3QkFDUCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDekMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDOzRCQUMxQixhQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUFFLHNDQUFzQyxFQUFFLHNCQUFzQixDQUFDLENBQUM7NEJBQ2hHLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsa0ZBQWtGLEVBQUUseUJBQXlCLENBQUMsQ0FBQzt3QkFDN0osQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLFVBQVUsRUFBRTtvQkFDakIsSUFBSSxPQUEyQixDQUFDO29CQUNoQyxVQUFVLENBQUM7d0JBQ1AsT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQzt3QkFDaEMsSUFBTSxtQkFBbUIsR0FBRywyQkFBWSxDQUFDLGFBQWEsQ0FBQyxtQkFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDbEYsYUFBYSxHQUFHLHlDQUFtQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLDJDQUE0QixDQUFDLENBQUMsQ0FBQzt3QkFDcEYsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQ2pOLHNCQUFzQixHQUFHLElBQUkscURBQXlCLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUMzTCxDQUFDLENBQUMsQ0FBQztvQkFFSCxTQUFTLENBQUM7d0JBQ04sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsdURBQXVELEVBQUU7d0JBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMseUNBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3RFLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDN0MsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsMkJBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7NEJBQ3RHLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDekMsYUFBTSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDOzRCQUN2RSxhQUFNLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLDZCQUFhLENBQUMsQ0FBQzs0QkFFN0YsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7NEJBQ3pFLGFBQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzlCLElBQUksV0FBVyxFQUFFO2dDQUNiLGFBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLDBCQUEwQixDQUFDLENBQUM7Z0NBQzlELGFBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7NkJBQzNEOzRCQUVELGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2hHLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxvRkFBb0YsRUFBRTt3QkFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyx5Q0FBbUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDdkUsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM3QyxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSwyQkFBWSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQzs0QkFDdEcsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQzdCLENBQUMsQ0FBQyxDQUFDO3dCQUVILE9BQU8sc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUN6QyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNsRyxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsZ0NBQWdDLEVBQUU7b0JBQ3ZDLElBQUksT0FBMkIsQ0FBQztvQkFDaEMsVUFBVSxDQUFDO3dCQUNQLE9BQU8sR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7d0JBQ2hDLElBQU0sbUJBQW1CLEdBQUcsMkJBQVksQ0FBQyxhQUFhLENBQUMsbUJBQVEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQ3BGLGFBQWEsR0FBRyx5Q0FBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQywyQ0FBNEIsQ0FBQyxDQUFDLENBQUM7d0JBQ3BGLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUNqTixzQkFBc0IsR0FBRyxJQUFJLHFEQUF5QixDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLG1CQUFtQixFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDM0wsQ0FBQyxDQUFDLENBQUM7b0JBRUgsU0FBUyxDQUFDO3dCQUNOLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDdEIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHVFQUF1RSxFQUFFO3dCQUN4RSxPQUFPLENBQUMsSUFBSSxDQUFDLHlDQUFtQixFQUFFLG9CQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN0RSxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQzdDLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLDJCQUFZLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDOzRCQUM1RyxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDN0IsQ0FBQyxDQUFDLENBQUM7d0JBRUgsT0FBTyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7NEJBQ3pDLGFBQU0sQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQzs0QkFDN0UsYUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsWUFBWSw2QkFBYSxDQUFDLENBQUM7NEJBRW5HLElBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzRCQUMvRSxhQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUM5QixJQUFJLFdBQVcsRUFBRTtnQ0FDYixhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO2dDQUM5RCxhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDOzZCQUMzRDs0QkFFRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN0RyxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsb0dBQW9HLEVBQUU7d0JBQ3JHLE9BQU8sQ0FBQyxJQUFJLENBQUMseUNBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3ZFLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDN0MsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsMkJBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7NEJBQzVHLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDekMsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDeEcsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLCtFQUErRSxFQUFFO3dCQUNoRixPQUFPLENBQUMsSUFBSSxDQUFDLHlDQUFtQixFQUFFLG9CQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN0RSxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQzdDLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLDRCQUE0QixFQUFFLDJCQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzs0QkFDN0YsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQzdCLENBQUMsQ0FBQyxDQUFDO3dCQUVILE9BQU8sc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUN6QyxhQUFNLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7NEJBQ25GLGFBQU0sQ0FBQyxNQUFNLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLDRCQUE0QixDQUFDLFlBQVkseUNBQW1CLENBQUMsQ0FBQzs0QkFFL0csSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLDRCQUE0QixDQUFDLENBQUM7NEJBQ3JGLGFBQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzlCLElBQUksV0FBVyxFQUFFO2dDQUNiLGFBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLDBCQUEwQixDQUFDLENBQUM7NkJBQ2pFOzRCQUVELGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQzVHLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxvRkFBb0YsRUFBRTt3QkFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyx5Q0FBbUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdEUsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM3QyxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsRUFBRSwyQkFBWSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ2xJLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxPQUFPLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQzs0QkFDekMsYUFBTSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDOzRCQUM3RixhQUFNLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxzQ0FBc0MsQ0FBQyxZQUFZLDZCQUFhLENBQUMsQ0FBQzs0QkFFbkgsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7NEJBQy9GLGFBQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQzlCLElBQUksV0FBVyxFQUFFO2dDQUNiLGFBQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLDBCQUEwQixDQUFDLENBQUM7NkJBQ2pFOzRCQUVELGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ3RILENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyx5R0FBeUcsRUFBRTt3QkFDMUcsT0FBTyxDQUFDLElBQUksQ0FBQyx5Q0FBbUIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdEUsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUM3QyxlQUFlLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSwyQkFBWSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQzs0QkFDNUcsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsNEJBQTRCLEVBQUUsMkJBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7NEJBQ2xILGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxFQUFFLDJCQUFZLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDOzRCQUM1SCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDN0IsQ0FBQyxDQUFDLENBQUM7d0JBRUgsT0FBTyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7NEJBQ3pDLGFBQU0sQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQzs0QkFDN0UsYUFBTSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsWUFBWSw2QkFBYSxDQUFDLENBQUM7NEJBRW5HLElBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzRCQUMvRSxhQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUM5QixJQUFJLFdBQVcsRUFBRTtnQ0FDYixhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO2dDQUM5RCxhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDOzZCQUMzRDs0QkFFRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNsRyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUMxRyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN4SCxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsZ0pBQWdKLEVBQUU7d0JBQ2pKLE9BQU8sQ0FBQyxJQUFJLENBQUMseUNBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3RFLElBQU0sUUFBUSxHQUFHLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzt3QkFDakQsSUFBTSxTQUFTLEdBQWMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFDbkUsWUFBWSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7d0JBQ2pDLFlBQVksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO3dCQUNuQyxJQUFNLGFBQWEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7d0JBRWpFLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0QkFDN0MsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsMkJBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7NEJBQzVHLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUM3QixDQUFDLENBQUMsQ0FBQzt3QkFFSCxLQUFLLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFFakUsT0FBTyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7NEJBQ3pDLElBQU0sV0FBVyxHQUFHLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzRCQUMvRSxhQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUM5QixJQUFJLFdBQVcsRUFBRTtnQ0FDYixhQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDOzZCQUNqRTs0QkFFRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNsRyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFFckYsZUFBZSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLDJCQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQzs0QkFFeEUsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDbEcsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRW5GLGFBQU0sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLHlCQUF5QixDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ3ZGLGFBQU0sQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBQ3ZGLGFBQU0sQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUV4RSxzQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDdkQsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzs0QkFFaEMsYUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDOUUsYUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsc0JBQXNCLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQzs0QkFDcEYsYUFBTSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7NEJBRXJFLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQztnQ0FDbEMsSUFBTSxZQUFZLEdBQUcsc0JBQXNCLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0NBQ2hGLGFBQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7Z0NBQy9CLElBQUksWUFBWSxFQUFFO29DQUNkLGFBQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxFQUFFLDBCQUEwQixDQUFDLENBQUM7aUNBQ2xFO2dDQUVELGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7Z0NBQ3BHLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dDQUVyRixhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dDQUVoQyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dDQUNsRyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFDekYsQ0FBQyxDQUFDLENBQUM7d0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHNEQUFzRCxFQUFFO3dCQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLHlDQUFtQixFQUFFLG9CQUFvQixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN0RSxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQzdDLGVBQWUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLDJCQUFZLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDOzRCQUM1RyxlQUFlLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOzRCQUN6RCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDN0IsQ0FBQyxDQUFDLENBQUM7d0JBRUgsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLHNCQUFzQixDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDMUcsYUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLDBCQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7d0JBRTNGLE9BQU8sc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDOzRCQUN6QyxhQUFNLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDOzRCQUVwRixhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUVwRyxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsMEJBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQzs0QkFFckYsZUFBZSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7NEJBRTFDLGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUN6RixDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=