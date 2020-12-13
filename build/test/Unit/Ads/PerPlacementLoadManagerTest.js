import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { Campaign } from 'Ads/Models/Campaign';
import { PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { SDKMetrics, LoadMetric } from 'Ads/Utilities/SDKMetrics';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { LoadAndFillEventManager } from 'Ads/Managers/LoadAndFillEventManager';
describe('PerPlacementLoadManagerTest', () => {
    let deviceInfo;
    let clientInfo;
    let coreConfig;
    let adsConfig;
    let campaignManager;
    let wakeUpManager;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let request;
    let storageBridge;
    let assetManager;
    let sessionManager;
    let loadManager;
    let metaDataManager;
    let focusManager;
    let adMobSignalFactory;
    let cacheBookkeeping;
    let cache;
    let campaignParserManager;
    let privacySDK;
    let userPrivacyManager;
    let loadAndFillEventManager;
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
        loadAndFillEventManager = sinon.createStubInstance(LoadAndFillEventManager);
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
        loadManager = new PerPlacementLoadManager(ads, adsConfig, coreConfig, campaignManager, clientInfo, focusManager, loadAndFillEventManager);
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
            let placementId;
            let sandbox;
            let loadCampaignStub;
            let sendReadyEventStub;
            let sendLoadEventStub;
            let sendFillEventStub;
            beforeEach(() => {
                sandbox = sinon.createSandbox();
                placementId = 'premium';
                loadCampaignStub = sandbox.stub(campaignManager, 'loadCampaign');
                sendReadyEventStub = sandbox.stub(ads.Listener, 'sendReadyEvent');
                sendLoadEventStub = loadAndFillEventManager.sendLoadTrackingEvents;
                sendFillEventStub = loadAndFillEventManager.sendFillTrackingEvents;
                // To silence diagnostic messages
                sandbox.stub(Diagnostics, 'trigger').callsFake(() => {
                    return Promise.resolve({});
                });
                return loadManager.initialize();
            });
            afterEach(() => {
                sandbox.restore();
            });
            // The actual values don't matter, only that they are different campaigns
            const tests = [{
                    expectedCampaign: TestFixtures.getCampaign(),
                    unexpectedCampaign: TestFixtures.getXPromoCampaign()
                }, {
                    expectedCampaign: TestFixtures.getXPromoCampaign(),
                    unexpectedCampaign: TestFixtures.getCampaign()
                }];
            tests.forEach((t) => {
                it('should load/overwrite the correct campaign', (done) => {
                    loadCampaignStub.callsFake(() => {
                        return Promise.resolve({
                            campaign: t.expectedCampaign,
                            trackingUrls: {}
                        });
                    });
                    const setPlacementStateStub = sandbox.stub(ads.Placement, 'setPlacementState');
                    setPlacementStateStub.callsFake((id, state) => {
                        if (placementId === id && state !== PlacementState.WAITING) {
                            const testCampaign = loadManager.getCampaign(placementId);
                            assert.instanceOf(testCampaign, Campaign, `Campaign with placementID '${placementId}' was not a defined Campaign`);
                            assert.equal(testCampaign, t.expectedCampaign, 'Loaded campaign was not the correct campaign');
                            assert.notEqual(testCampaign, t.unexpectedCampaign, 'Loaded campaign was not the correct campaign');
                            assert.isUndefined(loadManager.getCampaign('banner'), 'Campaign with placementID \'banner\' was loaded incorrectly');
                            sinon.assert.called(sendLoadEventStub);
                            sinon.assert.called(sendFillEventStub);
                            done();
                        }
                    });
                    const loadDict = {};
                    loadDict[placementId] = 1;
                    ads.LoadApi.onLoad.trigger(loadDict);
                });
            });
            it('should set the placement state to nofill', (done) => {
                loadCampaignStub.callsFake(() => {
                    return Promise.resolve(undefined);
                });
                const setPlacementStateStub = sandbox.stub(ads.Placement, 'setPlacementState');
                setPlacementStateStub.callsFake((id, state) => {
                    if (placementId === id && state !== PlacementState.WAITING) {
                        const testCampaign = loadManager.getCampaign(placementId);
                        assert.isUndefined(testCampaign, 'Loaded campaign was defined');
                        sinon.assert.calledWith(setPlacementStateStub, placementId, PlacementState.NO_FILL);
                        done();
                    }
                });
                const loadDict = {};
                loadDict[placementId] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);
            });
            it('should not attempt to load a campaign for a placement that\'s waiting', () => {
                const placement = adsConfig.getPlacement(placementId);
                placement.setState(PlacementState.WAITING);
                const loadDict = {};
                loadDict[placementId] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);
                sinon.assert.notCalled(loadCampaignStub);
                sinon.assert.notCalled(sendReadyEventStub);
                sinon.assert.calledWith(SDKMetrics.reportMetricEvent, LoadMetric.LoadAuctionRequestBlocked);
                sinon.assert.called(sendLoadEventStub);
            });
            it('should not attempt to load a campaign that\'s ready and not expired', () => {
                const campaign = TestFixtures.getCampaign();
                const placement = adsConfig.getPlacement(placementId);
                campaign.set('willExpireAt', Date.now() + 100);
                placement.setState(PlacementState.READY);
                placement.setCurrentCampaign(campaign);
                const loadDict = {};
                loadDict[placementId] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);
                sinon.assert.notCalled(loadCampaignStub);
                sinon.assert.calledWith(sendReadyEventStub, placementId);
                sinon.assert.calledWith(SDKMetrics.reportMetricEvent, LoadMetric.LoadAuctionRequestBlocked);
                sinon.assert.called(sendLoadEventStub);
                sinon.assert.called(sendFillEventStub);
            });
            it('should attempt to load a campaign that\'s ready and expired', () => {
                loadCampaignStub.callsFake(() => {
                    return Promise.resolve({});
                });
                const loadDict = {};
                loadDict[placementId] = 1;
                ads.LoadApi.onLoad.trigger(loadDict);
                const campaign = TestFixtures.getCampaign();
                const placement = adsConfig.getPlacement(placementId);
                campaign.set('willExpireAt', Date.now() - 100);
                placement.setState(PlacementState.READY);
                placement.setCurrentCampaign(campaign);
                sinon.assert.called(loadCampaignStub);
                sinon.assert.called(sendLoadEventStub);
            });
            const stateTests = [PlacementState.NOT_AVAILABLE, PlacementState.NO_FILL];
            stateTests.forEach(state => {
                it(`should attempt to load a campaign with a placement state of ${PlacementState[state]}`, () => {
                    loadCampaignStub.callsFake(() => {
                        return Promise.resolve({});
                    });
                    const loadDict = {};
                    loadDict[placementId] = 1;
                    ads.LoadApi.onLoad.trigger(loadDict);
                    const placement = adsConfig.getPlacement(placementId);
                    placement.setState(state);
                    return loadManager.initialize().then(() => {
                        sinon.assert.called(loadCampaignStub);
                        sinon.assert.called(sendLoadEventStub);
                        sinon.assert.called(sendFillEventStub);
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
        let placement;
        let campaign;
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
        let placement;
        let sandbox;
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
            sandbox.assert.called(ads.Listener.sendReadyEvent);
            sandbox.assert.called(ads.Placement.setPlacementState);
            sandbox.assert.called(ads.Listener.sendPlacementStateChangedEvent);
        });
        it('should not overwrite the placement state', () => {
            loadManager.setPlacementState(placementID, PlacementState.NOT_AVAILABLE);
            assert.isUndefined(placement.getPlacementStateChanged(), 'getPlacementStateChanged should not be defined at this point');
            sandbox.assert.notCalled(ads.Listener.sendReadyEvent);
            sandbox.assert.notCalled(ads.Placement.setPlacementState);
            sandbox.assert.notCalled(ads.Listener.sendPlacementStateChangedEvent);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyUGxhY2VtZW50TG9hZE1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9QZXJQbGFjZW1lbnRMb2FkTWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDeEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFN0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQy9DLE9BQU8sRUFBYSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRWxFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFN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