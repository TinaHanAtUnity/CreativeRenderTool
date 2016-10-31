import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { Double } from 'Utilities/Double';
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
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
import { Campaign } from 'Models/Campaign';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Session } from 'Models/Session';
import { MetaData } from 'Utilities/MetaData';
import { Diagnostics } from 'Utilities/Diagnostics';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

describe('VideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: EndScreen;
    let performanceAdUnit: PerformanceAdUnit, videoAdUnitController: VideoAdUnitController;
    let sessionManager: SessionManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

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
            setCallButtonVisible: sinon.spy()
        };

        endScreen = <EndScreen><any> {
            show: sinon.spy(),
        };

        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));

        videoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{}, overlay, null);
        performanceAdUnit = new PerformanceAdUnit(nativeBridge, videoAdUnitController, endScreen);
    });

    describe('with onVideoPlay', () => {
        it('should set progress interval', () => {
            sinon.stub(nativeBridge.VideoPlayer, 'setProgressEventInterval').returns(Promise.resolve(void(0)));
            VideoEventHandlers.onVideoPlay(nativeBridge, performanceAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setProgressEventInterval, videoAdUnitController.getProgressInterval());
        });
    });

    describe('with video start', () => {
        beforeEach(() => {
            videoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{}, overlay, null);
            performanceAdUnit = new PerformanceAdUnit(nativeBridge, videoAdUnitController, endScreen);
            sessionManager.setSession(new Session('123'));
        });

        it('should set video started', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 1);

            assert.isTrue(videoAdUnitController.isVideoStarted());
        });

        it('should send start event to backend', () => {
            sinon.spy(sessionManager, 'sendStart');

            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 1);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendStart, performanceAdUnit);
        });

        it('should invoke onUnityAdsStart callback ', () => {
            sinon.stub(nativeBridge.Listener, 'sendStartEvent').returns(Promise.resolve(void(0)));

            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 1);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendStartEvent, TestFixtures.getPlacement().getId());
        });
    });

    describe('with onVideoProgress', () => {
        beforeEach(() => {
            sinon.spy(videoAdUnitController, 'setVideoPosition');
        });

        it('with positive position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 5);

            sinon.assert.calledWith(<sinon.SinonSpy>videoAdUnitController.setVideoPosition, 5);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, 5);
        });

        it('with negative position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, -5);

            sinon.assert.notCalled(<sinon.SinonSpy>videoAdUnitController.setVideoPosition);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, -5);
        });

        it('should send first quartile event', () => {
            sinon.spy(sessionManager, 'sendFirstQuartile');

            videoAdUnitController.setVideoDuration(20000);
            videoAdUnitController.setVideoPosition(4000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 6000);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendFirstQuartile, performanceAdUnit);
        });

        it('should send midpoint event', () => {
            sinon.spy(sessionManager, 'sendMidpoint');

            videoAdUnitController.setVideoDuration(20000);
            videoAdUnitController.setVideoPosition(9000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 11000);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendMidpoint, performanceAdUnit);
        });

        it('should send third quartile event', () => {
            sinon.spy(sessionManager, 'sendThirdQuartile');

            videoAdUnitController.setVideoDuration(20000);
            videoAdUnitController.setVideoPosition(14000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, performanceAdUnit, 16000);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendThirdQuartile, performanceAdUnit);
        });
    });

    describe('with onVideoCompleted', () => {
        let prom: Promise<boolean>;
        let metaData: MetaData;

        beforeEach(() => {
            metaData = new MetaData(nativeBridge);
            prom = Promise.resolve(false);

            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(nativeBridge, 'rawInvoke');
            sinon.spy(sessionManager, 'sendView');
            sinon.stub(metaData, 'get').returns(prom);
        });

        it('should set video to inactive', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, performanceAdUnit, metaData);

            assert.isFalse(videoAdUnitController.isVideoActive());
        });

        it('should set finnish state to COMPLETED', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, performanceAdUnit, metaData);

            assert.equal(videoAdUnitController.getFinishState(), FinishState.COMPLETED);
        });

        it('should send view to session manager', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, performanceAdUnit, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendView, performanceAdUnit);
        });

        it('should hide overlay', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, performanceAdUnit, metaData);

            overlay = videoAdUnitController.getOverlay();
            if(overlay) {
                sinon.assert.called(<sinon.SinonSpy>overlay.hide);
            }
        });
    });

    describe('with onVideoPrepared', () => {
        let seekResolved: Promise<void>, volumeResolved: Promise<void>;
        let metaData: MetaData;

        beforeEach(() => {
            metaData = new MetaData(nativeBridge);

            seekResolved = Promise.resolve(void(0));
            volumeResolved = Promise.resolve(void(0));

            sinon.stub(nativeBridge.VideoPlayer, 'seekTo').returns(seekResolved);
            sinon.stub(nativeBridge.VideoPlayer, 'setVolume').returns(volumeResolved);
            sinon.spy(nativeBridge.VideoPlayer, 'play');
        });

        it('should set video duration for overlay', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoDuration, 10);
        });

        it('should set video volume to 1.0 by default', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });

        it('should set video volume to 0.0 when overlay says it is muted', () => {
            overlay.isMuted = sinon.mock().returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should just play when video position is set to 0', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);

            return volumeResolved.then(() => {
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
                sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo);
            });
        });

        it('should seek and play when video position is set to greater than 0', () => {
            videoAdUnitController.setVideoPosition(123);

            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);
            return volumeResolved.then(() => seekResolved).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo, 123);
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
            });
        });

        it('should set debug message visibility to true if the debug overlay is enabled in the metadata', () => {
            const prom = Promise.resolve([true, true]);
            sinon.stub(metaData, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);

            return prom.then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessageVisible, true);
            });
        });

        it('should set debug message to performance ad if the ad unit is not VAST', () => {
            const prom = Promise.resolve([true, true]);
            sinon.stub(metaData, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);

            return prom.then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Performance Ad');
            });
        });

        it('should set debug message to programmatic ad if the ad unit is VAST', () => {
            const prom = Promise.resolve([true, true]);
            sinon.stub(metaData, 'get').returns(prom);
            const vastCampaign = new VastCampaign(new Vast([], []), 'campaignId', 'gamerId', 12);
            const androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), vastCampaign, overlay, null);
            const vastAdUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, metaData);

            return prom.then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Programmatic Ad');
            });
        });

        it('should not set debug message when the debug overlay is disabled in the metadata', () => {
            const prom = Promise.resolve(false);

            sinon.stub(metaData, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);

            return prom.then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>overlay.setDebugMessage);
            });
        });

        it('should set call button visibility to true if the ad unit is VAST and has a click trough URL', () => {
            const vastCampaign = <VastCampaign><any>{};
            const androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), vastCampaign, overlay, null);

            const vastAdUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);

            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setCallButtonVisible, true);
        });

        it('should not set call button visibility to true if the ad unit is VAST but there is no click trough URL', () => {
            const vastCampaign = <VastCampaign><any>{};
            const androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getPlacement(), vastCampaign, overlay, null);

            const vastAdUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);

            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, metaData);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setCallButtonVisible);
        });

        it('should not set call button visibility to true if the ad unit is not VAST', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, metaData);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setCallButtonVisible);
        });
    });

    describe('with onPrepareError', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(Diagnostics, 'trigger');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set video to inactive and video to finish state to error', () => {
            VideoEventHandlers.onPrepareError(nativeBridge, videoAdUnitController, 'http://test.video.url');

            assert.isFalse(videoAdUnitController.isVideoActive());
            assert.equal(videoAdUnitController.getFinishState(), FinishState.ERROR);

            overlay = videoAdUnitController.getOverlay();
            if(overlay) {
                sinon.assert.called(<sinon.SinonSpy>overlay.hide);
            }
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.AndroidAdUnit.setViews, ['webview']);
        });
    });

    describe('with onAndroidGenericVideoError', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(Diagnostics, 'trigger');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set video to inactive and video to finish state to error', () => {
            VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, videoAdUnitController, 1, 0, 'http://test.video.url');

            assert.isFalse(videoAdUnitController.isVideoActive());
            assert.equal(videoAdUnitController.getFinishState(), FinishState.ERROR);

            overlay = videoAdUnitController.getOverlay();
            if(overlay) {
                sinon.assert.called(<sinon.SinonSpy>overlay.hide);
            }

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.AndroidAdUnit.setViews, ['webview']);
        });
    });
});
