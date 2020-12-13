import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Privacy } from 'Ads/Views/Privacy';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
describe('PerformanceVideoEventHandlersTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let overlay;
    let endScreen;
    let storageBridge;
    let container;
    let performanceAdUnit;
    let video;
    let performanceAdUnitParameters;
    let performanceVideoEventHandler;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        storageBridge = new StorageBridge(core);
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        video = new Video('', TestFixtures.getSession());
        const focusManager = new FocusManager(platform, core);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const metaDataManager = new MetaDataManager(core);
        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        const sessionManager = new SessionManager(core, request, storageBridge);
        const campaign = TestFixtures.getCampaign();
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const privacySDK = sinon.createStubInstance(PrivacySDK);
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
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
        const privacy = new Privacy(platform, campaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en');
        const endScreenParams = {
            platform,
            core,
            language: deviceInfo.getLanguage(),
            gameId: clientInfo.getGameId(),
            privacy: privacy,
            showGDPRBanner: false,
            abGroup: coreConfig.getAbGroup(),
            targetGameName: campaign.getGameName()
        };
        endScreen = new PerformanceEndScreen(endScreenParams, campaign);
        const overlayParams = {
            platform,
            ads,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            campaign: campaign,
            coreConfig: coreConfig,
            placement: TestFixtures.getPlacement()
        };
        overlay = new VideoOverlay(overlayParams, privacy, false, false);
        performanceAdUnitParameters = {
            platform,
            core,
            ads,
            store,
            privacy,
            forceOrientation: Orientation.LANDSCAPE,
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
            endScreen: endScreen,
            overlay: overlay,
            video: video,
            privacyManager: privacyManager,
            privacySDK: privacySDK
        };
        performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
        const videoEventHandlerParams = {
            platform,
            core,
            ads,
            adUnit: performanceAdUnit,
            campaign: campaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            placement: TestFixtures.getPlacement(),
            video: video,
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };
        performanceVideoEventHandler = new PerformanceVideoEventHandler(videoEventHandlerParams);
    });
    afterEach(() => {
        performanceAdUnit.setShowing(true);
        return performanceAdUnit.hide();
    });
    describe('with onVideoCompleted', () => {
        it('should show end screen', () => {
            sinon.spy(endScreen, 'show');
            performanceVideoEventHandler.onCompleted(video.getUrl());
            sinon.assert.called(endScreen.show);
        });
    });
    describe('with onVideoError', () => {
        it('should show end screen', () => {
            sinon.spy(endScreen, 'show');
            // Set prepare called so that error will trigger
            performanceAdUnit.setVideoState(VideoState.PREPARING);
            // Cause an error by giving too large duration
            performanceVideoEventHandler.onPrepared(video.getUrl(), 50000, 1024, 768);
            sinon.assert.called(endScreen.show);
        });
    });
    describe('with onPrepared', () => {
        it('should show set overlay call button visible ', () => {
            sinon.spy(overlay, 'setCallButtonVisible');
            performanceVideoEventHandler.onPrepared(video.getUrl(), 5, 1024, 768);
            sinon.assert.calledWith(overlay.setCallButtonVisible, true);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VWaWRlb0V2ZW50SGFuZGxlcnNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1BlcmZvcm1hbmNlL1BlcmZvcm1hbmNlVmlkZW9FdmVudEhhbmRsZXJzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFtQixXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHckQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDckUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVoRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFFLFlBQVksRUFBMkIsTUFBTSx3QkFBd0IsQ0FBQztBQUMvRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRzVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLE9BQU8sQ0FBQztB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