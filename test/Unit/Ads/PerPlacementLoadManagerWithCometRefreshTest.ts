import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PerPlacementLoadManagerWithCometRefresh } from 'Ads/Managers/PerPlacementLoadManagerWithCometRefresh';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
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
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';

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

        sinon.stub(ProgrammaticTrackingService, 'reportMetricEvent').returns(Promise.resolve());
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
        assetManager = new AssetManager(platform, core.Api, cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        userPrivacyManager = new UserPrivacyManager(platform, core.Api, coreConfig, adsConfig, clientInfo, deviceInfo, request, privacySDK);
        campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, campaignParserManager, privacySDK, userPrivacyManager);
        loadManager = new PerPlacementLoadManagerWithCometRefresh(adsApi, adsConfig, coreConfig, campaignManager, clientInfo, focusManager);
    });

    describe('setCurrentAdUnit', () => {
        let sandbox: sinon.SinonSandbox;
        let refreshCampaignstub: sinon.SinonStub;

        let placement: Placement;
        let adUnit: AbstractAdUnit;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            refreshCampaignstub = sandbox.stub(loadManager, 'refreshCampaigns');
            placement = adsConfig.getPlacement('premium');
            adUnit = sandbox.createStubInstance(AbstractAdUnit);
            (<any>adUnit).onStartProcessed = new Observable0();
        });

        afterEach(() => {
            sandbox.restore();
        });

        [
            { campaign: TestFixtures.getCampaign(), shouldCall: true },
            { campaign: TestFixtures.getDisplayInterstitialCampaign(), shouldCall: false },
            { campaign: TestFixtures.getPromoCampaign(), shouldCall: false },
            { campaign: TestFixtures.getProgrammaticMRAIDCampaign(), shouldCall: false },
            { campaign: TestFixtures.getCompanionStaticVastCampaign(), shouldCall: false },
            { campaign: TestFixtures.getDisplayInterstitialCampaign(), shouldCall: false },
            { campaign: TestFixtures.getPromoCampaign(), shouldCall: false },
            { campaign: TestFixtures.getProgrammaticMRAIDCampaign(), shouldCall: false },
            { campaign: TestFixtures.getCompanionStaticVastCampaign(), shouldCall: false }
        ].forEach(({ campaign, shouldCall }) => {
            it(`should ${shouldCall ? '' : 'not '}call refreshCampaigns onStartProcessed when a ${campaign.getContentType()} was shown`, () => {
                placement.setCurrentCampaign(campaign);
                loadManager.setCurrentAdUnit(adUnit, placement);

                adUnit.onStartProcessed.trigger();

                sinon.assert.callCount(refreshCampaignstub, shouldCall ? 1 : 0);
            });
        });

        it('should only call refreshReadyPerformanceCampaign once when onStartProcessed is called multiple times', () => {
            placement.setCurrentCampaign(TestFixtures.getCampaign());
            loadManager.setCurrentAdUnit(adUnit, placement);

            adUnit.onStartProcessed.trigger();
            adUnit.onStartProcessed.trigger();
            adUnit.onStartProcessed.trigger();

            sinon.assert.calledOnce(refreshCampaignstub);
        });
    });

    describe('refreshCampaigns', () => {
        let sandbox: sinon.SinonSandbox;
        let loadCampaignStub: sinon.SinonStub;

        let premiumPlacement: Placement;
        let videoPlacement: Placement;
        let mraidPlacement: Placement;

        let cometCampaign: Campaign;
        let programmaticMRAIDCampaign: Campaign;
        let displayInterstitialCampaign: Campaign;

        let trackingUrls: ICampaignTrackingUrls;

        beforeEach(() => {
            sandbox = sinon.createSandbox();
            loadCampaignStub = sandbox.stub(campaignManager, 'loadCampaign');

            cometCampaign = TestFixtures.getCampaign();
            displayInterstitialCampaign = TestFixtures.getDisplayInterstitialCampaign();
            programmaticMRAIDCampaign = TestFixtures.getProgrammaticMRAIDCampaign();

            premiumPlacement = adsConfig.getPlacement('premium');
            videoPlacement = adsConfig.getPlacement('video');
            mraidPlacement = adsConfig.getPlacement('mraid');

            // Default to a Ready Performance Campaign
            premiumPlacement.setCurrentCampaign(cometCampaign);
            premiumPlacement.setState(PlacementState.READY);

            videoPlacement.setCurrentCampaign(cometCampaign);
            videoPlacement.setState(PlacementState.READY);

            // Default to a Ready Programmatic Campaign
            mraidPlacement.setCurrentCampaign(displayInterstitialCampaign);
            mraidPlacement.setState(PlacementState.READY);

            trackingUrls = {
                test: ['http://example.com/tracking/url']
            };

            // Default to return Programmatic MRAID Campaign
            loadCampaignStub.returns(Promise.resolve({
                campaign: programmaticMRAIDCampaign,
                trackingUrls: trackingUrls
            }));
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should refresh both performance campaigns and not invalidate programmatic campaign', () => {
            return loadManager.refreshCampaigns().then(() => {
                sinon.assert.calledTwice(loadCampaignStub);

                sinon.assert.calledWith(loadCampaignStub, videoPlacement);
                sinon.assert.calledWith(loadCampaignStub, premiumPlacement);

                assert.equal(premiumPlacement.getState(), PlacementState.READY);
                assert.equal(premiumPlacement.getCurrentCampaign(), programmaticMRAIDCampaign);
                assert.equal(premiumPlacement.getCurrentTrackingUrls(), trackingUrls);

                assert.equal(videoPlacement.getState(), PlacementState.READY);
                assert.equal(videoPlacement.getCurrentCampaign(), programmaticMRAIDCampaign);
                assert.equal(premiumPlacement.getCurrentTrackingUrls(), trackingUrls);

                assert.equal(mraidPlacement.getState(), PlacementState.READY);
                assert.equal(mraidPlacement.getCurrentCampaign(), displayInterstitialCampaign);
            });
        });

        [
            PlacementState.DISABLED,
            PlacementState.NOT_AVAILABLE,
            PlacementState.NO_FILL,
            PlacementState.WAITING
        ].forEach((state) => {
            it(`should not refresh premium placement with state ${PlacementState[state]}`, () => {
                premiumPlacement.setState(state);
                premiumPlacement.setCurrentCampaign(undefined);

                return loadManager.refreshCampaigns().then(() => {
                    sinon.assert.calledOnce(loadCampaignStub);

                    sinon.assert.calledWith(loadCampaignStub, videoPlacement);

                    assert.equal(premiumPlacement.getState(), state);
                    assert.isUndefined(premiumPlacement.getCurrentCampaign());
                    assert.isUndefined(premiumPlacement.getCurrentTrackingUrls());

                    assert.equal(videoPlacement.getState(), PlacementState.READY);
                    assert.equal(videoPlacement.getCurrentCampaign(), programmaticMRAIDCampaign);

                    assert.equal(mraidPlacement.getState(), PlacementState.READY);
                    assert.equal(mraidPlacement.getCurrentCampaign(), displayInterstitialCampaign);
                });
            });
        });

        it('should not refresh both performance campaigns and not invalidate programmatic campaign', () => {
            loadCampaignStub.returns(Promise.resolve(undefined));

            return loadManager.refreshCampaigns().then(() => {
                sinon.assert.calledTwice(loadCampaignStub);

                sinon.assert.calledWith(loadCampaignStub, premiumPlacement);
                sinon.assert.calledWith(loadCampaignStub, videoPlacement);

                assert.equal(premiumPlacement.getState(), PlacementState.NO_FILL);
                assert.isUndefined(premiumPlacement.getCurrentCampaign());

                assert.equal(videoPlacement.getState(), PlacementState.NO_FILL);
                assert.isUndefined(videoPlacement.getCurrentCampaign());

                assert.equal(mraidPlacement.getState(), PlacementState.READY);
                assert.equal(mraidPlacement.getCurrentCampaign(), displayInterstitialCampaign);
            });
        });
    });
});
