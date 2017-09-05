import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { Double } from 'Utilities/Double';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { EventManager } from 'Managers/EventManager';
import { Request } from 'Utilities/Request';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Diagnostics } from 'Utilities/Diagnostics';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Video } from 'Models/Assets/Video';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';

describe('VideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: EndScreen;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let sessionManager: SessionManager;
    let video: Video;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;

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

        endScreen = <EndScreen><any> {
            show: sinon.spy(),
            hide: sinon.spy(),
            container: sinon.spy()
        };

        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager))), metaDataManager);
        video = new Video('');
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(), <PerformanceCampaign><any>{
            getVideo: () => video,
            getStreamingVideo: () => video,
            getSession: () => TestFixtures.getSession()
        }, video, overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null, endScreen);
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
            performanceAdUnit = new PerformanceAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(), <PerformanceCampaign><any>{
                getVideo: () => video,
                getStreamingVideo: () => video,
                getSession: () => TestFixtures.getSession()
            }, video, overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null, endScreen);
        });

        it('should set video started', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 1, TestFixtures.getConfiguration());

            assert.isTrue(performanceAdUnit.getVideo().hasStarted());
        });

        it('should send start event to backend', () => {
            sinon.spy(sessionManager, 'sendStart');

            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 1, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendStart, performanceAdUnit);
        });

        it('should invoke onUnityAdsStart callback ', () => {
            sinon.stub(nativeBridge.Listener, 'sendStartEvent').returns(Promise.resolve(void(0)));

            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 1, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendStartEvent, TestFixtures.getPlacement().getId());
        });
    });

    describe('with onVideoProgress', () => {
        beforeEach(() => {
            sinon.spy(performanceAdUnit.getVideo(), 'setPosition');
        });

        it('with positive position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 5, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>performanceAdUnit.getVideo().setPosition, 5);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, 5);
        });

        it('with negative position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, -5, TestFixtures.getConfiguration());

            sinon.assert.notCalled(<sinon.SinonSpy>performanceAdUnit.getVideo().setPosition);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, -5);
        });

        it('should send first quartile event', () => {
            sinon.spy(sessionManager, 'sendFirstQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(4000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 6000, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendFirstQuartile, performanceAdUnit);
        });

        it('should send midpoint event', () => {
            sinon.spy(sessionManager, 'sendMidpoint');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(9000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 11000, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendMidpoint, performanceAdUnit);
        });

        it('should send third quartile event', () => {
            sinon.spy(sessionManager, 'sendThirdQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(14000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 16000, TestFixtures.getConfiguration());

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendThirdQuartile, performanceAdUnit);
        });
    });

    describe('with onVideoCompleted', () => {
        let prom: Promise<boolean>;

        beforeEach(() => {
            prom = Promise.resolve(false);

            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(sessionManager, 'sendView');
        });

        it('should set video to inactive', () => {
            VideoEventHandlers.onVideoCompleted(sessionManager, performanceAdUnit);

            assert.isFalse(performanceAdUnit.isActive());
        });

        it('should set finnish state to COMPLETED', () => {
            VideoEventHandlers.onVideoCompleted(sessionManager, performanceAdUnit);

            assert.equal(performanceAdUnit.getFinishState(), FinishState.COMPLETED);
        });

        it('should send view to session manager', () => {
            VideoEventHandlers.onVideoCompleted(sessionManager, performanceAdUnit);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendView, performanceAdUnit);
        });

        it('should hide overlay', () => {
            VideoEventHandlers.onVideoCompleted(sessionManager, performanceAdUnit);

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
            const vastAdUnit = new VastAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(), vastCampaign, overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null);
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
            const vastAdUnit = new VastAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(), vastCampaign, overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setCallButtonVisible, true);
        });

        it('should not set call button visibility to true if the ad unit is VAST but there is no click trough URL', () => {
            const vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            const vastAdUnit = new VastAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(), vastCampaign, overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null);
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
            const vastAdUnit = new VastAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(), vastCampaign, overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setFadeEnabled, false);
        });

        it('should not set fade enabled to false if the ad unit is VAST but there is no click trough URL', () => {
            const vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            const vastAdUnit = new VastAdUnit(nativeBridge, ForceOrientation.NONE, container, TestFixtures.getPlacement(), vastCampaign, overlay, TestFixtures.getDeviceInfo(Platform.ANDROID), null);
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
