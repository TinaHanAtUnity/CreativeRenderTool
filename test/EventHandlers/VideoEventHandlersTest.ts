import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { Double } from 'Utilities/Double';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
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

describe('VideoEventHandlersTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, adUnit: VideoAdUnit, overlay: Overlay, endScreen: EndScreen;
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

        adUnit = new VideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{getVast: sinon.spy()}, overlay, endScreen);
    });

    describe('with onVideoProgress', () => {
        beforeEach(() => {
            adUnit = new VideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{getVast: sinon.spy()}, overlay, endScreen);
            sinon.spy(adUnit, 'setVideoPosition');
        });

        it('with positive position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 5);

            sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setVideoPosition, 5);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, 5);
        });

        it('with negative position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, -5);

            sinon.assert.notCalled(<sinon.SinonSpy>adUnit.setVideoPosition);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, -5);
        });

        it('should send progress event with SessionManager', () => {
            sinon.spy(sessionManager, 'sendProgress');
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 5);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendProgress, adUnit, sessionManager.getSession(), 5, 0);
        });

        it('should send first quartile event', () => {
            sinon.spy(sessionManager, 'sendFirstQuartile');

            adUnit.setVideoDuration(20000);
            adUnit.setVideoPosition(4000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 6000);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendFirstQuartile, adUnit);
        });

        it('should send midpoint event', () => {
            sinon.spy(sessionManager, 'sendMidpoint');

            adUnit.setVideoDuration(20000);
            adUnit.setVideoPosition(9000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 11000);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendMidpoint, adUnit);
        });

        it('should send third quartile event', () => {
            sinon.spy(sessionManager, 'sendThirdQuartile');

            adUnit.setVideoDuration(20000);
            adUnit.setVideoPosition(14000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 16000);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendThirdQuartile, adUnit);
        });
    });

    describe('with onVideoStart', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(sessionManager, 'sendStart');
            sessionManager.setSession(new Session('123'));
        });

        it('should send start event with SessionManager', () => {
            VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendStart, adUnit);
        });

        it('should call newWatch', () => {
            VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit);

            assert.equal(adUnit.getWatches(), 1);
        });

        it('on first watch, should call sendStartEvent callback', () => {
            VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.invoke, 'Listener', 'sendStartEvent', ['fooId']);
        });

        it('on second watch, should not call sendStartEvent', () => {
            adUnit.newWatch();
            VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit);

            sinon.assert.neverCalledWith(<sinon.SinonSpy>nativeBridge.invoke, 'Listener', 'sendStartEvent', ['fooId']);
            assert.equal(adUnit.getWatches(), 2);
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
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit, metaData);

            assert.isFalse(adUnit.isVideoActive());
        });

        it('should set finnish state to COMPLETED', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit, metaData);

            assert.equal(adUnit.getFinishState(), FinishState.COMPLETED);
        });

        it('should send view to session manager', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendView, adUnit);
        });

        it('should hide overlay', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit, metaData);

            sinon.assert.called(<sinon.SinonSpy>adUnit.getOverlay().hide);
        });

        it('should show endscreen', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit, metaData);

            let endScreen = adUnit.getEndScreen();
            if(endScreen) {
                sinon.assert.called(<sinon.SinonSpy>endScreen.show);
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
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoDuration, 10);
        });

        it('should set video volume to 1.0 by default', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });

        it('should set video volume to 0.0 when overlay says it is muted', () => {
            overlay.isMuted = sinon.mock().returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should just play when video position is set to 0', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);

            return volumeResolved.then(() => {
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
                sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo);
            });
        });

        it('should seek and play when video position is set to greater than 0', () => {
            adUnit.setVideoPosition(123);

            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);
            return volumeResolved.then(() => seekResolved).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo, 123);
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
            });
        });

        it('should set debug message visibility to true if the debug overlay is enabled in the metadata', () => {
            let prom = Promise.resolve([true, true]);
            sinon.stub(metaData, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);

            return prom.then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessageVisible, true);
            });
        });

        it('should set debug message to performance ad if the ad unit is not VAST', () => {
            let prom = Promise.resolve([true, true]);
            sinon.stub(metaData, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);

            return prom.then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Performance Ad');
            });
        });

        it('should set debug message to programmatic ad if the ad unit is VAST', () => {
            let prom = Promise.resolve([true, true]);
            sinon.stub(metaData, 'get').returns(prom);
            let vastCampaign = new VastCampaign(new Vast([], [], {}), 'campaignId', 'gamerId', 12);
            let vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getPlacement(), vastCampaign, overlay);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, metaData);

            return prom.then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Programmatic Ad');
            });
        });

        it('should not set debug message when the debug overlay is disabled in the metadata', () => {
            let prom = Promise.resolve(false);

            sinon.stub(metaData, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);

            return prom.then(() => {
                sinon.assert.notCalled(<sinon.SinonSpy>overlay.setDebugMessage);
            });
        });

        it('should set call button visibility to true if the ad unit is VAST and has a click trough URL', () => {
            let vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getPlacement(), <VastCampaign><any>{}, overlay);

            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, metaData);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setCallButtonVisible, true);
        });

        it('should not set call button visibility to true if the ad unit is VAST but there is no click trough URL', () => {
            let vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getPlacement(), <VastCampaign><any>{}, overlay);

            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, metaData);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setCallButtonVisible);
        });

        it('should not set call button visibility to true if the ad unit is not VAST', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10, metaData);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setCallButtonVisible);
        });
    });

});
