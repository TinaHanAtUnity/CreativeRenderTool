import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { CampaignManager, ILoadedCampaign } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { ILoadEvent, LoadManager } from 'Ads/Managers/LoadManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('LoadManagerTest', () => {
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
    let ads: IAdsApi;
    let request: RequestManager;
    let storageBridge: StorageBridge;
    let assetManager: AssetManager;
    let sessionManager: SessionManager;
    let loadManager: LoadManager;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let adMobSignalFactory: AdMobSignalFactory;
    let cacheBookkeeping: CacheBookkeepingManager;
    let cache: CacheManager;
    let jaegerManager: JaegerManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let backupCampaignManager: BackupCampaignManager;
    let campaignParserManager: ContentTypeHandlerManager;

    beforeEach(() => {
        clientInfo = TestFixtures.getClientInfo();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);

        storageBridge = new StorageBridge(core);
        focusManager = new FocusManager(platform, core);
        metaDataManager = new MetaDataManager(core);
        wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        sessionManager = new SessionManager(core, request, storageBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        cacheBookkeeping = new CacheBookkeepingManager(core);
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
        backupCampaignManager = new BackupCampaignManager(platform, core, storageBridge, coreConfig, deviceInfo, TestFixtures.getClientInfo(platform));
        campaignParserManager = new ContentTypeHandlerManager();
        assetManager = new AssetManager(platform, core, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService, backupCampaignManager);

        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        (<sinon.SinonStub>adMobSignalFactory.getAdRequestSignal).returns(Promise.resolve(new AdMobSignal()));
        (<sinon.SinonStub>adMobSignalFactory.getOptionalSignal).returns(Promise.resolve(new AdMobOptionalSignal()));

        jaegerManager = sinon.createStubInstance(JaegerManager);
        coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
        adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
        campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, jaegerManager, backupCampaignManager);
        loadManager = new LoadManager(platform, core, coreConfig, ads, adsConfig, campaignManager, clientInfo, focusManager);
    });

    describe('getCampaign', () => {

        describe('without loading placement IDs', () => {
            adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            adsConfig.getPlacementIds().forEach((placementId) => {
                it(`should return undefined with placementID '${placementId}' before campaigns are loaded`, () => {
                    assert.isUndefined(loadManager.getCampaign(placementId), `PlacementID '${placementId}' was defined prior to loading`);
                });
            });
        });

        describe('with loading placement IDs', () => {

            let placementId: string;
            let loadEvent: ILoadEvent;
            const sandbox = sinon.createSandbox();

            beforeEach(() => {
                placementId = 'premium';
                loadEvent = {
                    value: placementId,
                    ts: clientInfo.getInitTimestamp() + 1
                };
                sandbox.stub(core.Storage, 'get').callsFake(() => {
                    return Promise.resolve(loadEvent);
                });
                sandbox.stub(core.Storage, 'getKeys').callsFake(() => {
                    return Promise.resolve(adsConfig.getPlacementIds());
                });
                adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
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
                it('should load/overwrite the correct campaign', () => {
                    sandbox.stub(campaignManager, 'loadCampaign').callsFake(() => {
                        return Promise.resolve(<ILoadedCampaign>{
                            campaign: t.expectedCampaign,
                            trackingUrls: {}
                        });
                    });
                    return loadManager.refreshWithBackupCampaigns(backupCampaignManager).then(() => {
                        const testCampaign = loadManager.getCampaign(placementId);
                        assert.instanceOf(testCampaign, Campaign, `Campaign with placementID '${placementId}' was not a defined Campaign`);
                        assert.equal(testCampaign, t.expectedCampaign, 'Loaded campaign was not the correct campaign');
                        assert.notEqual(testCampaign, t.unexpectedCampaign, 'Loaded campaign was not the correct campaign');
                        assert.isUndefined(loadManager.getCampaign('banner'), 'Campaign with placementID \'banner\' was loaded incorrectly');
                    });
                });
            });
        });

        describe('setCurrentAdUnit', () => {
            let adUnit: AbstractAdUnit;
            let placement: Placement;

            beforeEach(() => {
                adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
                loadManager = new LoadManager(platform, core, coreConfig, ads, adsConfig, campaignManager, clientInfo, focusManager);
                adUnit = sinon.createStubInstance(AbstractAdUnit);
                placement = adsConfig.getPlacement('premium');
                placement.setState(PlacementState.READY);
            });

            it('should handle setting the current ad unit correctly', () => {
                loadManager.setCurrentAdUnit(adUnit, placement);
                assert.isUndefined(placement.getCurrentCampaign());
                assert.equal(placement.getState(), PlacementState.NOT_AVAILABLE);
            });
        });
    });
});
