import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PerPlacementLoadManagerWithCometRefresh } from 'Ads/Managers/PerPlacementLoadManagerWithCometRefresh';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { LoadExperimentWithCometRefreshing } from 'Core/Models/ABGroup';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0 } from 'Core/Utilities/Observable';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

describe('PerPlacementLoadManagerWithCometRefreshTest', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let campaignManager: CampaignManager;
    let wakeUpManager: WakeUpManager;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let adsApi: IAdsApi;
    let request: RequestManager;
    let storageBridge: StorageBridge;
    let assetManager: AssetManager;
    let sessionManager: SessionManager;
    let loadManager: PerPlacementLoadManagerWithCometRefresh;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let adMobSignalFactory: AdMobSignalFactory;
    let cacheBookkeeping: CacheBookkeepingManager;
    let cache: CacheManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let campaignParserManager: ContentTypeHandlerManager;
    let privacySDK: PrivacySDK;

    beforeEach(() => {
        platform = Platform.ANDROID;
        clientInfo = TestFixtures.getClientInfo();
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        adsApi = TestFixtures.getAdsApi(nativeBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core.Api);
        privacySDK = TestFixtures.getPrivacySDK(core.Api);

        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        campaignParserManager = sinon.createStubInstance(ContentTypeHandlerManager);
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);

        coreConfig = TestFixtures.getCoreConfiguration();
        adsConfig = TestFixtures.getAdsConfiguration();

        storageBridge = new StorageBridge(core.Api);
        focusManager = new FocusManager(platform, core.Api);
        metaDataManager = new MetaDataManager(core.Api);
        wakeUpManager = new WakeUpManager(core.Api);
        request = new RequestManager(platform, core.Api, wakeUpManager);
        sessionManager = new SessionManager(core.Api, request, storageBridge);
        cacheBookkeeping = new CacheBookkeepingManager(core.Api);
        cache = new CacheManager(core.Api, wakeUpManager, request, cacheBookkeeping);
        assetManager = new AssetManager(platform, core.Api, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService);
        campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK);
        loadManager = new PerPlacementLoadManagerWithCometRefresh(adsApi, adsConfig, coreConfig, campaignManager, clientInfo, focusManager, programmaticTrackingService);
    });

    describe('setCurrentAdUnit', () => {
        let sandbox: sinon.SinonSandbox;
        let refreshReadyPerformanceCampaignStub: sinon.SinonStub;
        let abTestStub: sinon.SinonStub;

        let placement: Placement;
        let adUnit: AbstractAdUnit;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            refreshReadyPerformanceCampaignStub = sandbox.stub(loadManager, 'refreshReadyPerformanceCampaigns');
            abTestStub = sandbox.stub(LoadExperimentWithCometRefreshing, 'isValid');
            placement = adsConfig.getPlacement('premium');
            adUnit = sandbox.createStubInstance(AbstractAdUnit);
            (<any>adUnit).onFinish = new Observable0();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should call refreshReadyPerformanceCampaigns onFinish when ABTest is active and a Performance Campaign was shown', () => {
            abTestStub.returns(true);
            placement.setCurrentCampaign(TestFixtures.getCampaign());
            loadManager.setCurrentAdUnit(adUnit, placement);
            adUnit.onFinish.trigger();
            sinon.assert.calledOnce(refreshReadyPerformanceCampaignStub);
        });

        it('should not call refreshReadyPerformanceCampaigns onFinish when ABTest is active but a Display Interstitial Campaign was shown', () => {
            abTestStub.returns(true);
            placement.setCurrentCampaign(TestFixtures.getDisplayInterstitialCampaign());
            loadManager.setCurrentAdUnit(adUnit, placement);
            adUnit.onFinish.trigger();
            sinon.assert.notCalled(refreshReadyPerformanceCampaignStub);
        });

        it('should not call refreshReadyPerformanceCampaigns onFinish when ABTest is disabled but a Performance Campaign was shown', () => {
            abTestStub.returns(false);
            placement.setCurrentCampaign(TestFixtures.getCampaign());
            loadManager.setCurrentAdUnit(adUnit, placement);
            adUnit.onFinish.trigger();
            sinon.assert.notCalled(refreshReadyPerformanceCampaignStub);
        });
    });

    describe('refreshReadyPerformanceCampaigns', () => {
        let sandbox: sinon.SinonSandbox;
        let loadCampaignStub: sinon.SinonStub;

        let premiumPlacement: Placement;
        let videoPlacement: Placement;
        let mraidPlacement: Placement;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            loadCampaignStub = sandbox.stub(campaignManager, 'loadCampaign');

            premiumPlacement = adsConfig.getPlacement('premium');
            videoPlacement = adsConfig.getPlacement('video');
            mraidPlacement = adsConfig.getPlacement('mraid');

            // Default to a Ready Performance Campaign
            premiumPlacement.setCurrentCampaign(TestFixtures.getCampaign());
            videoPlacement.setCurrentCampaign(TestFixtures.getCampaign());
            premiumPlacement.setState(PlacementState.READY);
            videoPlacement.setState(PlacementState.READY);

            // Default to a Ready Programmatic Campaign
            mraidPlacement.setCurrentCampaign(TestFixtures.getDisplayInterstitialCampaign());
            mraidPlacement.setState(PlacementState.READY);

            // Default to return Programmatic MRAID Campaign
            loadCampaignStub.returns(Promise.resolve({
                campaign: TestFixtures.getProgrammaticMRAIDCampaign(),
                trackingUrls: {}
            }));
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should refresh both performance campaigns and not invalidate programmatic campaign', () => {
            loadManager.refreshReadyPerformanceCampaigns().then(() => {
                sinon.assert.calledTwice(loadCampaignStub);
                assert.equal(premiumPlacement.getState(), PlacementState.READY);
                assert.equal(premiumPlacement.getCurrentCampaign(), TestFixtures.getProgrammaticMRAIDCampaign());
                assert.equal(videoPlacement.getState(), PlacementState.READY);
                assert.equal(videoPlacement.getCurrentCampaign(), TestFixtures.getProgrammaticMRAIDCampaign());
                assert.equal(mraidPlacement.getState(), PlacementState.READY);
                assert.equal(mraidPlacement.getCurrentCampaign(), TestFixtures.getDisplayInterstitialCampaign());
            });
        });

        it('should refresh a single performance campaign and not invalidate programmatic campaign', () => {
            premiumPlacement.setState(PlacementState.NOT_AVAILABLE);
            loadManager.refreshReadyPerformanceCampaigns().then(() => {
                sinon.assert.calledOnce(loadCampaignStub);
                assert.equal(premiumPlacement.getState(), PlacementState.NOT_AVAILABLE);
                assert.equal(videoPlacement.getState(), PlacementState.READY);
                assert.equal(videoPlacement.getCurrentCampaign(), TestFixtures.getProgrammaticMRAIDCampaign());
                assert.equal(mraidPlacement.getState(), PlacementState.READY);
                assert.equal(mraidPlacement.getCurrentCampaign(), TestFixtures.getDisplayInterstitialCampaign());
            });
        });

        it('should fail to refresh both performance campaigns and not invalidate programmatic campaign', () => {
            loadCampaignStub.returns(Promise.resolve(undefined));
            loadManager.refreshReadyPerformanceCampaigns().then(() => {
                sinon.assert.calledTwice(loadCampaignStub);
                assert.equal(premiumPlacement.getState(), PlacementState.NO_FILL);
                assert.equal(videoPlacement.getState(), PlacementState.NO_FILL);
                assert.equal(mraidPlacement.getState(), PlacementState.READY);
                assert.equal(mraidPlacement.getCurrentCampaign(), TestFixtures.getDisplayInterstitialCampaign());
            });
        });
    });
});
