import { IAdsApi, IAds } from 'Ads/IAds';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore, ICoreApi } from 'Core/ICore';
import 'mocha';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager, ILoadedCampaign } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
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

describe('PerPlacementLoadAdapterTest', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let campaignManager: CampaignManager;
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
    let programmaticTrackingService: ProgrammaticTrackingService;
    let privacySDK: PrivacySDK;
    let perPlacementLoadAdapter: PerPlacementLoadAdapter;
    let adMobSignalFactory: AdMobSignalFactory;
    let metaDataManager: MetaDataManager;
    let campaignParserManager: ContentTypeHandlerManager;

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
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        assetManager = new AssetManager(platform, core, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService);
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        coreConfig = CoreConfigurationParser.parse(ConfigurationAuctionPlc);
        adsConfig = AdsConfigurationParser.parse(ConfigurationAuctionPlc);
        privacySDK = TestFixtures.getPrivacySDK(core);
        metaDataManager = new MetaDataManager(core);
        campaignParserManager = sinon.createStubInstance(ContentTypeHandlerManager);

        privacyManager = new UserPrivacyManager(platform, core, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
        campaignManager = new CampaignManager(platform, coreModule, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, privacyManager);
    });

    describe('should handle onLoad', () => {
        let placement: Placement;
        let placementID: string;
        let sandbox: sinon.SinonSandbox;
        let sendReadyEventStub: sinon.SinonStub;
        let sendPlacementStateChangedEventStub: sinon.SinonStub;

        beforeEach(() => {
            placementID = 'premium';
            placement = adsConfig.getPlacement(placementID);
            placement.setState(PlacementState.NOT_AVAILABLE);
            sandbox = sinon.createSandbox();
            sendReadyEventStub = sandbox.stub(ads.Listener, 'sendReadyEvent');
            sendPlacementStateChangedEventStub = sandbox.stub(ads.Listener, 'sendPlacementStateChangedEvent');

            perPlacementLoadAdapter = new PerPlacementLoadAdapter(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should update state for READY state', () => {
            placement.setState(PlacementState.READY);
            assert.equal(placement.getState(), PlacementState.READY, 'placement state is set to READY');

            const loadDict: {[key: string]: number} = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID);
            sinon.assert.calledWith(sendReadyEventStub, placementID);
            assert.equal(placement.getPreviousState(), PlacementState.WAITING, 'placement previous state should be waiting');
            assert.equal(placement.getState(), PlacementState.READY, 'placement previous state should be waiting');
        });

        it('should update state for NO_FILL', () => {
            placement.setState(PlacementState.NO_FILL);

            const loadDict: {[key: string]: number} = {};
            loadDict[placementID] = 1;
            ads.LoadApi.onLoad.trigger(loadDict);

            sinon.assert.calledWith(sendPlacementStateChangedEventStub, placementID);
            sinon.assert.notCalled(sendReadyEventStub);
            assert.equal(placement.getPreviousState(), PlacementState.WAITING, 'placement previous state should be waiting');
            assert.equal(placement.getState(), PlacementState.NO_FILL, 'placement previous state should be waiting');
        });
    });
});
