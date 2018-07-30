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
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Activity } from 'AdUnits/Containers/Activity';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { SdkApi } from 'Native/Api/Sdk';
import { ListenerApi } from 'Native/Api/Listener';
import { JaegerManager } from 'Jaeger/JaegerManager';
import { JaegerSpan } from 'Jaeger/JaegerSpan';
import { GdprManager } from 'Managers/GdprManager';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { ForceQuitManager } from 'Managers/ForceQuitManager';

describe('NewRefreshManagerTest', () => {
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
    let container: Activity;
    let adUnit: TestAdUnit;
    let jaegerManager: JaegerManager;
    let gdprManager: GdprManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let forceQuitManager: ForceQuitManager;

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
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookKeeping, programmaticTrackingService);
        reinitManager = new ReinitManager(nativeBridge, clientInfo, request, cache);
        assetManager = new AssetManager(cache, CacheMode.DISABLED, deviceInfo, cacheBookKeeping, nativeBridge);
        sessionManager = new SessionManager(nativeBridge, request);
        metaDataManager = new MetaDataManager(nativeBridge);
        adMobSignalFactory = new AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
        jaegerManager = sinon.createStubInstance(JaegerManager);
        jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
        campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookKeeping, jaegerManager);
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
        forceQuitManager = sinon.createStubInstance(ForceQuitManager);
        container = new Activity(nativeBridge, deviceInfo, forceQuitManager);
        gdprManager = sinon.createStubInstance(GdprManager);

        adUnit = new TestAdUnit(nativeBridge, {
            forceOrientation: Orientation.NONE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: TestFixtures.getCampaign(),
            configuration: configuration,
            request: request,
            options: {},
            adMobSignalFactory: adMobSignalFactory,
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        });
    });

    it('should not refill when SDK must reinitialize', () => {
        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        sinon.stub(adUnit, 'isShowing').returns(true);
        sinon.stub(reinitManager, 'shouldReinitialize').returns(Promise.resolve(true));

        refreshManager.setCurrentAdUnit(adUnit);

        return refreshManager.refresh().then(() => {
            assert.isFalse(refreshManager.getRefillState(Date.now()).shouldRefill, 'tried to refill when SDK should reinitialize');
        });
    });

    it('should not refill immediately after ad unit start', () => {
        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        sinon.stub(adUnit, 'isShowing').returns(true);

        refreshManager.setCurrentAdUnit(adUnit);
        adUnit.onStart.trigger();

        assert.isFalse(refreshManager.getRefillState(Date.now()).shouldRefill, 'tried to refill immediately after ad unit start');
    });

    it('should not refill when app is in background', () => {
        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        sinon.stub(focusManager, 'isAppForeground').returns(false);

        assert.isFalse(refreshManager.getRefillState(Date.now()).shouldRefill, 'tried to refill when app is in background');
    });

    it('should refill after init', () => {
        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        assert.isTrue(refreshManager.getRefillState(Date.now()).shouldRefill, 'did not refill when SDK is initializing');
    });

    it('should refill according to ad plan TTL', () => {
        const oneHourInSeconds: number = 3600;
        const twoHoursInMilliseconds: number = 7200000;
        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);

        assert.isFalse(refreshManager.getRefillState(Date.now()).shouldRefill, 'tried to refill when valid ad plan was received');
        assert.isTrue(refreshManager.getRefillState(Date.now() + twoHoursInMilliseconds).shouldRefill, 'did not refill after ad plan expired');
    });

    // ideally ad plan TTL and campaign expiration should be in sync but this tests for the desync case where individual campaign has somehow expired before ad plan TTL has expired
    it('should refill when a campaign has expired', () => {
        const oneHourInSeconds: number = 3600;
        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        sinon.stub(campaign, 'isExpired').returns(true);

        campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);
        campaignManager.onCampaign.trigger('video', campaign);

        assert.isTrue(refreshManager.getRefillState(Date.now()).shouldRefill, 'did not refill when there was one expired campaign');
    });

    it('should reinitialize when webview has been updated', () => {
        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        sinon.stub(reinitManager, 'shouldReinitialize').returns(Promise.resolve(true));

        nativeBridge.Sdk = new SdkApi(nativeBridge);
        const spy = sinon.spy(nativeBridge.Sdk, 'reinitialize');

        return refreshManager.refresh().then(() => {
            assert.isTrue(spy.calledOnce, 'native API reinitialize was not invoked');
        });
    });

    it('should request new fill when webview has not been updated', () => {
        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        sinon.stub(reinitManager, 'shouldReinitialize').returns(Promise.resolve(false));

        const spy = sinon.spy(campaignManager, 'request');

        return refreshManager.refresh().then(() => {
            assert.isTrue(spy.calledOnce, 'new fill was not requested when webview was not updated');
        });
    });

    it('should do nothing when current ad plan is valid', () => {
        const oneHourInSeconds: number = 3600;

        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);

        const requestSpy = sinon.spy(campaignManager, 'request');
        const reinitSpy = sinon.spy(reinitManager, 'shouldReinitialize');

        return refreshManager.refresh().then(() => {
            assert.isFalse(requestSpy.called, 'ad request was triggered for valid ad plan');
            assert.isFalse(reinitSpy.called, 'reinit check was triggered for valid ad plan');
        });
    });

    it('should handle new campaign', () => {
        const oneHourInSeconds: number = 3600;

        const refreshManager: NewRefreshManager = new NewRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, reinitManager, placementManager);

        nativeBridge.Listener = new ListenerApi(nativeBridge);
        const listenerSpy = sinon.spy(nativeBridge.Listener, 'sendReadyEvent');

        campaignManager.onAdPlanReceived.trigger(oneHourInSeconds, 1);
        campaignManager.onCampaign.trigger('video', campaign);

        assert.isDefined(placementManager.getCampaign('video'), 'campaign was not set for correct placement');
        assert.equal((<PerformanceCampaign>placementManager.getCampaign('video')).getId(), campaign.getId(), 'campaign was set incorrectly');
        assert.isTrue(listenerSpy.calledOnceWithExactly('video'), 'ready event was not sent correctly');
    });
});
