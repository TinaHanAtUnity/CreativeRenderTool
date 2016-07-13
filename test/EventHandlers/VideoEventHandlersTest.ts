/// <reference path="../../typings/index.d.ts" />

import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { VideoEventHandlers } from '../../src/ts/EventHandlers/VideoEventHandlers';
import { Double } from '../../src/ts/Utilities/Double';
import { VideoAdUnit } from '../../src/ts/AdUnits/VideoAdUnit';
import { VastAdUnit } from '../../src/ts/AdUnits/VastAdUnit';
import { VastCampaign } from '../../src/ts/Models/Vast/VastCampaign';
import { Vast } from '../../src/ts/Models/Vast/Vast';
import { FinishState } from '../../src/ts/Constants/FinishState';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { SessionManager } from '../../src/ts/Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { Request } from '../../src/ts/Utilities/Request';
import { Campaign } from '../../src/ts/Models/Campaign';
import { Overlay } from '../../src/ts/Views/Overlay';
import { EndScreen } from '../../src/ts/Views/EndScreen';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';

describe('VideoEventHandlersTest', () => {

    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge, adUnit, overlay, endScreen;
    let sessionManager;

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

        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));

        adUnit = new VideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{getVast: sinon.spy()}, overlay, endScreen);
    });

    describe('with onVideoProgress', () => {
        beforeEach(() => {
            adUnit = new VideoAdUnit(nativeBridge, TestFixtures.getPlacement(), <Campaign><any>{getVast: sinon.spy()}, overlay, endScreen);
            sinon.spy(adUnit, 'setVideoPosition');
        });

        it('with positive position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 5);

            sinon.assert.calledWith(adUnit.setVideoPosition, 5);
            sinon.assert.calledWith(overlay.setVideoProgress, 5);
        });

        it('with negative position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, -5);

            sinon.assert.notCalled(adUnit.setVideoPosition);
            sinon.assert.calledWith(overlay.setVideoProgress, -5);
        });

        it('should send progress event with SessionManager', () => {
            sinon.spy(sessionManager, 'sendProgress');
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 5);

            sinon.assert.calledWith(sessionManager.sendProgress, adUnit, sessionManager.getSession(), 5, 0);
        });

        it('should send first quartile event', () => {
            sinon.spy(sessionManager, 'sendFirstQuartile');

            adUnit.setVideoDuration(20000);
            adUnit.setVideoPosition(4000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 6000);

            sinon.assert.calledWith(sessionManager.sendFirstQuartile, adUnit);
        });

        it('should send midpoint event', () => {
            sinon.spy(sessionManager, 'sendMidpoint');

            adUnit.setVideoDuration(20000);
            adUnit.setVideoPosition(9000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 11000);

            sinon.assert.calledWith(sessionManager.sendMidpoint, adUnit);
        });

        it('should send third quartile event', () => {
            sinon.spy(sessionManager, 'sendThirdQuartile');

            adUnit.setVideoDuration(20000);
            adUnit.setVideoPosition(14000);
            VideoEventHandlers.onVideoProgress(nativeBridge, sessionManager, adUnit, 16000);

            sinon.assert.calledWith(sessionManager.sendThirdQuartile, adUnit);
        });
    });

    describe('with onVideoStart', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(sessionManager, 'sendStart');
        });

        it('should send start event with SessionManager', () => {
            VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit);

            sinon.assert.calledWith(sessionManager.sendStart, adUnit);
        });

        it('should call newWatch', () => {
            VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit);

            assert.equal(adUnit.getWatches(), 1);
        });

        it('on first watch, should call sendStartEvent callback', () => {
            VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit);

            sinon.assert.calledWith(nativeBridge.invoke, 'Listener', 'sendStartEvent', ['fooId']);
        });

        it('on second watch, should not call sendStartEvent', () => {
            adUnit.newWatch();
            VideoEventHandlers.onVideoStart(nativeBridge, sessionManager, adUnit);

            sinon.assert.neverCalledWith(nativeBridge.invoke, 'Listener', 'sendStartEvent', ['fooId']);
            assert.equal(adUnit.getWatches(), 2);
        });
    });

    describe('with onVideoCompleted', () => {
        let prom;

        beforeEach(() => {
            prom = Promise.resolve(false);

            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(nativeBridge, 'rawInvoke');
            sinon.spy(sessionManager, 'sendView');
            sinon.stub(nativeBridge.Storage, 'get').returns(prom);
        });

        it('should set video to inactive', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit);

            assert.isFalse(adUnit.isVideoActive());
        });

        it('should set finnish state to COMPLETED', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit);

            assert.equal(adUnit.getFinishState(), FinishState.COMPLETED);
        });

        it('should send view to session manager', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit);

            sinon.assert.calledWith(sessionManager.sendView, adUnit);
        });

        it('should hide overlay', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit);

            sinon.assert.called(adUnit.getOverlay().hide);
        });

        it('should show endscreen', () => {
            VideoEventHandlers.onVideoCompleted(nativeBridge, sessionManager, adUnit);

            sinon.assert.called(adUnit.getEndScreen().show);
        });
    });

    describe('with onVideoPrepared', () => {
        let seekResolved, volumeResolved;

        beforeEach(() => {
            seekResolved = Promise.resolve();
            volumeResolved = Promise.resolve();

            sinon.stub(nativeBridge.VideoPlayer, 'seekTo').returns(seekResolved);
            sinon.stub(nativeBridge.VideoPlayer, 'setVolume').returns(volumeResolved);
            sinon.spy(nativeBridge.VideoPlayer, 'play');
        });

        it('should set video duration for overlay', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);

            sinon.assert.calledWith(overlay.setVideoDuration, 10);
        });

        it('should set video volume to 1.0 by default', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);

            sinon.assert.calledWith(nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });

        it('should set video volume to 0.0 when overlay says it is muted', () => {
            overlay.isMuted = sinon.mock().returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);

            sinon.assert.calledWith(nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should just play when video position is set to 0', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);

            return volumeResolved.then(() => {
                sinon.assert.called(nativeBridge.VideoPlayer.play);
                sinon.assert.notCalled(nativeBridge.VideoPlayer.seekTo);
            });
        });

        it('should seek and play when video position is set to greater than 0', () => {
            adUnit.setVideoPosition(123);

            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);
            return volumeResolved.then(() => seekResolved).then(() => {
                sinon.assert.calledWith(nativeBridge.VideoPlayer.seekTo, 123);
                sinon.assert.called(nativeBridge.VideoPlayer.play);
            });
        });

        it('should set debug message visibility to true if the debug overlay is enabled in the metadata', () => {
            let prom = Promise.resolve(true);
            sinon.stub(nativeBridge.Storage, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);

            prom.then(() => {
                sinon.assert.calledWith(overlay.setDebugMessageVisible, true);
            });
        });

        it('should set debug message to performance ad if the ad unit is not VAST', () => {
            let prom = Promise.resolve(true);
            sinon.stub(nativeBridge.Storage, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);

            prom.then(() => {
                sinon.assert.calledWith(overlay.setDebugMessage, 'Performance Ad');
            });
        });

        it('should set debug message to programmatic ad if the ad unit is VAST', () => {
            let prom = Promise.resolve(true);
            sinon.stub(nativeBridge.Storage, 'get').returns(prom);
            let vastCampaign = new VastCampaign(new Vast([], [], {}), 'campaignId', 'gamerId', 12);
            let vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getPlacement(), vastCampaign, overlay);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            prom.then(() => {
                sinon.assert.calledWith(overlay.setDebugMessage, 'Programmatic Ad');
            });
        });

        it('should not set debug message when the debug overlay is disabled in the metadata', () => {
            let prom = Promise.resolve(false);
            sinon.stub(nativeBridge.Storage, 'get').returns(prom);
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);

            prom.then(() => {
                sinon.assert.notCalled(overlay.setDebugMessage);
            });
        });

        it('should set call button visibility to true if the ad unit is VAST and has a click trough URL', () => {
            let vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getPlacement(), <VastCampaign><any>{}, overlay);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.calledWith(overlay.setCallButtonVisible, true);
        });

        it('should not set call button visibility to true if the ad unit is VAST but there is no click trough URL', () => {
            let vastAdUnit = new VastAdUnit(nativeBridge, TestFixtures.getPlacement(), <VastCampaign><any>{}, overlay);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10);

            sinon.assert.notCalled(overlay.setCallButtonVisible);
        });

        it('should not set call button visibility to true if the ad unit is not VAST', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, adUnit, 10);

            sinon.assert.notCalled(overlay.setCallButtonVisible);
        });
    });

});
