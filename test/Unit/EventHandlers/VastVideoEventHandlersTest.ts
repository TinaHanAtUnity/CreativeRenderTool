import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { MoatViewabilityService } from 'Ads/Utilities/MoatViewabilityService';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { MOAT } from 'Ads/Views/MOAT';
import { Overlay } from 'Ads/Views/Overlay';
import { assert } from 'chai';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';

import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';

import EventTestVast from 'xml/EventTestVast.xml';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';

describe('VastVideoEventHandler tests', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let campaign: VastCampaign;
    let placement: Placement;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let overlay: Overlay;
    let vastEndScreen: VastEndScreen;
    let wakeUpManager: WakeUpManager;
    let request: Request;
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
    let gdprManager: GdprManager;
    let privacy: AbstractPrivacy;
    let programmaticTrackingService: ProgrammaticTrackingService;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        campaign = TestFixtures.getEventVastCampaign();
        clientInfo = TestFixtures.getClientInfo();
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        privacy = new GDPRPrivacy(nativeBridge, campaign, gdprManager, false, false, false);
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });

        deviceInfo = new AndroidDeviceInfo(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, request);

        const configuration = TestFixtures.getConfiguration();
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: campaign
        });

        gdprManager = sinon.createStubInstance(GdprManager);

        vastAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: campaign,
            configuration: configuration,
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: campaign.getVideo(),
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };

        testAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
        sinon.spy(testAdUnit, 'hide');

        moat = sinon.createStubInstance(MOAT);
        sandbox.stub(MoatViewabilityService, 'getMoat').returns(moat);

        videoEventHandlerParams = {
            nativeBrige: nativeBridge,
            adUnit: testAdUnit,
            campaign: campaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            configuration: configuration,
            placement: placement,
            video: campaign.getVideo(),
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };

        vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('onVideoPrepared', () => {

        beforeEach(() => {
            vastVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
        });

        it('initalizes moat', () => {
            sinon.assert.called(<sinon.SinonStub>moat.init);
        });
    });

    describe('onVideoStart', () => {

        it('sends start events from VAST', () => {
            // given a VAST placement
            // when the session manager is told that the video has started
            // then the VAST start callback URL should be requested by the event manager
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
            mockEventManager.expects('sendEvent').withArgs('vast impression', '12345', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=123');
            mockEventManager.expects('sendEvent').withArgs('vast creativeView', '12345', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

            vastVideoEventHandler.onPlay('https://test.com');

            mockEventManager.verify();
        });

        it('sends start events from VAST and custom tracking URLs', () => {
            // given a VAST placement
            // when the session manager is told that the video has started
            // then the VAST start callback URL should be requested by the event manager
            const vastParser = TestFixtures.getVastParser();
            const vastXml = EventTestVast;
            const vast = vastParser.parseVast(vastXml);

            const customTracking = {
                'start': [
                    'http://customTrackingUrl/start',
                    'http://customTrackingUrl/start2',
                    'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=%SDK_VERSION%'
                ]
            };
            const campaignWithTrackers = TestFixtures.getEventVastCampaign();
            campaignWithTrackers.getVast().set('additionalTrackingEvents', customTracking);
            vastAdUnitParameters.campaign = campaignWithTrackers;

            const adUnitWithTrackers = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            videoEventHandlerParams.adUnit = adUnitWithTrackers;
            videoEventHandlerParams.campaign = vastAdUnitParameters.campaign;
            vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);

            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://customTrackingUrl/start');
            mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://customTrackingUrl/start2');
            mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://customTrackingUrl/start3/123/blah?sdkVersion=2000');
            mockEventManager.expects('sendEvent').withArgs('vast start', '12345', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
            mockEventManager.expects('sendEvent').withArgs('vast impression', '12345', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=123');
            mockEventManager.expects('sendEvent').withArgs('vast creativeView', '12345', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

            vastVideoEventHandler.onPlay('https://test.com');

            mockEventManager.verify();
        });

        it('tiggers moat play event', () => {
            vastVideoEventHandler.onPlay('https://test.com');
            sinon.assert.called(<sinon.SinonStub>moat.play);
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
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            const expectation = mockEventManager.expects('sendEvent').once();
            vastVideoEventHandler.onCompleted('https://test.com');
            mockEventManager.verify();

            assert.equal(expectation.getCall(0).args[0], 'vast complete', 'Second event sent should be \'vast complete\'');
            assert.equal(expectation.getCall(0).args[1], '12345', 'Second event session id should be 12345');
            assert.equal(expectation.getCall(0).args[2], 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123', 'Incorrect second event URL');
        });

        it('should hide ad unit', () => {
            vastVideoEventHandler.onCompleted('https://test.com');
            sinon.assert.called(<sinon.SinonSpy>testAdUnit.hide);
        });

        it ('should trigger moat completed event', () => {
            vastVideoEventHandler.onCompleted('https://test.com');
            sinon.assert.called(<sinon.SinonStub>moat.completed);
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

        it ('should send moat pause event', () => {
            sinon.assert.calledWith(<sinon.SinonStub>moat.pause, 4);
        });
    });

    describe('onVolumeChange', () => {
        beforeEach(() => {
            vastVideoEventHandler.onVolumeChange(1, 10);
        });

        it ('should call moat volumeChange event', () => {
            sinon.assert.calledWith(<sinon.SinonStub>moat.volumeChange, 0.1);
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
            sandbox.restore();
            vastEndScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters);
            sinon.spy(vastEndScreen, 'show');
            vastAdUnitParameters.endScreen = vastEndScreen;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            videoEventHandlerParams.adUnit = vastAdUnit;
            vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
        });

        it('should show end screen when onVideoCompleted', () => {
            vastVideoEventHandler.onCompleted('https://test.com');

            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            sinon.assert.notCalled(<sinon.SinonSpy>testAdUnit.hide);
        });

        it('should show end screen when onVideoError', () => {
            // Cause an error by giving too large duration
            vastAdUnit.setVideoState(VideoState.PREPARING);
            vastVideoEventHandler.onPrepared('https://test.com', 50000, 1024, 768);

            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            sinon.assert.notCalled(<sinon.SinonSpy>testAdUnit.hide);
        });
    });

    describe('sendImpressionEvent', () => {
        it('should replace "%ZONE%" in the url with the placement id', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/456';
            sandbox.stub(campaign, 'getImpressionUrls').returns([ urlTemplate ]);

            const mockEventManager = sinon.mock(thirdPartyEventManager);
            const expectation = mockEventManager.expects('sendEvent').thrice();
            vastVideoEventHandler.onPlay('https://test.com');
            mockEventManager.verify();
            assert.equal(expectation.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(expectation.getCall(0).args[2], 'http://foo.biz/' + placement.getId() + '/456', 'First event url incorrect');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version', () => {
            const urlTemplate = 'http://foo.biz/%SDK_VERSION%/456';
            sandbox.stub(campaign, 'getImpressionUrls').returns([ urlTemplate ]);

            const mockEventManager = sinon.mock(thirdPartyEventManager);
            const expectation = mockEventManager.expects('sendEvent').thrice();
            vastVideoEventHandler.onPlay('https://test.com');
            mockEventManager.verify();
            assert.equal(expectation.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(expectation.getCall(0).args[2], 'http://foo.biz/2000/456', 'First event url incorrect');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
            const urlTemplate = 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%';
            sandbox.stub(campaign, 'getImpressionUrls').returns([ urlTemplate ]);

            const mockEventManager = sinon.mock(thirdPartyEventManager);
            const expectation = mockEventManager.expects('sendEvent').thrice();
            vastVideoEventHandler.onPlay('https://test.com');
            mockEventManager.verify();
            assert.equal(expectation.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(expectation.getCall(0).args[2], 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=2000', 'First event url incorrect');
        });

        it('should replace both "%ZONE%" and "%SDK_VERSION%" in the url with corresponding parameters', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/%SDK_VERSION%/456';
            sandbox.stub(campaign, 'getImpressionUrls').returns([ urlTemplate ]);

            const mockEventManager = sinon.mock(thirdPartyEventManager);
            const expectation = mockEventManager.expects('sendEvent').thrice();
            vastVideoEventHandler.onPlay('https://test.com');
            mockEventManager.verify();
            assert.equal(expectation.getCall(0).args[0], 'vast impression', 'First event sent should be \'vast impression\'');
            assert.equal(expectation.getCall(0).args[2], 'http://foo.biz/' + placement.getId() + '/2000/456', 'First event url incorrect');
        });
    });
});
