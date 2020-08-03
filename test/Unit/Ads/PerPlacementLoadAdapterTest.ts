import { IAdsApi, IAds } from 'Ads/IAds';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore, ICoreApi } from 'Core/ICore';
import 'mocha';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { PerPlacementLoadAdapter } from 'Ads/Managers/PerPlacementLoadAdapter';
import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { IStoreApi } from 'Store/IStore';
import { AdUnitContainer, IAdUnit, Orientation, ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { LoadAndFillEventManager } from 'Ads/Managers/LoadAndFillEventManager';

export class TestContainer extends AdUnitContainer {
    public open(adUnit: IAdUnit, views: string[], allowRotation: boolean, forceOrientation: Orientation, disableBackbutton: boolean, options: any): Promise<void> {
        return Promise.resolve();
    }
    public close(): Promise<void> {
        return Promise.resolve();
    }
    public reconfigure(configuration: ViewConfiguration): Promise<unknown[]> {
        return Promise.all([]);
    }
    public reorient(allowRotation: boolean, forceOrientation: Orientation): Promise<void> {
        return Promise.resolve(void 0);
    }
    public isPaused(): boolean {
        return false;
    }
    public setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void> {
        return Promise.resolve();
    }
    public getViews(): Promise<string[]> {
        return Promise.all([]);
    }
}
export class TestAdUnit extends AbstractAdUnit {

    public show(): Promise<void> {
        return Promise.resolve();
    }
    public hide(): Promise<void> {
        return Promise.resolve();
    }
    public description(): string {
        return 'TestAdUnit';
    }
    public isShowing() {
        return true;
    }
    public isCached() {
        return false;
    }
}

describe('PerPlacementLoadAdapterTest', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let campaignManager: LegacyCampaignManager;
    let wakeUpManager: WakeUpManager;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let coreModule: ICore;
    let adsModule: IAds;
    let ads: IAdsApi;
    let request: RequestManager;
    let storageBridge: StorageBridge;
    let assetManager: AssetManager;
    let sessionManager: SessionManager;
    let focusManager: FocusManager;
    let cacheBookkeeping: CacheBookkeepingManager;
    let cache: CacheManager;
    let privacyManager: UserPrivacyManager;
    let privacySDK: PrivacySDK;
    let perPlacementLoadAdapter: PerPlacementLoadAdapter;
    let adMobSignalFactory: AdMobSignalFactory;
    let metaDataManager: MetaDataManager;
    let campaignParserManager: ContentTypeHandlerManager;
    let loadAndFillEventManager: LoadAndFillEventManager;

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
        let placement: Placement;
        let placementID: string;
        let sandbox: sinon.SinonSandbox;
        let sendReadyEventStub: sinon.SinonStub;
        let sendPlacementStateChangedEventStub: sinon.SinonStub;
        let clock: sinon.SinonFakeTimers;
        let sendLoadEventStub: sinon.SinonStub;
        let sendFillEventStub: sinon.SinonStub;

        beforeEach(() => {
            placementID = 'premium';
            placement = adsConfig.getPlacement(placementID);
            placement.setState(PlacementState.NOT_AVAILABLE);
            sandbox = sinon.createSandbox();
            sendReadyEventStub = sandbox.stub(ads.Listener, 'sendReadyEvent');
            sendPlacementStateChangedEventStub = sandbox.stub(ads.Listener, 'sendPlacementStateChangedEvent');
            clock = sinon.useFakeTimers();
            sendLoadEventStub = <sinon.SinonStub>loadAndFillEventManager.sendLoadTrackingEvents;
            sendFillEventStub = <sinon.SinonStub>loadAndFillEventManager.sendFillTrackingEvents;

            perPlacementLoadAdapter = new PerPlacementLoadAdapter(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache, loadAndFillEventManager);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should report no fill on disabled placement', async () => {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                placement.setState(PlacementState.DISABLED);
                return Promise.resolve();
            });

            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');

            await perPlacementLoadAdapter.initialize();

            assert.equal(placement.getState(), PlacementState.DISABLED, 'placement state is set to DISABLED');

            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);

            const loadDict: {[key: string]: number} = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'NO_FILL');
            sinon.assert.notCalled(sendReadyEventStub);
            sinon.assert.called(sendLoadEventStub);
        });

        it('should report no fill on not available placement', async () => {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                placement.setState(PlacementState.NOT_AVAILABLE);
                return Promise.resolve();
            });

            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');

            await perPlacementLoadAdapter.initialize();

            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');

            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);

            const loadDict: {[key: string]: number} = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'NO_FILL');
            sinon.assert.notCalled(sendReadyEventStub);
            sinon.assert.called(sendLoadEventStub);
        });

        it('should report no fill if placement does not exists', async () => {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                return Promise.resolve();
            });

            await perPlacementLoadAdapter.initialize();

            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);

            const loadDict: {[key: string]: number} = {};
            loadDict.does_not_exists = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, 'does_not_exists', 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, 'does_not_exists', 'WAITING', 'NO_FILL');
            sinon.assert.notCalled(sendReadyEventStub);

            sinon.assert.called(sendLoadEventStub);
        });

        it('should update state after load', async () => {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                return Promise.resolve();
            });

            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');

            await perPlacementLoadAdapter.initialize();

            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');

            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);

            const loadDict: {[key: string]: number} = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'READY');
            sinon.assert.calledWith(sendReadyEventStub, placementID);

            sinon.assert.called(sendLoadEventStub);
            sinon.assert.called(sendFillEventStub);
        });

        it('should update state after load while load called during ad request', async () => {
            // tslint:disable-next-line
            let requestPromiseResolve = () => {};
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

            const loadDict: {[key: string]: number} = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.notCalled(sendReadyEventStub);

            sinon.assert.called(sendLoadEventStub);
            sinon.assert.notCalled(sendFillEventStub);

            requestPromiseResolve();

            await refreshPromise;

            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'READY');
            sinon.assert.calledWith(sendReadyEventStub, placementID);
            sinon.assert.called(sendFillEventStub);
        });

        it('should update state after load while load called before RefreshManager initialized', async () => {
            // tslint:disable-next-line
            let requestPromiseResolve = () => {};
            const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });

            sandbox.stub(campaignManager, 'request').callsFake(() => {
                return requestPromise.then(() => {
                    campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                });
            });

            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');

            const loadDict: {[key: string]: number} = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            const refreshPromise = perPlacementLoadAdapter.initialize();

            assert.equal(placement.getState(), PlacementState.WAITING, 'placement state is set to WAITING');

            requestPromiseResolve();

            await refreshPromise;

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'READY');
            sinon.assert.calledWith(sendReadyEventStub, placementID);

            sinon.assert.called(sendLoadEventStub);
            sinon.assert.called(sendFillEventStub);
        });

        it('should update properly handle no fill', async () => {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onNoFill.trigger('premium');
                return Promise.resolve();
            });

            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');

            await perPlacementLoadAdapter.initialize();

            assert.equal(placement.getState(), PlacementState.NO_FILL, 'placement state is set to NO_FILL');

            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);

            const loadDict: {[key: string]: number} = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'NOT_AVAILABLE', 'WAITING');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'NO_FILL');
            sinon.assert.notCalled(sendReadyEventStub);

            sinon.assert.called(sendLoadEventStub);
        });

        it('should update properly handle ready to no fill', async () => {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                campaignManager.onAdPlanReceived.trigger(1, 3, 0);
                return Promise.resolve();
            });

            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');

            await perPlacementLoadAdapter.initialize();

            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');

            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);

            const loadDict: {[key: string]: number} = {};
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
            await perPlacementLoadAdapter.refresh();
            clock.reset();

            assert.equal(placement.getState(), PlacementState.NO_FILL, 'placement state is set to NO_FILL');
            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID, 'WAITING', 'NO_FILL');
        });

        it('should update properly handle ready to ready', async () => {
            sandbox.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign(), undefined);
                campaignManager.onAdPlanReceived.trigger(1, 3, 0);
                return Promise.resolve();
            });

            assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE, 'placement state is set to NOT_AVAILABLE');

            await perPlacementLoadAdapter.initialize();

            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');
            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);

            const loadDict: {[key: string]: number} = {};
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

            await perPlacementLoadAdapter.refresh();

            sinon.assert.notCalled(sendPlacementStateChangedEventStub);
            sinon.assert.notCalled(sendReadyEventStub);
        });

        describe('setCurrentAdUnit', () => {
            let adUnitParams: IAdUnitParameters<Campaign>;
            let store: IStoreApi;
            let container: AdUnitContainer;
            let thirdPartyEventManager: ThirdPartyEventManager;
            let operativeEventManager: OperativeEventManager;
            let privacy: AbstractPrivacy;

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
                const campaign: Campaign = TestFixtures.getCampaign();
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
