import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('PerformanceOverlayEventHandlerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let storageBridge;
    let overlay;
    let endScreen;
    let container;
    let performanceAdUnit;
    let video;
    let performanceAdUnitParameters;
    let performanceOverlayEventHandler;
    let request;
    let deviceInfo;
    let clientInfo;
    let storeHandler;
    let privacySDK;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        storageBridge = new StorageBridge(core);
        const metaDataManager = new MetaDataManager(core);
        const campaign = TestFixtures.getCampaign();
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const focusManager = new FocusManager(platform, core);
        const wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        video = new Video('', TestFixtures.getSession());
        const thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        const sessionManager = new SessionManager(core, request, storageBridge);
        privacySDK = sinon.createStubInstance(PrivacySDK);
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
        const privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
        const endScreenParams = {
            platform,
            core,
            language: deviceInfo.getLanguage(),
            gameId: clientInfo.getGameId(),
            privacy: privacy,
            showGDPRBanner: true,
            abGroup: coreConfig.getAbGroup(),
            targetGameName: campaign.getGameName()
        };
        endScreen = new PerformanceEndScreen(endScreenParams, campaign);
        const placement = TestFixtures.getPlacement();
        const videoOverlayParameters = {
            deviceInfo: deviceInfo,
            campaign: campaign,
            coreConfig: coreConfig,
            placement: placement,
            clientInfo: clientInfo,
            platform: platform,
            ads: ads
        };
        overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        performanceAdUnitParameters = {
            platform,
            core,
            ads,
            store,
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: campaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            endScreen: endScreen,
            overlay: overlay,
            video: video,
            privacy: privacy,
            privacyManager: privacyManager,
            privacySDK: privacySDK
        };
        performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
        const storeHandlerParameters = {
            platform,
            core,
            ads,
            store,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            placement: placement,
            adUnit: performanceAdUnit,
            campaign: campaign,
            coreConfig: coreConfig
        };
        storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
        performanceOverlayEventHandler = new PerformanceOverlayEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
    });
    afterEach(() => {
        performanceAdUnit.setShowing(true);
        return performanceAdUnit.hide();
    });
    describe('with onSkip', () => {
        it('should show end screen', () => {
            assert.isDefined(endScreen, 'endScreen not defined');
            sinon.spy(endScreen, 'show');
            performanceOverlayEventHandler.onOverlaySkip(1);
            if (endScreen) {
                sinon.assert.called(endScreen.show);
            }
        });
        it('should trigger onFinish', () => {
            const spy = sinon.spy(performanceAdUnit.onFinish, 'trigger');
            performanceOverlayEventHandler.onOverlaySkip(1);
            sinon.assert.called(spy);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VPdmVybGF5RXZlbnRIYW5kbGVyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9QZXJmb3JtYW5jZS9QZXJmb3JtYW5jZU92ZXJsYXlFdmVudEhhbmRsZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUMzRCxPQUFPLEVBQW1CLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRXRGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFaEQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFFMUYsT0FBTyxFQUFFLFlBQVksRUFBMkIsTUFBTSx3QkFBd0IsQ0FBQztBQUMvRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBTzVELE9BQU8sRUFBRSxhQUFh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