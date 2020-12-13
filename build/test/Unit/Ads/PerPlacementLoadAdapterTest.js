import * as tslib_1 from "tslib";
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { PerPlacementLoadAdapter } from 'Ads/Managers/PerPlacementLoadAdapter';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { LoadAndFillEventManager } from 'Ads/Managers/LoadAndFillEventManager';
export class TestContainer extends AdUnitContainer {
    open(adUnit, views, allowRotation, forceOrientation, disableBackbutton, options) {
        return Promise.resolve();
    }
    close() {
        return Promise.resolve();
    }
    reconfigure(configuration) {
        return Promise.all([]);
    }
    reorient(allowRotation, forceOrientation) {
        return Promise.resolve(void 0);
    }
    isPaused() {
        return false;
    }
    setViewFrame(view, x, y, width, height) {
        return Promise.resolve();
    }
    getViews() {
        return Promise.all([]);
    }
}
export class TestAdUnit extends AbstractAdUnit {
    show() {
        return Promise.resolve();
    }
    hide() {
        return Promise.resolve();
    }
    description() {
        return 'TestAdUnit';
    }
    isShowing() {
        return true;
    }
    isCached() {
        return false;
    }
}
describe('PerPlacementLoadAdapterTest', () => {
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
    let coreModule;
    let adsModule;
    let ads;
    let request;
    let storageBridge;
    let assetManager;
    let sessionManager;
    let focusManager;
    let cacheBookkeeping;
    let cache;
    let privacyManager;
    let privacySDK;
    let perPlacementLoadAdapter;
    let adMobSignalFactory;
    let metaDataManager;
    let campaignParserManager;
    let loadAndFillEventManager;
    beforeEach(() => {
        clientInfo = TestFixtures.getClientInfo();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        coreModule = TestFixtures.getCoreModule(nativeBridge);
        core = coreModule.Api;
        adsModule = TestFixtures.getAdsModule(coreModule);
        ads = adsModule.Api;
        privacySDK = sinon.createStubInstance(PrivacySDK);
        storageBridge = new StorageBridge(core);
        focusManager = new FocusManager(platform, core);
        wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        sessionManager = new SessionManager(core, request, storageBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        cacheBookkeeping = new CacheBookkeepingManager(core);
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        assetManager = new AssetManager(platform, core, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        coreConfig = CoreConfigurationParser.parse(ConfigurationAuctionPlc);
        adsConfig = AdsConfigurationParser.parse(ConfigurationAuctionPlc);
        privacySDK = TestFixtures.getPrivacySDK(core);
        metaDataManager = new MetaDataManager(core);
        campaignParserManager = sinon.createStubInstance(ContentTypeHandlerManager);
        loadAndFillEventManager = sinon.createStubInstance(LoadAndFillEventManager);
        privacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
        campaignManager = new LegacyCampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager);
    });
    describe('should handle onLoad', () => {
        let placement;
        let placementID;
        let sandbox;
        let sendReadyEventStub;
        let sendPlacementStateChangedEventStub;
        let clock;
        let sendLoadEventStub;
        let sendFillEventStub;
        beforeEach(() => {
            placementID = 'premium';
            placement = adsConfig.getPlacement(placementID);
            placement.setState(PlacementState.NOT_AVAILABLE);
            sandbox = sinon.createSandbox();
            sendReadyEventStub = sandbox.stub(ads.Listener, 'sendReadyEvent');
            sendPlacementStateChangedEventStub = sandbox.stub(ads.Listener, 'sendPlacementStateChangedEvent');
            clock = sinon.useFakeTimers();
            sendLoadEventStub = loadAndFillEventManager.sendLoadTrackingEvents;
            sendFillEventStub = loadAndFillEventManager.sendFillTrackingEvents;
            perPlacementLoadAdapter = new PerPlacementLoadAdapter(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache, loadAndFillEventManager);
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should report no fill on disabled placement', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                placement.setState(PlacementState.DISABLED);
                return Promise.resolve();
            });
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            yield perPlacementLoadAdapter.initialize();
            assert.equal(placement.getState(), PlacementState.DISABLED, 'placement state is set to DISABLED');
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
            const loadDict = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'NO_FILL');
            sinon.assert.notCalled(sendReadyEventStub);
            sinon.assert.called(sendLoadEventStub);
        }));
        it('should report no fill on not available placement', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                placement.setState(PlacementState.NOT_AVAILABLE);
                return Promise.resolve();
            });
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            yield perPlacementLoadAdapter.initialize();
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
            const loadDict = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'NO_FILL');
            sinon.assert.notCalled(sendReadyEventStub);
            sinon.assert.called(sendLoadEventStub);
        }));
        it('should report no fill if placement does not exists', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                return Promise.resolve();
            });
            yield perPlacementLoadAdapter.initialize();
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
            const loadDict = {};
            loadDict.does_not_exists = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, 'does_not_exists', 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, 'does_not_exists', 'WAITING', 'NO_FILL');
            sinon.assert.notCalled(sendReadyEventStub);
            sinon.assert.called(sendLoadEventStub);
        }));
        it('should update state after load', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                return Promise.resolve();
            });
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            yield perPlacementLoadAdapter.initialize();
            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
            const loadDict = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'READY');
            sinon.assert.calledWith(sendReadyEventStub, placementID);
            sinon.assert.called(sendLoadEventStub);
            sinon.assert.called(sendFillEventStub);
        }));
        it('should update state after load while load called during ad request', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line
            let requestPromiseResolve = () => { };
            const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                return requestPromise.then(() => {
                    campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                });
            });
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            const refreshPromise = perPlacementLoadAdapter.initialize();
            assert.equal(placement.getState(), PlacementState.WAITING, 'placement state is set to WAITING');
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
            const loadDict = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.notCalled(sendReadyEventStub);
            sinon.assert.called(sendLoadEventStub);
            sinon.assert.notCalled(sendFillEventStub);
            requestPromiseResolve();
            yield refreshPromise;
            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'READY');
            sinon.assert.calledWith(sendReadyEventStub, placementID);
            sinon.assert.called(sendFillEventStub);
        }));
        it('should update state after load while load called before RefreshManager initialized', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line
            let requestPromiseResolve = () => { };
            const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                return requestPromise.then(() => {
                    campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                });
            });
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            const loadDict = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            const refreshPromise = perPlacementLoadAdapter.initialize();
            assert.equal(placement.getState(), PlacementState.WAITING, 'placement state is set to WAITING');
            requestPromiseResolve();
            yield refreshPromise;
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'READY');
            sinon.assert.calledWith(sendReadyEventStub, placementID);
            sinon.assert.called(sendLoadEventStub);
            sinon.assert.called(sendFillEventStub);
        }));
        it('should update properly handle no fill', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onNoFill.trigger('premium');
                return Promise.resolve();
            });
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            yield perPlacementLoadAdapter.initialize();
            assert.equal(placement.getState(), PlacementState.NO_FILL, 'placement state is set to NO_FILL');
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
            const loadDict = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'NO_FILL');
            sinon.assert.notCalled(sendReadyEventStub);
            sinon.assert.called(sendLoadEventStub);
        }));
        it('should update properly handle ready to no fill', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                campaignManager.onAdPlanReceived.trigger(1, 3, 0);
                return Promise.resolve();
            });
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            yield perPlacementLoadAdapter.initialize();
            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
            const loadDict = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'READY');
            sinon.assert.calledWith(sendReadyEventStub, placementID);
            sendPlacementStateChangedEventStub.resetHistory();
            sendReadyEventStub.resetHistory();
            sandbox.restore();
            sendPlacementStateChangedEventStub = sandbox.stub(ads.Listener, 'sendPlacementStateChangedEvent');
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onNoFill.trigger('premium');
                return Promise.resolve();
            });
            clock.tick(1001);
            PerPlacementLoadAdapter.ErrorRefillDelayInSeconds = 0;
            yield perPlacementLoadAdapter.refresh();
            clock.reset();
            assert.equal(placement.getState(), PlacementState.NO_FILL, 'placement state is set to NO_FILL');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'NO_FILL');
        }));
        it('should update properly handle ready to ready', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                campaignManager.onAdPlanReceived.trigger(1, 3, 0);
                return Promise.resolve();
            });
            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');
            yield perPlacementLoadAdapter.initialize();
            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
            const loadDict = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'READY');
            sinon.assert.calledWith(sendReadyEventStub, placementID);
            sendPlacementStateChangedEventStub.resetHistory();
            sendReadyEventStub.resetHistory();
            sandbox.restore();
            sendPlacementStateChangedEventStub = sandbox.stub(ads.Listener, 'sendPlacementStateChangedEvent');
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                return Promise.resolve();
            });
            clock.tick(1001);
            yield perPlacementLoadAdapter.refresh();
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
        }));
        describe('setCurrentAdUnit', () => {
            let adUnitParams;
            let store;
            let container;
            let thirdPartyEventManager;
            let operativeEventManager;
            let privacy;
            beforeEach(() => {
                privacy = sinon.createStubInstance(AbstractPrivacy);
                container = new TestContainer();
                thirdPartyEventManager = new ThirdPartyEventManager(core, request);
                const campaign = TestFixtures.getCampaign();
                store = TestFixtures.getStoreApi(nativeBridge);
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    platform,
                    core,
                    ads,
                    request: request,
                    metaDataManager: metaDataManager,
                    sessionManager: sessionManager,
                    clientInfo: clientInfo,
                    deviceInfo: deviceInfo,
                    coreConfig: coreConfig,
                    adsConfig: adsConfig,
                    storageBridge: storageBridge,
                    campaign: campaign,
                    playerMetadataServerId: 'test-gamerSid',
                    privacySDK: privacySDK,
                    userPrivacyManager: privacyManager
                });
                adUnitParams = {
                    platform,
                    core,
                    ads,
                    store,
                    forceOrientation: Orientation.NONE,
                    focusManager: focusManager,
                    container: container,
                    deviceInfo: deviceInfo,
                    clientInfo: clientInfo,
                    thirdPartyEventManager: thirdPartyEventManager,
                    operativeEventManager: operativeEventManager,
                    placement: TestFixtures.getPlacement(),
                    campaign: campaign,
                    coreConfig: coreConfig,
                    adsConfig: adsConfig,
                    request: request,
                    options: {},
                    privacyManager: privacyManager,
                    privacy: privacy,
                    privacySDK: privacySDK
                };
            });
            it('should handle setting the current ad unit correctly', () => {
                const campaign = TestFixtures.getCampaign();
                adUnitParams.placement = placement;
                adUnitParams.campaign = campaign;
                placement.setState(PlacementState.READY);
                const currentAdUnit = new TestAdUnit(adUnitParams);
                perPlacementLoadAdapter.setCurrentAdUnit(currentAdUnit, placement);
                currentAdUnit.onStart.trigger();
                assert.isUndefined(placement.getCurrentCampaign());
                sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'READY', 'NOT_AVAILABLE');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyUGxhY2VtZW50TG9hZEFkYXB0ZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9QZXJQbGFjZW1lbnRMb2FkQWRhcHRlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDeEUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ25GLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU3RCxPQUFPLEVBQWEsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDakUsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDNUUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDaEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsU0FBUyxFQUFxQixNQUFNLCtCQUErQixDQUFDO0FBRzdFLE9BQU8sRUFBRSx1QkFB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