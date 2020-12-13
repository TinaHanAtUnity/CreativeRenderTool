import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager, ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { MOAT } from 'Ads/Views/MOAT';
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
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
describe('VastVideoEventHandler tests', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let storageBridge;
    let container;
    let campaign;
    let placement;
    let deviceInfo;
    let clientInfo;
    let overlay;
    let vastEndScreen;
    let wakeUpManager;
    let request;
    let thirdPartyEventManager;
    let sessionManager;
    let testAdUnit;
    let metaDataManager;
    let focusManager;
    let vastAdUnitParameters;
    let moat;
    let sandbox;
    let vastVideoEventHandler;
    let videoEventHandlerParams;
    let privacyManager;
    let privacy;
    let openMeasurement;
    before(() => {
        sandbox = sinon.createSandbox();
    });
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
        campaign = TestFixtures.getEventVastCampaign();
        clientInfo = TestFixtures.getClientInfo();
        container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const coreConfig = TestFixtures.getCoreConfiguration();
        placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            skipEndCardOnClose: false,
            disableVideoControlsFade: false,
            useCloseIconInsteadOfSkipIcon: false,
            adTypes: [],
            refreshDelay: 1000,
            muteVideo: false
        });
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
        sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, {
            [ThirdPartyEventMacro.ZONE]: placement.getId(),
            [ThirdPartyEventMacro.SDK_VERSION]: '2000'
        });
        sessionManager = new SessionManager(core, request, storageBridge);
        const adsConfig = TestFixtures.getAdsConfiguration();
        const privacySDK = sinon.createStubInstance(PrivacySDK);
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
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const omInstance = sinon.createStubInstance(OpenMeasurement);
        const omViewBuilder = new OpenMeasurementAdViewBuilder(campaign);
        const omController = new VastOpenMeasurementController(platform, placement, [omInstance], omViewBuilder, clientInfo, deviceInfo);
        sandbox.stub(omController, 'sessionStart');
        sandbox.stub(omController, 'resume');
        sandbox.stub(omController, 'completed');
        sandbox.stub(omController, 'pause');
        sandbox.stub(omController, 'setDeviceVolume');
        sandbox.stub(omController, 'start');
        sandbox.stub(omController, 'loaded');
        sandbox.stub(omController, 'sessionFinish');
        sandbox.stub(omController, 'volumeChange');
        sandbox.stub(omController, 'playerStateChanged');
        vastAdUnitParameters = {
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
            endScreen: undefined,
            overlay: overlay,
            video: campaign.getVideo(),
            privacyManager: privacyManager,
            privacy,
            om: omController,
            privacySDK: privacySDK
        };
        testAdUnit = new VastAdUnit(vastAdUnitParameters);
        sinon.spy(testAdUnit, 'hide');
        moat = sinon.createStubInstance(MOAT);
        sandbox.stub(MoatViewabilityService, 'getMoat').returns(moat);
        openMeasurement = vastAdUnitParameters.om;
        sandbox.stub(testAdUnit, 'getOpenMeasurementController').returns(openMeasurement);
        videoEventHandlerParams = {
            platform,
            core,
            ads,
            adUnit: testAdUnit,
            campaign: campaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            placement: placement,
            video: campaign.getVideo(),
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };
        vastVideoEventHandler = new VastVideoEventHandler(videoEventHandlerParams);
    });
    afterEach(() => {
        sandbox.restore();
        testAdUnit.setShowing(true);
        return testAdUnit.hide();
    });
    describe('onVideoPrepared', () => {
        context('getVideoViewRectangle success', () => {
            beforeEach(() => {
                sandbox.stub(testAdUnit, 'getVideoViewRectangle').returns(Promise.resolve([0, 0, 0, 0]));
                vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
                sandbox.stub(openMeasurement.getOMAdViewBuilder(), 'setVideoView');
                return testAdUnit.getVideoViewRectangle();
            });
            it('initalizes moat', () => {
                sinon.assert.called(moat.init);
            });
            it('should call om session start on videoview receive success', () => {
                sinon.assert.called(openMeasurement.sessionStart);
            });
            it('should call om session start once', () => {
                vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
                vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
                sinon.assert.calledOnce(openMeasurement.sessionStart);
            });
        });
        context('getVideoViewRectangle fail', () => {
            beforeEach(() => {
                sandbox.stub(testAdUnit, 'getVideoViewRectangle').returns(Promise.reject(new Error('video rect retrieval failed')));
                vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
            });
            it('should call session start when getting video view fails', () => {
                return testAdUnit.getVideoViewRectangle().catch(() => {
                    sinon.assert.notCalled(openMeasurement.sessionStart);
                });
            });
        });
    });
    describe('onVideoStart', () => {
        it('sends start events from VAST', () => {
            // given a VAST placement
            // when the session manager is told that the video has started
            // then the VAST start callback URL should be requested by the event manager
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy(thirdPartyEventManager, 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.calledWith(spySendWithGet, 'vast start', '12345', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            sinon.assert.calledWith(spySendWithGet, 'vast impression', '12345', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.scanscout.com&C8=scanscout.com&C9=http%3A%2F%2Fwww.scanscout.com&C10=xn&rn=-103217130');
            sinon.assert.calledWith(spySendWithGet, 'vast creativeView', '12345', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            sinon.assert.calledWith(spyGetUrl, 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            assert.isTrue(spyGetUrl.returned('http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'));
            sinon.assert.calledWith(spyGetUrl, 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.scanscout.com&C8=scanscout.com&C9=http%3A%2F%2Fwww.scanscout.com&C10=xn&rn=-103217130');
            assert.isTrue(spyGetUrl.returned('http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.scanscout.com&C8=scanscout.com&C9=http%3A%2F%2Fwww.scanscout.com&C10=xn&rn=-103217130'));
            sinon.assert.calledWith(spyGetUrl, 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            assert.isTrue(spyGetUrl.returned('http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'));
        });
        it('sends start events from VAST and custom tracking URLs', () => {
            const customTracking = {
                'start': [
                    'http://customTrackingUrl/start',
                    'http://customTrackingUrl/start2',
                    'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=%SDK_VERSION%'
                ]
            };
            const overlayContainer = overlay.container();
            if (overlayContainer && overlayContainer.parentElement) {
                overlayContainer.parentElement.removeChild(overlayContainer);
            }
            const campaignWithTrackers = TestFixtures.getEventVastCampaign();
            campaignWithTrackers.getVast().set('additionalTrackingEvents', customTracking);
            vastAdUnitParameters.campaign = campaignWithTrackers;
            const adUnitWithTrackers = new VastAdUnit(vastAdUnitParameters);
            videoEventHandlerParams.adUnit = adUnitWithTrackers;
            videoEventHandlerParams.campaign = vastAdUnitParameters.campaign;
            vastVideoEventHandler = new VastVideoEventHandler(videoEventHandlerParams);
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy(thirdPartyEventManager, 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.calledWith(spySendWithGet, 'vast start', '12345', 'http://customTrackingUrl/start');
            sinon.assert.calledWith(spySendWithGet, 'vast start', '12345', 'http://customTrackingUrl/start2');
            sinon.assert.calledWith(spySendWithGet, 'vast start', '12345', 'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=%SDK_VERSION%');
            sinon.assert.calledWith(spySendWithGet, 'vast start', '12345', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            sinon.assert.calledWith(spySendWithGet, 'vast impression', '12345', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.scanscout.com&C8=scanscout.com&C9=http%3A%2F%2Fwww.scanscout.com&C10=xn&rn=-103217130');
            sinon.assert.calledWith(spySendWithGet, 'vast creativeView', '12345', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            sinon.assert.calledWith(spyGetUrl, 'http://customTrackingUrl/start');
            assert.isTrue(spyGetUrl.returned('http://customTrackingUrl/start'));
            sinon.assert.calledWith(spyGetUrl, 'http://customTrackingUrl/start2');
            assert.isTrue(spyGetUrl.returned('http://customTrackingUrl/start2'));
            sinon.assert.calledWith(spyGetUrl, 'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=%SDK_VERSION%');
            assert.isTrue(spyGetUrl.returned('http://customTrackingUrl/start3/123/blah?sdkVersion=2000'));
            sinon.assert.calledWith(spyGetUrl, 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            assert.isTrue(spyGetUrl.returned('http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'));
            sinon.assert.calledWith(spyGetUrl, 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.scanscout.com&C8=scanscout.com&C9=http%3A%2F%2Fwww.scanscout.com&C10=xn&rn=-103217130');
            assert.isTrue(spyGetUrl.returned('http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.scanscout.com&C8=scanscout.com&C9=http%3A%2F%2Fwww.scanscout.com&C10=xn&rn=-103217130'));
            sinon.assert.calledWith(spyGetUrl, 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            assert.isTrue(spyGetUrl.returned('http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'));
            adUnitWithTrackers.setShowing(true);
            return adUnitWithTrackers.hide();
        });
        it('tiggers moat play event', () => {
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.called(moat.play);
        });
        it('tiggers om resume, start events', () => {
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.called(openMeasurement.resume);
            sinon.assert.called(openMeasurement.start);
            sinon.assert.called(openMeasurement.loaded);
            sinon.assert.called(openMeasurement.playerStateChanged);
        });
    });
    describe('onVideoProgress', () => {
        it('sends moat video progress event', () => {
            vastVideoEventHandler.onProgress(1);
            sinon.assert.called(moat.triggerVideoEvent);
        });
    });
    describe('onVideoCompleted', () => {
        it('sends complete events from VAST', () => {
            // given a VAST placement
            // when the session manager is told that the video has completed
            // then the VAST complete callback URL should be requested by the event manager
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy(thirdPartyEventManager, 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onCompleted('https://test.com');
            assert.equal(spySendWithGet.getCall(0).args[0], 'vast complete', 'Second event sent should be \'vast complete\'');
            assert.equal(spySendWithGet.getCall(0).args[1], '12345', 'Second event session id should be 12345');
            assert.equal(spySendWithGet.getCall(0).args[2], 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1', 'Incorrect second event URL');
            sinon.assert.calledWith(spyGetUrl, 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            assert.isTrue(spyGetUrl.returned('http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'));
        });
        it('should hide ad unit', () => {
            vastVideoEventHandler.onCompleted('https://test.com');
            sinon.assert.called(testAdUnit.hide);
        });
        it('should trigger viewability completed event', () => {
            vastVideoEventHandler.onCompleted('https://test.com');
            sinon.assert.called(moat.completed);
            sinon.assert.called(openMeasurement.completed);
            sinon.assert.called(openMeasurement.sessionFinish);
        });
    });
    describe('onVideoStopped', () => {
        beforeEach(() => {
            vastVideoEventHandler.onStop('https://test.com');
        });
        it('should send moat stop event', () => {
            sinon.assert.called(moat.stop);
        });
    });
    describe('onVideoPaused', () => {
        beforeEach(() => {
            testAdUnit.setVolume(4);
            vastVideoEventHandler.onPause('https://test.com');
        });
        it('should send viewability pause events', () => {
            sinon.assert.calledWith(moat.pause, 4);
            sinon.assert.calledWith(openMeasurement.pause);
        });
    });
    describe('onVolumeChange', () => {
        it('should call moat volumeChange event', () => {
            vastVideoEventHandler.onVolumeChange(1, 10);
            sinon.assert.calledWith(moat.volumeChange, 0.1);
        });
        it('should call om volumeChange event with arguments if videoPlayer unmuted', () => {
            vastVideoEventHandler.onVolumeChange(1, 10);
            sinon.assert.calledWith(openMeasurement.setDeviceVolume, 0.1);
            sinon.assert.calledWith(openMeasurement.volumeChange, 1);
        });
        it('should call om volumeChange event with arguments if videoPlayer muted', () => {
            testAdUnit.setVideoPlayerMuted(true);
            vastVideoEventHandler.onVolumeChange(1, 10);
            sinon.assert.calledWith(openMeasurement.setDeviceVolume, 0.1);
            sinon.assert.calledWith(openMeasurement.volumeChange, 0);
        });
    });
    describe('onVideoError', () => {
        it('should hide ad unit', () => {
            // Cause an error by giving too large duration
            testAdUnit.setVideoState(VideoState.PREPARING);
            vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);
            sinon.assert.called(testAdUnit.hide);
        });
    });
    describe('with companion ad', () => {
        let vastAdUnit;
        beforeEach(() => {
            const overlayContainer = overlay.container();
            if (overlayContainer && overlayContainer.parentElement) {
                overlayContainer.parentElement.removeChild(overlayContainer);
            }
            sandbox.restore();
            vastEndScreen = new VastStaticEndScreen(vastAdUnitParameters);
            sinon.spy(vastEndScreen, 'show');
            vastAdUnitParameters.endScreen = vastEndScreen;
            vastAdUnit = new VastAdUnit(vastAdUnitParameters);
            videoEventHandlerParams.adUnit = vastAdUnit;
            vastVideoEventHandler = new VastVideoEventHandler(videoEventHandlerParams);
        });
        afterEach(() => {
            vastAdUnit.setShowing(true);
            return vastAdUnit.hide();
        });
        it('should show end screen when onVideoCompleted', () => {
            vastAdUnit.setImpressionOccurred();
            vastVideoEventHandler.onCompleted('https://test.com');
            sinon.assert.called(vastEndScreen.show);
            sinon.assert.notCalled(testAdUnit.hide);
        });
        it('should not show end screen when onVideoCompleted without an impression event sent', () => {
            vastVideoEventHandler.onCompleted('https://test.com');
            // Endscreen is not shown if the impression never occurs
            sinon.assert.notCalled(vastEndScreen.show);
            sinon.assert.notCalled(testAdUnit.hide);
        });
        it('should show end screen when onVideoError', () => {
            vastAdUnit.setImpressionOccurred();
            // Cause an error by giving too large duration
            vastAdUnit.setVideoState(VideoState.PREPARING);
            vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);
            sinon.assert.called(vastEndScreen.show);
            sinon.assert.notCalled(testAdUnit.hide);
        });
        it('should not show end screen when onVideoError', () => {
            // Cause an error by giving too large duration
            vastAdUnit.setVideoState(VideoState.PREPARING);
            vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);
            sinon.assert.notCalled(vastEndScreen.show);
            sinon.assert.notCalled(testAdUnit.hide);
        });
    });
    describe('sendImpressionEvent', () => {
        it('should replace "%ZONE%" in the url with the placement id', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/456';
            campaign.getImpressionUrls = sinon.stub().returns([urlTemplate]);
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy(thirdPartyEventManager, 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onPlay('https://test.com');
            assert.equal(spySendWithGet.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(spySendWithGet.getCall(0).args[2], 'http://foo.biz/%ZONE%/456', 'First event url incorrect');
            sinon.assert.calledWith(spyGetUrl, 'http://foo.biz/%ZONE%/456');
            assert.isTrue(spyGetUrl.returned(`http://foo.biz/${placement.getId()}/456`));
        });
        it('should replace "%SDK_VERSION%" in the url with the SDK version', () => {
            const urlTemplate = 'http://foo.biz/%SDK_VERSION%/456';
            campaign.getImpressionUrls = sinon.stub().returns([urlTemplate]);
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy(thirdPartyEventManager, 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.calledThrice(spySendWithGet);
            assert.equal(spySendWithGet.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(spySendWithGet.getCall(0).args[2], 'http://foo.biz/%SDK_VERSION%/456', 'First event url incorrect');
            sinon.assert.calledWith(spyGetUrl, 'http://foo.biz/%SDK_VERSION%/456');
            assert.isTrue(spyGetUrl.returned('http://foo.biz/2000/456'));
        });
        it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
            const urlTemplate = 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%';
            campaign.getImpressionUrls = sinon.stub().returns([urlTemplate]);
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy(thirdPartyEventManager, 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.calledThrice(spySendWithGet);
            assert.equal(spySendWithGet.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(spySendWithGet.getCall(0).args[2], 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%', 'First event url incorrect');
            sinon.assert.calledWith(spyGetUrl, 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%');
            assert.isTrue(spyGetUrl.returned('http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=2000'));
        });
        it('should replace both "%ZONE%" and "%SDK_VERSION%" in the url with corresponding parameters', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/%SDK_VERSION%/456';
            campaign.getImpressionUrls = sinon.stub().returns([urlTemplate]);
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy(thirdPartyEventManager, 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.calledThrice(spySendWithGet);
            assert.equal(spySendWithGet.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(spySendWithGet.getCall(0).args[2], 'http://foo.biz/%ZONE%/%SDK_VERSION%/456', 'First event url incorrect');
            sinon.assert.calledWith(spyGetUrl, 'http://foo.biz/%ZONE%/%SDK_VERSION%/456');
            assert.isTrue(spyGetUrl.returned(`http://foo.biz/${placement.getId()}/2000/456`));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFZpZGVvRXZlbnRIYW5kbGVyc1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvVkFTVC9WYXN0VmlkZW9FdmVudEhhbmRsZXJzVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFtQixXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHckQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDckUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ25HLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3RDLE9BQU8sRUFBRSxZQUFZLEVBQTJCLE1BQU0sd0JBQXdCLENBQUM7QUFDL0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0s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