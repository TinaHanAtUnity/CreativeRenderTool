import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { SDKMetrics, LoadMetric } from 'Ads/Utilities/SDKMetrics';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { ILoadedCampaign } from 'Ads/Managers/CampaignManager';

describe('PerPlacementLoadManagerTest', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let campaignManager: LegacyCampaignManager;
    let wakeUpManager: WakeUpManager;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let ads: IAdsApi;
    let request: RequestManager;
    let storageBridge: StorageBridge;
    let assetManager: AssetManager;
    let sessionManager: SessionManager;
    let loadManager: PerPlacementLoadManager;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let adMobSignalFactory: AdMobSignalFactory;
    let cacheBookkeeping: CacheBookkeepingManager;
    let cache: CacheManager;
    let campaignParserManager: ContentTypeHandlerManager;
    let privacySDK: PrivacySDK;
    let userPrivacyManager: UserPrivacyManager;

    beforeEach(() => {
        platform = Platform.ANDROID;
        clientInfo = TestFixtures.getClientInfo();
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core.Api);
        privacySDK = TestFixtures.getPrivacySDK(core.Api);

        sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        campaignParserManager = sinon.createStubInstance(ContentTypeHandlerManager);
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);

        coreConfig = CoreConfigurationParser.parse(ConfigurationAuctionPlc);
        adsConfig = AdsConfigurationParser.parse(ConfigurationAuctionPlc);

        storageBridge = new StorageBridge(core.Api);
        focusManager = new FocusManager(platform, core.Api);
        metaDataManager = new MetaDataManager(core.Api);
        wakeUpManager = new WakeUpManager(core.Api);
        request = new RequestManager(platform, core.Api, wakeUpManager);
        sessionManager = new SessionManager(core.Api, request, storageBridge);
        cacheBookkeeping = new CacheBookkeepingManager(core.Api);
        cache = new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping);
        assetManager = new AssetManager(platform, core.Api, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        userPrivacyManager = new UserPrivacyManager(platform, core.Api, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
        campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, userPrivacyManager);
        loadManager = new PerPlacementLoadManager(ads, adsConfig, coreConfig, campaignManager, clientInfo, focusManager);
    });

    describe('getCampaign and initialize', () => {
        describe('without loading placement IDs', () => {
            adsConfig = AdsConfigurationParser.parse(ConfigurationAuctionPlc);
            adsConfig.getPlacementIds().forEach((placementId) => {
                it(`should return undefined with placementID '${placementId}' before campaigns are loaded`, () => {
                    assert.isUndefined(loadManager.getCampaign(placementId), `PlacementID '${placementId}' was defined prior to loading`);
                });
            });
        });

        describe('with loading placement IDs', () => {
            let placementId: string;
            let sandbox: sinon.SinonSandbox;
            let loadCampaignStub: sinon.SinonStub;
            let sendReadyEventStub: sinon.SinonStub;

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                placementId = 'premium';
                loadCampaignStub = sandbox.stub(campaignManager, 'loadCampaign');
                sendReadyEventStub = sandbox.stub(ads.Listener, 'sendReadyEvent');

                // To silence diagnostic messages
                sandbox.stub(Diagnostics, 'trigger').callsFake(() => {
                    return Promise.resolve(<INativeResponse>{});
                });
                return loadManager.initialize();
            });

            afterEach(() => {
                sandbox.restore();
            });

            // The actual values don't matter, only that they are different campaigns
            const tests: {
                expectedCampaign: Campaign;
                unexpectedCampaign: Campaign;
            }[] = [{
                expectedCampaign: TestFixtures.getCampaign(),
                unexpectedCampaign: TestFixtures.getXPromoCampaign()
            }, {
                expectedCampaign: TestFixtures.getXPromoCampaign(),
                unexpectedCampaign: TestFixtures.getCampaign()
            }];

            tests.forEach((t) => {
                it('should load/overwrite the correct campaign', (done) => {
                    loadCampaignStub.callsFake(() => {
                        return Promise.resolve(<ILoadedCampaign>{
                            campaign: t.expectedCampaign,
                            trackingUrls: {}
                        });
                    });
                    const setPlacementStateStub = sandbox.stub(ads.Placement, 'setPlacementState');
                    setPlacementStateStub.callsFake((id: string, state: PlacementState) => {
                        if (placementId === id && state !== PlacementState.WAITING) {
                            const testCampaign = loadManager.getCampaign(placementId);
                            sinon.assert.called(loadCalledKafkaStub);
                            assert.instanceOf(testCampaign, Campaign, `Campaign with placementID '${placementId}' was not a defined Campaign`);
                            assert.equal(testCampaign, t.expectedCampaign, 'Loaded campaign was not the correct campaign');
                            assert.notEqual(testCampaign, t.unexpectedCampaign, 'Loaded campaign was not the correct campaign');
                            assert.isUndefined(loadManager.getCampaign('banner'), 'Campaign with placementID \'banner\' was loaded incorrectly');
                            done();
                        }
                    });
                    const loadDict: {[key: string]: number} = {};
                    loadDict[placementId] = 1;
                    ads.LoadApi.onLoad.trigger(loadDict);
                });
            });

            it('should set the placement state to nofill', (done) => {
                loadCampaignStub.callsFake(() => {
                    return Promise.resolve(undefined);
                });
                const setPlacementStateStub = sandbox.stub(ads.Placement, 'setPlacementState');
                setPlacementStateStub.callsFake((id: string, state: PlacementState) => {
                    if (placementId === id && state !== PlacementState.WAITING) {
                        const testCampaign = loadManager.getCampaign(placementId);
                        assert.isUndefined(testCampaign, 'Loaded campaign was defined');
                        sinon.assert.calledWith(setPlacementStateStub, placementId, PlacementState.NO_FILL);
                        done();
                    }
                });
                const loadDict: {[key: string]: number} = {};
                loadDict[placementId] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);
            });

            it('should not attempt to load a campaign for a placement that\'s waiting', () => {
                const placement = adsConfig.getPlacement(placementId);
                placement.setState(PlacementState.WAITING);

                const loadDict: {[key: string]: number} = {};
                loadDict[placementId] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);

                sinon.assert.called(loadCalledKafkaStub);
                sinon.assert.notCalled(loadCampaignStub);
                sinon.assert.notCalled(sendReadyEventStub);
                sinon.assert.calledWith(<sinon.SinonStub>SDKMetrics.reportMetricEvent, LoadMetric.LoadAuctionRequestBlocked);
            });

            it('should not attempt to load a campaign that\'s ready and not expired', () => {
                const campaign = TestFixtures.getCampaign();
                const placement = adsConfig.getPlacement(placementId);
                campaign.set('willExpireAt', Date.now() + 100);
                placement.setState(PlacementState.READY);
                placement.setCurrentCampaign(campaign);

                const loadDict: {[key: string]: number} = {};
                loadDict[placementId] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);

                sinon.assert.called(loadCalledKafkaStub);
                sinon.assert.notCalled(loadCampaignStub);
                sinon.assert.calledWith(sendReadyEventStub, placementId);
                sinon.assert.calledWith(<sinon.SinonStub>SDKMetrics.reportMetricEvent, LoadMetric.LoadAuctionRequestBlocked);
            });

            it('should attempt to load a campaign that\'s ready and expired', () => {
                loadCampaignStub.callsFake(() => {
                    return Promise.resolve(<ILoadedCampaign>{});
                });

                const loadDict: {[key: string]: number} = {};
                loadDict[placementId] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);

                const campaign = TestFixtures.getCampaign();
                const placement = adsConfig.getPlacement(placementId);
                campaign.set('willExpireAt', Date.now() - 100);
                placement.setState(PlacementState.READY);
                placement.setCurrentCampaign(campaign);

                sinon.assert.called(loadCalledKafkaStub);
                sinon.assert.called(loadCampaignStub);
            });

            const stateTests: PlacementState[] = [PlacementState.NOT_AVAILABLE, PlacementState.NO_FILL];
            stateTests.forEach(state => {
                it(`should attempt to load a campaign with a placement state of ${PlacementState[state]}`, () => {
                    loadCampaignStub.callsFake(() => {
                        return Promise.resolve(<ILoadedCampaign>{});
                    });
                    const loadDict: {[key: string]: number} = {};
                    loadDict[placementId] = 1;
                    ads.LoadApi.onLoad.trigger(loadDict);

                    const placement = adsConfig.getPlacement(placementId);
                    placement.setState(state);
                    return loadManager.initialize().then(() => {
                        sinon.assert.called(loadCalledKafkaStub);
                        sinon.assert.called(loadCampaignStub);
                    });
                });
            });
        });
    });

    describe('setCurrentAdUnit', () => {
        it('should handle setting the current ad unit correctly', () => {
            const adUnit = sinon.createStubInstance(AbstractAdUnit);
            const placement = adsConfig.getPlacement('premium');
            placement.setState(PlacementState.READY);
            loadManager.setCurrentAdUnit(adUnit, placement);
            assert.isUndefined(placement.getCurrentCampaign());
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE);
        });
    });

    describe('refresh', () => {
        let placement: Placement;
        let campaign: Campaign;

        beforeEach(() => {
            placement = adsConfig.getPlacement('premium');
            campaign = TestFixtures.getCampaign();
            placement.setState(PlacementState.READY);
        });

        it('should invalidate expired campaigns', () => {
            campaign.set('willExpireAt', Date.now() - 1);
            placement.setCurrentCampaign(campaign);

            return loadManager.refresh().then((resp) => {
                assert.isUndefined(resp, 'Promise should always resolve with undefined');
                assert.isUndefined(placement.getCurrentCampaign(), 'Campaign for placement should be set to undefined');
                assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'Placement State should be not available');
            });
        });

        it('should not invalidate campaigns which haven\'t expired', () => {
            campaign.set('willExpireAt', Date.now() + 100);
            placement.setCurrentCampaign(campaign);

            return loadManager.refresh().then((resp) => {
                assert.isUndefined(resp, 'Promise should always resolve with undefined');
                assert.equal(placement.getCurrentCampaign(), campaign, 'Campaign for placement should be set to undefined');
                assert.equal(placement.getState(), PlacementState.READY, 'Placement State should be not available');
            });
        });
    });

    describe('shouldRefill', () => {
        it('should always return false', () => {
            const unusedTimestamp = 0;
            assert.isFalse(loadManager.shouldRefill(unusedTimestamp));
        });
    });

    describe('setPlacementState and setPlacementStateChanges', () => {
        let placement: Placement;
        let sandbox: sinon.SinonSandbox;
        const placementID = 'premium';

        beforeEach(() => {
            placement = adsConfig.getPlacement(placementID);
            placement.setState(PlacementState.NOT_AVAILABLE);
            sandbox = sinon.createSandbox();
            sandbox.stub(ads.Listener, 'sendReadyEvent');
            sandbox.stub(ads.Placement, 'setPlacementState');
            sandbox.stub(ads.Listener, 'sendPlacementStateChangedEvent');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should overwrite the placement state to ready', () => {
            loadManager.setPlacementState(placementID, PlacementState.READY);
            assert.isFalse(placement.getPlacementStateChanged(), 'placement state should not be unchanged after this point');
            sandbox.assert.called((<sinon.SinonStub>ads.Listener.sendReadyEvent));
            sandbox.assert.called((<sinon.SinonStub>ads.Placement.setPlacementState));
            sandbox.assert.called((<sinon.SinonStub>ads.Listener.sendPlacementStateChangedEvent));
        });

        it('should not overwrite the placement state', () => {
            loadManager.setPlacementState(placementID, PlacementState.NOT_AVAILABLE);
            assert.isUndefined(placement.getPlacementStateChanged(), 'getPlacementStateChanged should not be defined at this point');
            sandbox.assert.notCalled((<sinon.SinonStub>ads.Listener.sendReadyEvent));
            sandbox.assert.notCalled((<sinon.SinonStub>ads.Placement.setPlacementState));
            sandbox.assert.notCalled((<sinon.SinonStub>ads.Listener.sendPlacementStateChangedEvent));
        });
    });
});
