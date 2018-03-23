import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { CampaignManager } from 'Managers/CampaignManager';
import { CacheMode, Configuration } from 'Models/Configuration';
import { FocusManager } from 'Managers/FocusManager';
import { ReinitManager } from 'Managers/ReinitManager';
import { PlacementManager } from 'Managers/PlacementManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';
import { Request } from 'Utilities/Request';
import { Cache } from 'Utilities/Cache';
import { ClientInfo } from 'Models/ClientInfo';
import { AssetManager } from 'Managers/AssetManager';
import { SessionManager } from 'Managers/SessionManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { NewRefreshManager } from 'Managers/NewRefreshManager';
import { TestAdUnit } from 'Test/Unit/TestHelpers/TestAdUnit';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Activity } from 'AdUnits/Containers/Activity';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';

describe('NewRefreshManagerTest', () => {
    describe('shouldRefill', () => {
        let nativeBridge: NativeBridge;
        let configuration: Configuration;
        let focusManager: FocusManager;
        let wakeUpManager: WakeUpManager;
        let placementManager: PlacementManager;
        let clientInfo: ClientInfo;
        let deviceInfo: AndroidDeviceInfo;
        let request: Request;
        let cacheBookKeeping: CacheBookkeeping;
        let cache: Cache;
        let reinitManager: ReinitManager;
        let assetManager: AssetManager;
        let sessionManager: SessionManager;
        let metaDataManager: MetaDataManager;
        let adMobSignalFactory: AdMobSignalFactory;
        let campaignManager: CampaignManager;
        let thirdPartyEventManager: ThirdPartyEventManager;
        let campaign: PerformanceCampaign;
        let operativeEventManager: OperativeEventManager;
        let comScoreTrackingService: ComScoreTrackingService;
        let container: Activity;
        let adUnit: TestAdUnit;

        beforeEach(() => {
            nativeBridge = TestFixtures.getNativeBridge();
            configuration = TestFixtures.getConfiguration();
            focusManager = new FocusManager(nativeBridge);
            wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            placementManager = new PlacementManager(nativeBridge, configuration);
            clientInfo = TestFixtures.getClientInfo();
            deviceInfo = TestFixtures.getAndroidDeviceInfo();
            request = new Request(nativeBridge, wakeUpManager);
            cacheBookKeeping = new CacheBookkeeping(nativeBridge);
            cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookKeeping);
            reinitManager = new ReinitManager(nativeBridge, clientInfo, request, cache);
            assetManager = new AssetManager(cache, CacheMode.DISABLED, deviceInfo, cacheBookKeeping);
            sessionManager = new SessionManager(nativeBridge, request);
            metaDataManager = new MetaDataManager(nativeBridge);
            adMobSignalFactory = new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
            campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager);
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            campaign = TestFixtures.getCampaign();
            operativeEventManager = new OperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: configuration,
                campaign: campaign
            });
            comScoreTrackingService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);
            container = new Activity(nativeBridge, deviceInfo);
            adUnit = new TestAdUnit(nativeBridge, {
                forceOrientation: ForceOrientation.NONE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                comScoreTrackingService: comScoreTrackingService,
                placement: TestFixtures.getPlacement(),
                campaign: TestFixtures.getCampaign(),
                configuration: configuration,
                request: request,
                options: {},
                adMobSignalFactory: adMobSignalFactory
            });
        });

        it('should not refill when SDK must reinitialize', () => {
            const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

            sinon.stub(adUnit, 'isShowing').returns(true);
            sinon.stub(reinitManager, 'shouldReinitialize').returns(Promise.resolve(true));

            refreshManager.setCurrentAdUnit(adUnit);

            return refreshManager.refresh().then(() => {
                assert.isFalse(refreshManager.shouldRefill(Date.now()), 'tried to refill when SDK should reinitialize');
            });
        });

        it('should not refill immediately after ad unit start', () => {
            const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

            sinon.stub(adUnit, 'isShowing').returns(true);

            refreshManager.setCurrentAdUnit(adUnit);
            adUnit.onStart.trigger();

            assert.isFalse(refreshManager.shouldRefill(Date.now()), 'tried to refill immediately after ad unit start');
        });

        it('should not refill when app is in background', () => {
            const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

            sinon.stub(focusManager, 'isAppForeground').returns(false);

            assert.isFalse(refreshManager.shouldRefill(Date.now()), 'tried to refill when app is in background');
        });

        it('should refill after init', () => {
            const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

            assert.isTrue(refreshManager.shouldRefill(Date.now()), 'did not refill when SDK is initializing');
        });

        it('should refill according to ad plan TTL', () => {
            const oneHourInSeconds: number = 3600;
            const twoHoursInMilliseconds: number = 7200000;
            const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

            campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);

            assert.isFalse(refreshManager.shouldRefill(Date.now()), 'tried to refill when valid ad plan was received');
            assert.isTrue(refreshManager.shouldRefill(Date.now() + twoHoursInMilliseconds), 'did not refill after ad plan expired');
        });

        // ideally ad plan TTL and campaign expiration should be in sync but this tests for the desync case where individual campaign has somehow expired before ad plan TTL has expired
        it('should refill when a campaign has expired', () => {
            const oneHourInSeconds: number = 3600;
            const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

            sinon.stub(campaign, 'isExpired').returns(true);

            campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);
            campaignManager.onCampaign.trigger('video', campaign);

            assert.isTrue(refreshManager.shouldRefill(Date.now()), 'did not refill when there was one expired campaign');
        });
    });
});
