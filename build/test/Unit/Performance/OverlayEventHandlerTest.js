import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { Double } from 'Core/Utilities/Double';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('OverlayEventHandlerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let performanceAdUnit;
    let storageBridge;
    let container;
    let sessionManager;
    let endScreen;
    let video;
    let metaDataManager;
    let focusManager;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let request;
    let overlay;
    let performanceAdUnitParameters;
    let overlayEventHandler;
    let campaign;
    let placement;
    let coreConfig;
    let adsConfig;
    let privacySDK;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        storageBridge = new StorageBridge(core);
        focusManager = new FocusManager(platform, core);
        metaDataManager = new MetaDataManager(core);
        const wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        coreConfig = TestFixtures.getCoreConfiguration();
        adsConfig = TestFixtures.getAdsConfiguration();
        campaign = TestFixtures.getCampaign();
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core, request, storageBridge);
        privacySDK = sinon.createStubInstance(PrivacySDK);
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
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
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        video = new Video('', TestFixtures.getSession());
        const privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
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
        placement = TestFixtures.getPlacement();
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
        overlayEventHandler = new OverlayEventHandler(performanceAdUnit, performanceAdUnitParameters);
    });
    afterEach(() => {
        performanceAdUnit.setShowing(true);
        return performanceAdUnit.hide();
    });
    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(ads.VideoPlayer, 'pause');
            sinon.spy(operativeEventManager, 'sendSkip');
            sinon.spy(ads.Android.AdUnit, 'setViews');
            sinon.spy(container, 'reconfigure');
            sinon.spy(overlay, 'hide');
            overlayEventHandler.onOverlaySkip(1);
        });
        it('should pause video player', () => {
            sinon.assert.called(ads.VideoPlayer.pause);
        });
        it('should set video inactive', () => {
            assert.isFalse(performanceAdUnit.isActive());
        });
        it('should set finish state', () => {
            assert.equal(performanceAdUnit.getFinishState(), FinishState.SKIPPED);
        });
        it('should send skip', () => {
            const params = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo(),
                videoProgress: performanceAdUnit.getVideo().getPosition()
            };
            sinon.assert.calledWith(operativeEventManager.sendSkip, params);
        });
        it('should call reconfigure', () => {
            sinon.assert.calledWith(container.reconfigure, 0 /* ENDSCREEN */);
        });
        it('should hide overlay', () => {
            sinon.assert.called(overlay.hide);
        });
    });
    describe('When calling onMute', () => {
        beforeEach(() => {
            sinon.spy(ads.VideoPlayer, 'setVolume');
        });
        it('should set volume to zero when muted', () => {
            overlayEventHandler.onOverlayMute(true);
            sinon.assert.calledWith(ads.VideoPlayer.setVolume, new Double(0));
        });
        it('should set volume to 1 when not muted', () => {
            overlayEventHandler.onOverlayMute(false);
            sinon.assert.calledWith(ads.VideoPlayer.setVolume, new Double(1));
        });
    });
    describe('When calling onKeyCode', () => {
        beforeEach(() => {
            sinon.spy(overlayEventHandler, 'onOverlaySkip');
            sinon.spy(overlayEventHandler, 'onOverlayClose');
            sinon.stub(placement, 'allowSkipInSeconds').returns(3);
            sinon.stub(performanceAdUnit, 'isShowing').returns(true);
            sinon.stub(performanceAdUnit, 'canPlayVideo').returns(true);
        });
        it('should call onOverlaySkip if video is playing and skipping is allowed', () => {
            sinon.stub(placement, 'allowSkip').returns(true);
            sinon.stub(video, 'getPosition').returns(3001);
            overlayEventHandler.onKeyEvent(4 /* BACK */);
            sinon.assert.called(overlayEventHandler.onOverlaySkip);
        });
        it('should not call onOverlaySkip if progress < allowSkipInSeconds', () => {
            sinon.stub(placement, 'allowSkip').returns(true);
            sinon.stub(video, 'getPosition').returns(2900);
            overlayEventHandler.onKeyEvent(4 /* BACK */);
            sinon.assert.notCalled(overlayEventHandler.onOverlaySkip);
        });
        it('should not call onOverlaySkip if the key code is wrong', () => {
            sinon.stub(placement, 'allowSkip').returns(true);
            sinon.stub(video, 'getPosition').returns(3001);
            overlayEventHandler.onKeyEvent(3);
            sinon.assert.notCalled(overlayEventHandler.onOverlaySkip);
        });
        it('should not call onOverlaySkip if skipping is not allowed', () => {
            sinon.stub(placement, 'allowSkip').returns(false);
            sinon.stub(video, 'getPosition').returns(3001);
            overlayEventHandler.onKeyEvent(4 /* BACK */);
            sinon.assert.notCalled(overlayEventHandler.onOverlaySkip);
        });
        it('should call onOverlayClose if skipEndCardOnClose is enabled', () => {
            sinon.stub(placement, 'allowSkip').returns(true);
            sinon.stub(video, 'getPosition').returns(3001);
            sinon.stub(placement, 'skipEndCardOnClose').returns(true);
            sinon.stub(overlay, 'hide');
            overlayEventHandler.onKeyEvent(4 /* BACK */);
            sinon.assert.called(overlayEventHandler.onOverlayClose);
            sinon.assert.notCalled(overlayEventHandler.onOverlaySkip);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3ZlcmxheUV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvUGVyZm9ybWFuY2UvT3ZlcmxheUV2ZW50SGFuZGxlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzNELE9BQU8sRUFBbUIsV0FBVyxFQUFxQixNQUFNLHdDQUF3QyxDQUFDO0FBQ3pHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRTVFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRXJFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUU3RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHaEQsT0FBTyxFQUFFLFlBQVksRUFBMkIsTUFBTSx3QkFBd0IsQ0FBQztBQUMvRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FB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