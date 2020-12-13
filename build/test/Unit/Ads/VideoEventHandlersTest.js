import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { AndroidVideoEventHandler } from 'Ads/EventHandlers/AndroidVideoEventHandler';
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
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Double } from 'Core/Utilities/Double';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import 'mocha';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { Vast } from 'VAST/Models/Vast';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoVideoEventHandler } from 'XPromo/EventHandlers/XPromoVideoEventHandler';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
describe('Vast VideoEventHandlersTest', () => {
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
    let vastAdUnit;
    let sessionManager;
    let video;
    let metaDataManager;
    let focusManager;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let request;
    let vastAdUnitParameters;
    let operativeEventManagerParams;
    let placement;
    let vastCampaign;
    let videoEventHandlerParams;
    let vastVideoEventHandler;
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
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core, request, storageBridge);
        vastCampaign = TestFixtures.getEventVastCampaign();
        privacySDK = sinon.createStubInstance(PrivacySDK);
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        operativeEventManagerParams = {
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
            campaign: vastCampaign,
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: privacySDK,
            userPrivacyManager: privacyManager
        };
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
        video = new Video('', TestFixtures.getSession());
        placement = TestFixtures.getPlacement();
        const privacy = new Privacy(platform, vastCampaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en_FI');
        const campaign = TestFixtures.getCampaign();
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
        vastAdUnitParameters = {
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
            placement: placement,
            campaign: vastCampaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: video,
            privacyManager: privacyManager,
            privacySDK: privacySDK
        };
        endScreen = new VastStaticEndScreen(vastAdUnitParameters);
        vastAdUnit = new VastAdUnit(vastAdUnitParameters);
        videoEventHandlerParams = {
            platform,
            core,
            ads,
            adUnit: vastAdUnit,
            campaign: vastCampaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            placement: TestFixtures.getPlacement(),
            video: video,
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };
        vastVideoEventHandler = new VastVideoEventHandler(videoEventHandlerParams);
    });
    afterEach(() => {
        vastAdUnit.setShowing(true);
        return vastAdUnit.hide();
    });
    describe('with onVideoPrepared', () => {
        let seekResolved;
        let volumeResolved;
        beforeEach(() => {
            seekResolved = Promise.resolve(void (0));
            volumeResolved = Promise.resolve(void (0));
            sinon.stub(ads.VideoPlayer, 'seekTo').returns(seekResolved);
            sinon.stub(ads.VideoPlayer, 'setVolume').returns(volumeResolved);
            sinon.spy(ads.VideoPlayer, 'play');
        });
        it('should set debug message to programmatic ad if the ad unit is VAST', () => {
            sinon.stub(overlay, 'setDebugMessage');
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            const vast = new Vast([], []);
            sinon.stub(vast, 'getVideoUrl').returns(video.getUrl());
            sinon.stub(vastCampaign, 'getVideo').returns(video);
            vastAdUnit.setVideoState(VideoState.PREPARING);
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.calledWith(overlay.setDebugMessage, 'Programmatic Ad');
            stub.restore();
        });
        xit('should set call button visibility to true if the ad unit is VAST and has a click through URL', () => {
            sinon.stub(overlay, 'setCallButtonVisible');
            vastCampaign = {
                getVideo: () => video
            };
            vastAdUnit.setVideoState(VideoState.PREPARING);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.calledWith(overlay.setCallButtonVisible, true);
        });
        it('should not set call button visibility to true if the ad unit is VAST but there is no click trough URL', () => {
            sinon.stub(overlay, 'setCallButtonVisible');
            vastCampaign = {
                getVideo: () => video
            };
            vastAdUnit.setVideoState(VideoState.PREPARING);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.notCalled(overlay.setCallButtonVisible);
        });
        it('should set fade enabled to false if the ad unit is VAST and has a click trough URL', () => {
            sinon.stub(overlay, 'setFadeEnabled');
            vastCampaign = {
                getVideo: () => video
            };
            vastAdUnit.setVideoState(VideoState.PREPARING);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.calledWith(overlay.setFadeEnabled, false);
        });
        it('should not set fade enabled to false if the ad unit is VAST but there is no click trough URL', () => {
            sinon.stub(overlay, 'setFadeEnabled');
            vastCampaign = {
                getVideo: () => video
            };
            vastAdUnit.setVideoState(VideoState.PREPARING);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.notCalled(overlay.setFadeEnabled);
        });
    });
});
describe('Performance VideoEventHandlersTest', () => {
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
    let sessionManager;
    let video;
    let metaDataManager;
    let focusManager;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let request;
    let performanceAdUnitParameters;
    let operativeEventManagerParams;
    let placement;
    let performanceCampaign;
    let performanceVideoEventHandler;
    let videoEventHandlerParams;
    let privacySDK;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        storageBridge = new StorageBridge(core);
        focusManager = new FocusManager(platform, core);
        metaDataManager = new MetaDataManager(core);
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core, request, storageBridge);
        performanceCampaign = TestFixtures.getCampaign();
        privacySDK = sinon.createStubInstance(PrivacySDK);
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        operativeEventManagerParams = {
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
            campaign: performanceCampaign,
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: privacySDK,
            userPrivacyManager: privacyManager
        };
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
        video = new Video('', TestFixtures.getSession());
        placement = TestFixtures.getPlacement();
        const privacy = new Privacy(platform, performanceCampaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en_FI');
        const campaign = TestFixtures.getCampaign();
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
        const endScreenParams = {
            platform,
            core,
            language: 'en',
            gameId: '12345',
            privacy: privacy,
            showGDPRBanner: false,
            abGroup: coreConfig.getAbGroup(),
            targetGameName: performanceCampaign.getGameName()
        };
        endScreen = new PerformanceEndScreen(endScreenParams, performanceCampaign);
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
            placement: TestFixtures.getPlacement(),
            campaign: performanceCampaign,
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
        videoEventHandlerParams = {
            platform,
            core,
            ads,
            adUnit: performanceAdUnit,
            campaign: performanceCampaign,
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
        performanceAdUnit.setVideoState(VideoState.PREPARING);
    });
    afterEach(() => {
        performanceAdUnit.setShowing(true);
        return performanceAdUnit.hide();
    });
    describe('with onVideoPlay', () => {
        it('should set progress interval', () => {
            sinon.stub(ads.VideoPlayer, 'setProgressEventInterval').returns(Promise.resolve(void (0)));
            performanceVideoEventHandler.onPlay(video.getUrl());
            sinon.assert.calledWith(ads.VideoPlayer.setProgressEventInterval, performanceAdUnit.getProgressInterval());
        });
    });
    describe('with video start', () => {
        beforeEach(() => {
            performanceAdUnit.setVideoState(VideoState.READY);
        });
        it('should set video started', () => {
            performanceVideoEventHandler.onProgress(1);
            assert.isTrue(performanceAdUnit.getVideoState() === VideoState.PLAYING);
        });
        it('should send start event to backend', () => {
            sinon.spy(operativeEventManager, 'sendStart');
            performanceVideoEventHandler.onProgress(1);
            const params = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: videoEventHandlerParams.video };
            sinon.assert.calledWith(operativeEventManager.sendStart, params);
        });
        it('should invoke onUnityAdsStart callback ', () => {
            sinon.stub(ads.Listener, 'sendStartEvent').returns(Promise.resolve(void (0)));
            performanceVideoEventHandler.onProgress(1);
            sinon.assert.calledWith(ads.Listener.sendStartEvent, placement.getId());
        });
    });
    describe('with onVideoProgress', () => {
        beforeEach(() => {
            sinon.spy(performanceAdUnit.getVideo(), 'setPosition');
            sinon.spy(overlay, 'setVideoProgress');
        });
        it('with positive position, should set video position and video progress', () => {
            performanceVideoEventHandler.onProgress(5);
            sinon.assert.calledWith(performanceAdUnit.getVideo().setPosition, 5);
            sinon.assert.calledWith(overlay.setVideoProgress, 5);
        });
        it('with negative position, should set video position and video progress', () => {
            performanceVideoEventHandler.onProgress(-5);
            sinon.assert.notCalled(performanceAdUnit.getVideo().setPosition);
            sinon.assert.calledWith(overlay.setVideoProgress, -5);
        });
        it('should send first quartile event', () => {
            sinon.spy(operativeEventManager, 'sendFirstQuartile');
            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(4000);
            performanceVideoEventHandler.onProgress(6000);
            const params = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo() };
            sinon.assert.calledWith(operativeEventManager.sendFirstQuartile, params);
        });
        it('should send midpoint event', () => {
            sinon.spy(operativeEventManager, 'sendMidpoint');
            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(9000);
            performanceVideoEventHandler.onProgress(11000);
            const params = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo() };
            sinon.assert.calledWith(operativeEventManager.sendMidpoint, params);
        });
        it('should send third quartile event', () => {
            sinon.spy(operativeEventManager, 'sendThirdQuartile');
            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(14000);
            performanceVideoEventHandler.onProgress(16000);
            const params = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo() };
            sinon.assert.calledWith(operativeEventManager.sendThirdQuartile, params);
        });
    });
    describe('with onVideoCompleted', () => {
        let prom;
        beforeEach(() => {
            prom = Promise.resolve(false);
            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(operativeEventManager, 'sendView');
            sinon.spy(overlay, 'hide');
        });
        it('should set video to inactive', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());
            assert.isFalse(performanceAdUnit.isActive());
        });
        it('should set finish state to COMPLETED', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.COMPLETED);
        });
        it('should send view to session manager', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());
            const params = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: videoEventHandlerParams.video };
            sinon.assert.calledWith(operativeEventManager.sendView, params);
        });
        it('should hide overlay', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());
            const adUnitOverlay = performanceAdUnit.getOverlay();
            if (adUnitOverlay) {
                sinon.assert.called(adUnitOverlay.hide);
            }
        });
    });
    describe('with onVideoPrepared', () => {
        let seekResolved;
        let volumeResolved;
        beforeEach(() => {
            seekResolved = Promise.resolve(void (0));
            volumeResolved = Promise.resolve(void (0));
            sinon.stub(ads.VideoPlayer, 'seekTo').returns(seekResolved);
            sinon.stub(ads.VideoPlayer, 'setVolume').returns(volumeResolved);
            sinon.spy(ads.VideoPlayer, 'play');
        });
        it('should set video duration for overlay', () => {
            sinon.stub(overlay, 'setVideoDuration');
            performanceVideoEventHandler.onPrepared(video.getUrl(), 10, 1024, 768);
            sinon.assert.calledWith(overlay.setVideoDuration, 10);
        });
        it('should set video volume to 1.0 by default', () => {
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.calledWith(ads.VideoPlayer.setVolume, new Double(1));
        });
        it('should set video volume to 0.0 when overlay says it is muted', () => {
            overlay.isMuted = sinon.mock().returns(true);
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.calledWith(ads.VideoPlayer.setVolume, new Double(0));
        });
        it('should just play when video position is set to 0', () => {
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            return volumeResolved.then(() => {
                sinon.assert.called(ads.VideoPlayer.play);
                sinon.assert.notCalled(ads.VideoPlayer.seekTo);
            });
        });
        it('should seek and play when video position is set to greater than 0', () => {
            performanceAdUnit.getVideo().setPosition(123);
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            return volumeResolved.then(() => seekResolved).then(() => {
                sinon.assert.calledWith(ads.VideoPlayer.seekTo, 123);
                sinon.assert.called(ads.VideoPlayer.play);
            });
        });
        it('should set debug message visibility to true if the debug overlay is enabled in the metadata', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            sinon.stub(overlay, 'setDebugMessageVisible');
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.calledWith(overlay.setDebugMessageVisible, true);
            stub.restore();
        });
        it('should set debug message to performance ad if the ad unit is not VAST', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            sinon.stub(overlay, 'setDebugMessage');
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.calledWith(overlay.setDebugMessage, 'Performance Ad');
            stub.restore();
        });
        it('should not set debug message when the debug overlay is disabled in the metadata', () => {
            sinon.stub(overlay, 'setDebugMessage');
            const stub = sinon.stub(TestEnvironment, 'get').returns(false);
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            sinon.assert.notCalled(overlay.setDebugMessage);
            stub.restore();
        });
    });
    describe('with onPrepareError', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.stub(Diagnostics, 'trigger');
            sinon.spy(ads.Android.AdUnit, 'setViews');
            sinon.spy(performanceAdUnit, 'hide');
            sinon.spy(container, 'reconfigure');
            sinon.spy(overlay, 'hide');
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should set video to inactive and video to finish state to error', () => {
            const androidVideoEventHandler = new AndroidVideoEventHandler(videoEventHandlerParams);
            androidVideoEventHandler.onPrepareError('http://test.video.url');
            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);
            const adUnitOverlay = performanceAdUnit.getOverlay();
            if (adUnitOverlay) {
                sinon.assert.called(adUnitOverlay.hide);
            }
            sinon.assert.calledWith(container.reconfigure, 0 /* ENDSCREEN */);
            sinon.assert.called(performanceAdUnit.hide);
        });
    });
    describe('with onAndroidGenericVideoError', () => {
        let sandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            sandbox.stub(Diagnostics, 'trigger');
            sinon.spy(ads.Android.AdUnit, 'setViews');
            sinon.spy(performanceAdUnit, 'hide');
            sinon.spy(container, 'reconfigure');
            sinon.spy(overlay, 'hide');
            sinon.spy(endScreen, 'show');
            sinon.spy(performanceAdUnit, 'onVideoError');
        });
        afterEach(() => {
            sandbox.restore();
        });
        it('should set video to inactive and video to finish state to error, video started', () => {
            performanceAdUnit.setVideoState(VideoState.PLAYING);
            const androidVideoEventHandler = new AndroidVideoEventHandler(videoEventHandlerParams);
            androidVideoEventHandler.onGenericError('http://test.video.url', 1, 0);
            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);
            const adUnitOverlay = performanceAdUnit.getOverlay();
            if (adUnitOverlay) {
                sinon.assert.called(adUnitOverlay.hide);
            }
            sinon.assert.calledWith(container.reconfigure, 0 /* ENDSCREEN */);
            sinon.assert.notCalled(performanceAdUnit.hide);
            sinon.assert.called(performanceAdUnit.onVideoError);
            sinon.assert.called(endScreen.show);
        });
        it('should set video to inactive and video to finish state to error, video not started', () => {
            const androidVideoEventHandler = new AndroidVideoEventHandler(videoEventHandlerParams);
            androidVideoEventHandler.onGenericError('http://test.video.url', 1, 0);
            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);
            const adUnitOverlay = performanceAdUnit.getOverlay();
            if (adUnitOverlay) {
                sinon.assert.called(adUnitOverlay.hide);
            }
            sinon.assert.calledWith(container.reconfigure, 0 /* ENDSCREEN */);
            sinon.assert.called(performanceAdUnit.hide);
        });
    });
});
// ****** XPromo tests ******
describe('xpromo VideoEventHandlersTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let overlay;
    let storageBridge;
    let container;
    let sessionManager;
    let video;
    let metaDataManager;
    let focusManager;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let request;
    let operativeEventManagerParams;
    let placement;
    let xPromoCampaign;
    let xPromoAdUnitParameters;
    let xPromoEndScreen;
    let videoEventHandlerParams;
    let xPromoAdUnit;
    let xPromoVideoEventHandler;
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
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core, request, storageBridge);
        xPromoCampaign = TestFixtures.getXPromoCampaign();
        privacySDK = sinon.createStubInstance(PrivacySDK);
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        operativeEventManagerParams = {
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
            campaign: xPromoCampaign,
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: privacySDK,
            userPrivacyManager: privacyManager
        };
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
        video = new Video('', TestFixtures.getSession());
        placement = TestFixtures.getPlacement();
        const campaign = TestFixtures.getCampaign();
        const xpromoPrivacy = new Privacy(platform, xPromoCampaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en_FI');
        const videoOverlayParameters = {
            deviceInfo: deviceInfo,
            campaign: campaign,
            coreConfig: coreConfig,
            placement: placement,
            clientInfo: clientInfo,
            platform: platform,
            ads: ads
        };
        overlay = new VideoOverlay(videoOverlayParameters, xpromoPrivacy, false, false);
        const xpromoEndScreenParams = {
            platform,
            core,
            language: 'en',
            gameId: '12345',
            privacy: xpromoPrivacy,
            showGDPRBanner: false,
            abGroup: coreConfig.getAbGroup(),
            targetGameName: xPromoCampaign.getGameName()
        };
        xPromoEndScreen = new XPromoEndScreen(xpromoEndScreenParams, xPromoCampaign);
        xPromoAdUnitParameters = {
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
            placement: TestFixtures.getPlacement(),
            campaign: xPromoCampaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            endScreen: xPromoEndScreen,
            overlay: overlay,
            video: video,
            privacy: xpromoPrivacy,
            privacyManager: privacyManager,
            privacySDK: privacySDK
        };
        xPromoAdUnit = new XPromoAdUnit(xPromoAdUnitParameters);
        videoEventHandlerParams = {
            platform,
            core,
            ads,
            adUnit: xPromoAdUnit,
            campaign: xPromoCampaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            placement: TestFixtures.getPlacement(),
            video: video,
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };
        xPromoVideoEventHandler = new XPromoVideoEventHandler(videoEventHandlerParams);
        xPromoAdUnit.setVideoState(VideoState.PREPARING);
    });
    afterEach(() => {
        xPromoAdUnit.setShowing(true);
        return xPromoAdUnit.hide();
    });
    describe('with onVideoCompleted', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(operativeEventManager, 'sendView');
            sinon.spy(overlay, 'hide');
        });
        it('should send view event to HttpKafka on XPromos', () => {
            sinon.spy(operativeEventManager, 'sendHttpKafkaEvent');
            xPromoVideoEventHandler.onCompleted('https://test.com');
            const params = { placement: xPromoAdUnitParameters.placement,
                videoOrientation: xPromoAdUnit.getVideoOrientation() };
            sinon.assert.called(operativeEventManager.sendView);
            sinon.assert.calledWith(operativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoview.v1.json', 'view', params);
        });
    });
    describe('with onVideoPrepared', () => {
        let seekResolved;
        let volumeResolved;
        beforeEach(() => {
            seekResolved = Promise.resolve(void (0));
            volumeResolved = Promise.resolve(void (0));
            sinon.stub(ads.VideoPlayer, 'seekTo').returns(seekResolved);
            sinon.stub(ads.VideoPlayer, 'setVolume').returns(volumeResolved);
            sinon.spy(ads.VideoPlayer, 'play');
        });
        it('should set debug message to xpromo ad if the ad unit is XPromoAdUnit', () => {
            sinon.stub(overlay, 'setDebugMessage');
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            xPromoVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
            sinon.assert.calledWith(overlay.setDebugMessage, 'XPromo');
            stub.restore();
        });
    });
    describe('with video start on XPromos', () => {
        beforeEach(() => {
            video = new Video('', TestFixtures.getSession());
        });
        it('should send start event to HttpKafka on XPromos', (done) => {
            sinon.stub(metaDataManager, 'fetch').callsFake(() => {
                return Promise.resolve(undefined);
            });
            sinon.stub(operativeEventManager, 'sendHttpKafkaEvent').callsFake(() => {
                done();
            });
            xPromoAdUnit.setVideoState(VideoState.READY);
            xPromoVideoEventHandler.onProgress(1);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9FdmVudEhhbmRsZXJzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvVmlkZW9FdmVudEhhbmRsZXJzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFtQixXQUFXLEVBQXFCLE1BQU0sd0NBQXdDLENBQUM7QUFDekcsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3JELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBR3RGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBTXJFLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFJaEQsT0FBTyxFQUFFLFlBQVksRUFBMkIsTUFBTSx3QkFBd0IsQ0FBQztBQUMvRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9B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