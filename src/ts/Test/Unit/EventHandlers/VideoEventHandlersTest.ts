import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { Double } from 'Utilities/Double';
import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request } from 'Utilities/Request';
import { Overlay } from 'Views/Overlay';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Diagnostics } from 'Utilities/Diagnostics';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Video } from 'Models/Assets/Video';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';

describe('VideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: PerformanceEndScreen;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let sessionManager: SessionManager;
    let video: Video;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let vastAdUnitParameters: IVastAdUnitParameters;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));

        overlay = <Overlay><any> {
            setVideoProgress: sinon.spy(),
            setVideoDuration: sinon.spy(),
            isMuted: sinon.spy(),
            hide: sinon.spy(),
            setSpinnerEnabled: sinon.spy(),
            setSkipVisible: sinon.spy(),
            setMuteEnabled: sinon.spy(),
            setVideoDurationEnabled: sinon.spy(),
            setDebugMessage: sinon.spy(),
            setDebugMessageVisible: sinon.spy(),
            setCallButtonVisible: sinon.spy(),
            setFadeEnabled: sinon.spy()
        };

        endScreen = <PerformanceEndScreen><any> {
            show: sinon.spy(),
            hide: sinon.spy(),
            container: sinon.spy()
        };

        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);

        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge);
        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        video = new Video('');

        const vast = new Vast([], []);
        vastAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: new VastCampaign(vast, 'campaignId', TestFixtures.getSession(), 'gamerId', 12),
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: video
        };

        performanceAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: <PerformanceCampaign><any>{
                getVideo: () => video,
                getStreamingVideo: () => video,
                getSession: () => TestFixtures.getSession()
            },
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            endScreen: endScreen,
            overlay: overlay,
            video: video
        };

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        sinon.stub(performanceAdUnit, 'isPrepareCalled').returns(true);
    });

    describe('with onVideoPlay', () => {
        it('should set progress interval', () => {
            sinon.stub(nativeBridge.VideoPlayer, 'setProgressEventInterval').returns(Promise.resolve(void(0)));
            VideoEventHandlers.onVideoPlay(nativeBridge, performanceAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setProgressEventInterval, performanceAdUnit.getProgressInterval());
        });
    });

    describe('with video start', () => {
        beforeEach(() => {
            video = new Video('');
            performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        });

        it('should set video started', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, 1, TestFixtures.getConfiguration());

            assert.isTrue(performanceAdUnit.getVideo().hasStarted());
        });

        it('should send start event to backend', () => {
            sinon.spy(operativeEventManager, 'sendStart');

            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, 1, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendStart, performanceAdUnit);
        });

        it('should invoke onUnityAdsStart callback ', () => {
            sinon.stub(nativeBridge.Listener, 'sendStartEvent').returns(Promise.resolve(void(0)));

            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, 1, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendStartEvent, TestFixtures.getPlacement().getId());
        });
    });

    describe('with onVideoProgress', () => {
        beforeEach(() => {
            sinon.spy(performanceAdUnit.getVideo(), 'setPosition');
        });

        it('with positive position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, 5, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>performanceAdUnit.getVideo().setPosition, 5);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, 5);
        });

        it('with negative position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, -5, TestFixtures.getConfiguration());

            sinon.assert.notCalled(<sinon.SinonSpy>performanceAdUnit.getVideo().setPosition);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, -5);
        });

        it('should send first quartile event', () => {
            sinon.spy(operativeEventManager, 'sendFirstQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(4000);
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, 6000, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendFirstQuartile, performanceAdUnit);
        });

        it('should send midpoint event', () => {
            sinon.spy(operativeEventManager, 'sendMidpoint');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(9000);
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, 11000, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendMidpoint, performanceAdUnit);
        });

        it('should send third quartile event', () => {
            sinon.spy(operativeEventManager, 'sendThirdQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(14000);
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, performanceAdUnit, 16000, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, performanceAdUnit);
        });
    });

    describe('with onVideoCompleted', () => {
        let prom: Promise<boolean>;

        beforeEach(() => {
            prom = Promise.resolve(false);

            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(operativeEventManager, 'sendView');
        });

        it('should set video to inactive', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, performanceAdUnit);

            assert.isFalse(performanceAdUnit.isActive());
        });

        it('should set finnish state to COMPLETED', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, performanceAdUnit);

            assert.equal(performanceAdUnit.getFinishState(), FinishState.COMPLETED);
        });

        it('should send view to session manager', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, performanceAdUnit);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, performanceAdUnit);
        });

        it('should hide overlay', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, performanceAdUnit);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }
        });
    });

    describe('with onVideoPrepared', () => {
        let seekResolved: Promise<void>, volumeResolved: Promise<void>;

        beforeEach(() => {
            seekResolved = Promise.resolve(void(0));
            volumeResolved = Promise.resolve(void(0));

            sinon.stub(nativeBridge.VideoPlayer, 'seekTo').returns(seekResolved);
            sinon.stub(nativeBridge.VideoPlayer, 'setVolume').returns(volumeResolved);
            sinon.spy(nativeBridge.VideoPlayer, 'play');
        });

        it('should set video duration for overlay', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoDuration, 10);
        });

        it('should set video volume to 1.0 by default', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });

        it('should set video volume to 0.0 when overlay says it is muted', () => {
            overlay.isMuted = sinon.mock().returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should just play when video position is set to 0', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            return volumeResolved.then(() => {
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
                sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo);
            });
        });

        it('should seek and play when video position is set to greater than 0', () => {
            performanceAdUnit.getVideo().setPosition(123);

            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);
            return volumeResolved.then(() => seekResolved).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo, 123);
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
            });
        });

        it('should set debug message visibility to true if the debug overlay is enabled in the metadata', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessageVisible, true);

            stub.restore();
        });

        it('should set debug message to performance ad if the ad unit is not VAST', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Performance Ad');

            stub.restore();
        });

        it('should set debug message to programmatic ad if the ad unit is VAST', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            const vast = new Vast([], []);
            sinon.stub(vast, 'getVideoUrl').returns(video.getUrl());
            const vastCampaign = new VastCampaign(vast, 'campaignId', TestFixtures.getSession(), 'gamerId', 12);
            sinon.stub(vastCampaign, 'getVideo').returns(video);
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Programmatic Ad');

            stub.restore();
        });

        it('should not set debug message when the debug overlay is disabled in the metadata', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(false);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setDebugMessage);

            stub.restore();
        });

        it('should set call button visibility to true if the ad unit is VAST and has a click trough URL', () => {
            const vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            vastAdUnitParameters.campaign = vastCampaign;
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setCallButtonVisible, true);
        });

        it('should not set call button visibility to true if the ad unit is VAST but there is no click trough URL', () => {
            const vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            vastAdUnitParameters.campaign = vastCampaign;
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setCallButtonVisible);
        });

        it('should not set call button visibility to true if the ad unit is not VAST', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setCallButtonVisible);
        });

        it('should set fade enabled to false if the ad unit is VAST and has a click trough URL', () => {
            const vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            vastAdUnitParameters.campaign = vastCampaign;
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setFadeEnabled, false);
        });

        it('should not set fade enabled to false if the ad unit is VAST but there is no click trough URL', () => {
            const vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            vastAdUnitParameters.campaign = vastCampaign;
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setFadeEnabled);
        });

        it('should fade out overlay controls if the ad unit is not VAST', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setFadeEnabled);
        });
    });

    describe('with onPrepareError', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(Diagnostics, 'trigger');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
            sinon.stub(performanceAdUnit, 'hide');
            sinon.spy(container, 'reconfigure');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set video to inactive and video to finish state to error', () => {
            VideoEventHandlers.onPrepareError(nativeBridge, performanceAdUnit, 'http://test.video.url');

            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }
            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
            sinon.assert.called(<sinon.SinonSpy>performanceAdUnit.hide);
        });
    });

    describe('with onAndroidGenericVideoError', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(Diagnostics, 'trigger');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
            sinon.stub(performanceAdUnit, 'hide');
            sinon.spy(container, 'reconfigure');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set video to inactive and video to finish state to error, video started', () => {
            performanceAdUnit.getVideo().setStarted(true);
            VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, performanceAdUnit, 1, 0, 'http://test.video.url');

            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }

            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
            sinon.assert.notCalled(<sinon.SinonSpy>performanceAdUnit.hide);
        });

        it('should set video to inactive and video to finish state to error, video not started', () => {
            VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, performanceAdUnit, 1, 0, 'http://test.video.url');

            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }

            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
            sinon.assert.called(<sinon.SinonSpy>performanceAdUnit.hide);
        });
    });
});
