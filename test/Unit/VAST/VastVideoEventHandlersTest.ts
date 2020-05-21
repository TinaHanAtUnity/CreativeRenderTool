import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager, ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { MOAT } from 'Ads/Views/MOAT';
import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
import { IStoreApi } from 'Store/IStore';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';

describe('VastVideoEventHandler tests', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let store: IStoreApi;
    let storageBridge: StorageBridge;
    let container: AdUnitContainer;
    let campaign: VastCampaign;
    let placement: Placement;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let overlay: VideoOverlay;
    let vastEndScreen: VastEndScreen;
    let wakeUpManager: WakeUpManager;
    let request: RequestManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let sessionManager: SessionManager;
    let testAdUnit: VastAdUnit;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let vastAdUnitParameters: IVastAdUnitParameters;
    let moat: MOAT;
    let sandbox: sinon.SinonSandbox;
    let vastVideoEventHandler: VastVideoEventHandler;
    let videoEventHandlerParams: IVideoEventHandlerParams;
    let privacyManager: UserPrivacyManager;
    let privacy: Privacy;
    let openMeasurement: VastOpenMeasurementController | undefined;

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

        const videoOverlayParameters: IVideoOverlayParameters<Campaign> = {
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

        vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
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
                sandbox.stub(openMeasurement!.getOMAdViewBuilder(), 'setVideoView');

                return testAdUnit.getVideoViewRectangle();
            });

            it('initalizes moat', () => {
                sinon.assert.called(<sinon.SinonStub>moat.init);
            });

            it('should call om session start on videoview receive success', () => {
                sinon.assert.called(<sinon.SinonStub>openMeasurement!.sessionStart);
            });

            it('should call om session start once', () => {
                vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
                vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
                sinon.assert.calledOnce(<sinon.SinonStub>openMeasurement!.sessionStart);
            });
        });

        context('getVideoViewRectangle fail', () => {
            beforeEach(() => {
                sandbox.stub(testAdUnit, 'getVideoViewRectangle').returns(Promise.reject(new Error('video rect retrieval failed')));
                vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
            });

            it('should call session start when getting video view fails', () => {
                return testAdUnit.getVideoViewRectangle().catch(() => {
                    sinon.assert.notCalled(<sinon.SinonStub>openMeasurement!.sessionStart);
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
            const spyGetUrl = sinon.spy((<any>thirdPartyEventManager), 'replaceTemplateValuesAndEncodeUrl');

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
            vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);

            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy((<any>thirdPartyEventManager), 'replaceTemplateValuesAndEncodeUrl');

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
            sinon.assert.called(<sinon.SinonStub>moat.play);
        });

        it('tiggers om resume, start events', () => {
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.called(<sinon.SinonStub>openMeasurement!.resume);
            sinon.assert.called(<sinon.SinonStub>openMeasurement!.start);
            sinon.assert.called(<sinon.SinonStub>openMeasurement!.loaded);
            sinon.assert.called(<sinon.SinonStub>openMeasurement!.playerStateChanged);
        });
    });

    describe('onVideoProgress', () => {
        it ('sends moat video progress event', () => {
            vastVideoEventHandler.onProgress(1);
            sinon.assert.called(<sinon.SinonStub>moat.triggerVideoEvent);
        });
    });

    describe('onVideoCompleted', () => {
        it('sends complete events from VAST', () => {
            // given a VAST placement
            // when the session manager is told that the video has completed
            // then the VAST complete callback URL should be requested by the event manager
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy((<any>thirdPartyEventManager), 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onCompleted('https://test.com');

            assert.equal(spySendWithGet.getCall(0).args[0], 'vast complete', 'Second event sent should be \'vast complete\'');
            assert.equal(spySendWithGet.getCall(0).args[1], '12345', 'Second event session id should be 12345');
            assert.equal(spySendWithGet.getCall(0).args[2], 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1', 'Incorrect second event URL');
            sinon.assert.calledWith(spyGetUrl, 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1');
            assert.isTrue(spyGetUrl.returned('http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1'));
        });

        it('should hide ad unit', () => {
            vastVideoEventHandler.onCompleted('https://test.com');
            sinon.assert.called(<sinon.SinonSpy>testAdUnit.hide);
        });

        it ('should trigger viewability completed event', () => {
            vastVideoEventHandler.onCompleted('https://test.com');
            sinon.assert.called(<sinon.SinonStub>moat.completed);
            sinon.assert.called(<sinon.SinonStub>openMeasurement!.completed);
            sinon.assert.called(<sinon.SinonStub>openMeasurement!.sessionFinish);
        });
    });

    describe('onVideoStopped', () => {
        beforeEach(() => {
            vastVideoEventHandler.onStop('https://test.com');
        });

        it ('should send moat stop event', () => {
            sinon.assert.called(<sinon.SinonStub>moat.stop);
        });
    });

    describe('onVideoPaused', () => {
        beforeEach(() => {
            testAdUnit.setVolume(4);
            vastVideoEventHandler.onPause('https://test.com');
        });

        it ('should send viewability pause events', () => {
            sinon.assert.calledWith(<sinon.SinonStub>moat.pause, 4);
            sinon.assert.calledWith(<sinon.SinonStub>openMeasurement!.pause);
        });
    });

    describe('onVolumeChange', () => {
        it ('should call moat volumeChange event', () => {
            vastVideoEventHandler.onVolumeChange(1, 10);
            sinon.assert.calledWith(<sinon.SinonStub>moat.volumeChange, 0.1);
        });

        it('should call om volumeChange event with arguments if videoPlayer unmuted', () => {
            vastVideoEventHandler.onVolumeChange(1, 10);
            sinon.assert.calledWith(<sinon.SinonStub>openMeasurement!.setDeviceVolume, 0.1);
            sinon.assert.calledWith(<sinon.SinonStub>openMeasurement!.volumeChange, 1);
        });

        it('should call om volumeChange event with arguments if videoPlayer muted', () => {
            testAdUnit.setVideoPlayerMuted(true);
            vastVideoEventHandler.onVolumeChange(1, 10);
            sinon.assert.calledWith(<sinon.SinonStub>openMeasurement!.setDeviceVolume, 0.1);
            sinon.assert.calledWith(<sinon.SinonStub>openMeasurement!.volumeChange, 0);
        });
    });

    describe('onVideoError', () => {
        it('should hide ad unit', () => {
            // Cause an error by giving too large duration
            testAdUnit.setVideoState(VideoState.PREPARING);
            vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);
            sinon.assert.called(<sinon.SinonSpy>testAdUnit.hide);
        });
    });

    describe('with companion ad', () => {
        let vastAdUnit: VastAdUnit;

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
            vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
        });

        afterEach(() => {
            vastAdUnit.setShowing(true);
            return vastAdUnit.hide();
        });

        it('should show end screen when onVideoCompleted', () => {
            vastAdUnit.setImpressionOccurred();
            vastVideoEventHandler.onCompleted('https://test.com');

            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            sinon.assert.notCalled(<sinon.SinonSpy>testAdUnit.hide);
        });

        it('should not show end screen when onVideoCompleted without an impression event sent', () => {
            vastVideoEventHandler.onCompleted('https://test.com');

            // Endscreen is not shown if the impression never occurs
            sinon.assert.notCalled(<sinon.SinonSpy>vastEndScreen.show);
            sinon.assert.notCalled(<sinon.SinonSpy>testAdUnit.hide);
        });

        it('should show end screen when onVideoError', () => {
            vastAdUnit.setImpressionOccurred();

            // Cause an error by giving too large duration
            vastAdUnit.setVideoState(VideoState.PREPARING);
            vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);

            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            sinon.assert.notCalled(<sinon.SinonSpy>testAdUnit.hide);
        });

        it('should not show end screen when onVideoError', () => {
            // Cause an error by giving too large duration
            vastAdUnit.setVideoState(VideoState.PREPARING);
            vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);

            sinon.assert.notCalled(<sinon.SinonSpy>vastEndScreen.show);
            sinon.assert.notCalled(<sinon.SinonSpy>testAdUnit.hide);
        });
    });

    describe('sendImpressionEvent', () => {
        it('should replace "%ZONE%" in the url with the placement id', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/456';
            campaign.getImpressionUrls = sinon.stub().returns([urlTemplate]);
            const spySendWithGet = sinon.spy(thirdPartyEventManager, 'sendWithGet');
            const spyGetUrl = sinon.spy((<any>thirdPartyEventManager), 'replaceTemplateValuesAndEncodeUrl');
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
            const spyGetUrl = sinon.spy((<any>thirdPartyEventManager), 'replaceTemplateValuesAndEncodeUrl');
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
            const spyGetUrl = sinon.spy((<any>thirdPartyEventManager), 'replaceTemplateValuesAndEncodeUrl');
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
            const spyGetUrl = sinon.spy((<any>thirdPartyEventManager), 'replaceTemplateValuesAndEncodeUrl');
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.calledThrice(spySendWithGet);
            assert.equal(spySendWithGet.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(spySendWithGet.getCall(0).args[2], 'http://foo.biz/%ZONE%/%SDK_VERSION%/456', 'First event url incorrect');
            sinon.assert.calledWith(spyGetUrl, 'http://foo.biz/%ZONE%/%SDK_VERSION%/456');
            assert.isTrue(spyGetUrl.returned(`http://foo.biz/${placement.getId()}/2000/456`));
        });
    });
});
