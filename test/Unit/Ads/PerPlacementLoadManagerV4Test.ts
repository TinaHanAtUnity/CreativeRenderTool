import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PerPlacementLoadManagerV4 } from 'Ads/Managers/PerPlacementLoadManagerV4';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
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

describe('PerPlacementLoadManagerV4', () => {
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
    let loadManager: PerPlacementLoadManagerV4;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let adMobSignalFactory: AdMobSignalFactory;
    let cacheBookkeeping: CacheBookkeepingManager;
    let cache: CacheManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let campaignParserManager: ContentTypeHandlerManager;
    let privacySDK: PrivacySDK;
    let userPrivacyManager: UserPrivacyManager;

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
        userPrivacyManager = new UserPrivacyManager(platform, core.Api, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
        campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, userPrivacyManager);
        loadManager = new PerPlacementLoadManagerV4(adsApi, adsConfig, coreConfig, campaignManager, clientInfo, focusManager, programmaticTrackingService);
    });

    describe('setCurrentAdUnit', () => {
        let sandbox: sinon.SinonSandbox;

        let placement: Placement;
        let adUnit: AbstractAdUnit;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            placement = adsConfig.getPlacement('premium');
            adUnit = sandbox.createStubInstance(AbstractAdUnit);
            (<any>adUnit).onStartProcessed = new Observable0();
            (<any>adUnit).onClose = new Observable0();
            (<any>adUnit).onFinish = new Observable0();
        });

        afterEach(() => {
            sandbox.restore();
        });

        [
            { campaign: TestFixtures.getCampaign() },
            { campaign: TestFixtures.getDisplayInterstitialCampaign() },
            { campaign: TestFixtures.getPromoCampaign() },
            { campaign: TestFixtures.getProgrammaticMRAIDCampaign() },
            { campaign: TestFixtures.getCompanionStaticVastCampaign() },
            { campaign: TestFixtures.getDisplayInterstitialCampaign() },
            { campaign: TestFixtures.getPromoCampaign() },
            { campaign: TestFixtures.getProgrammaticMRAIDCampaign() },
            { campaign: TestFixtures.getCompanionStaticVastCampaign() }
        ].forEach(({ campaign }) => {
            it(`should invalidate all placements onStartProcessed when a ${campaign.getContentType()} was shown`, () => {

                // Set all placements to be ready and have fill
                for (const placementId of adsConfig.getPlacementIds()) {
                    const otherPlacement = adsConfig.getPlacement(placementId);
                    otherPlacement.setCurrentCampaign(TestFixtures.getCampaign());
                    otherPlacement.setState(PlacementState.READY);
                }

                placement.setCurrentCampaign(campaign);
                loadManager.setCurrentAdUnit(adUnit, placement);

                adUnit.onStartProcessed.trigger();

                // Check that all placements have undefined campaigns and a state of NOT_AVAILABLE
                for (const placementId of adsConfig.getPlacementIds()) {
                    const placementToCheck = adsConfig.getPlacement(placementId);
                    const campaignToCheck = placement.getCurrentCampaign();
                    if (campaignToCheck) {
                        assert.isUndefined(placementToCheck.getCurrentCampaign());
                        assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE);
                    }
                }
            });
        });
    });
});
