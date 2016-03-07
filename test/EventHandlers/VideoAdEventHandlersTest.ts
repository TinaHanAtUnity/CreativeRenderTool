/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { VideoAdEventHandlers } from '../../src/ts/EventHandlers/VideoAdEventHandlers';
import { VideoAdUnit } from '../../src/ts/Models/VideoAdUnit';
import {FinishState} from '../../src/ts/Models/AdUnit';
import {Double} from '../../src/ts/Utilities/Double';

describe('VideoAdEventHandlersTest', () => {

    describe('with onVideoProgress', () => {
        let overlay;
        let adUnitMock;

        beforeEach(() => {
            overlay = {
                setVideoProgress: sinon.spy()
            };

            adUnitMock = {
                setVideoPosition: sinon.spy(),
                getOverlay: sinon.stub().returns(overlay)
            };
        });

        it('with positive position, should set video position and video progress', () => {
            VideoAdEventHandlers.onVideoProgress(<VideoAdUnit> <any> adUnitMock, 5);
            assert.isOk(adUnitMock.setVideoPosition.calledWith(5));
            assert.isOk(overlay.setVideoProgress.calledWith(5));
        });

        it('with negative position, should set video position and video progress', () => {
            VideoAdEventHandlers.onVideoProgress(<VideoAdUnit> <any> adUnitMock, -5);
            assert.isOk(adUnitMock.setVideoPosition.notCalled);
            assert.isOk(overlay.setVideoProgress.calledWith(-5));
        });
    });

    describe('with onVideoStart', () => {
        let adUnitMock;
        let sendStart;
        let invoke;

        beforeEach(() => {
            invoke = sinon.spy();
            sendStart = sinon.spy();
            adUnitMock = {
                getWatches: sinon.mock(),
                getSessionManager: () => ({ sendStart: sendStart }),
                newWatch: sinon.spy(),
                getNativeBridge: () => ({ invoke: invoke }),
                getPlacement: () => ({ getId: () => 1 })
            };
        });

        it('should send start event with SessionManager', () => {
            VideoAdEventHandlers.onVideoStart(<VideoAdUnit> <any> adUnitMock);

            assert.isOk(sendStart.calledWith(adUnitMock));
        });

        it('should call newWatch', () => {
            VideoAdEventHandlers.onVideoStart(<VideoAdUnit> <any> adUnitMock);

            assert.isOk(adUnitMock.newWatch.called);
        });

        it('on first watch, should call sendStartEvent callback', () => {
            adUnitMock.getWatches.returns(0);
            VideoAdEventHandlers.onVideoStart(<VideoAdUnit> <any> adUnitMock);

            assert.isOk(invoke.calledWith('Listener', 'sendStartEvent', [1]));
        });

        it('on second watch, should not call sendStartEvent', () => {
            adUnitMock.getWatches.returns(1);
            VideoAdEventHandlers.onVideoStart(<VideoAdUnit> <any> adUnitMock);

            assert.isOk(invoke.notCalled);
        });

    });

    describe('with onVideoCompleted', () => {
        let sendView;
        let invoke;
        let rawInvoke;
        let adUnitMock;
        let overlayHide;
        let endscreenShow;
        let storageManagerGet;
        let prom;

        beforeEach(() => {
            prom = Promise.resolve(false);

            sendView = sinon.spy();
            invoke = sinon.spy();
            rawInvoke = sinon.spy();
            overlayHide = sinon.spy();
            endscreenShow = sinon.spy();
            storageManagerGet = sinon.mock().returns(prom);

            adUnitMock = {
                setVideoActive: sinon.spy(),
                setFinishState: sinon.spy(),
                getSessionManager: () => ({ sendView: sendView }),
                getNativeBridge: () => ({ invoke: invoke, rawInvoke: rawInvoke }),
                getOverlay: () => ({ hide: overlayHide }),
                getEndScreen: () => ({ show: endscreenShow }),
                getStorageManager: () => ({ get: storageManagerGet }),
                getPlacement: () => ({ getId: () => 1 })
            };
        });

        it('should set video to inactive', () => {
            VideoAdEventHandlers.onVideoCompleted(<VideoAdUnit> <any> adUnitMock, 'foo_url');

            assert.isOk(adUnitMock.setVideoActive.calledWith(false));
        });

        it('should set finnish state to COMPLETED', () => {
            VideoAdEventHandlers.onVideoCompleted(<VideoAdUnit> <any> adUnitMock, 'foo_url');

            assert.isOk(adUnitMock.setFinishState.calledWith(FinishState.COMPLETED));
        });

        it('should send view to session manager', () => {
            VideoAdEventHandlers.onVideoCompleted(<VideoAdUnit> <any> adUnitMock, 'foo_url');

            assert.isOk(sendView.calledWith(adUnitMock));
        });

        it('should hide overlay', () => {
            VideoAdEventHandlers.onVideoCompleted(<VideoAdUnit> <any> adUnitMock, 'foo_url');

            assert.isOk(overlayHide.called);
        });

        it('should show endscreen', () => {
            VideoAdEventHandlers.onVideoCompleted(<VideoAdUnit> <any> adUnitMock, 'foo_url');

            assert.isOk(endscreenShow.called);
        });

        it('should not call rawinvoke, if integration testing is disabled', (done) => {
            VideoAdEventHandlers.onVideoCompleted(<VideoAdUnit> <any> adUnitMock, 'foo_url');

            prom.then(() => {
                assert.isOk(rawInvoke.notCalled);
                done();
            });
        });

        it('should call rawinvoke, if integration testing is enabled', (done) => {
            prom = Promise.resolve(true);
            storageManagerGet = sinon.mock().returns(prom);

            VideoAdEventHandlers.onVideoCompleted(<VideoAdUnit> <any> adUnitMock, 'foo_url');

            prom.then(() => {
                assert.isOk(rawInvoke.calledWith('com.unity3d.ads.test.integration', 'IntegrationTest', 'onVideoCompleted', [1]));
                done();
            });
        });

    });

    describe('with onVideoPrepared', () => {
        let adUnitMock, setVideoDuration, isMuted, play, seekTo, setVolume, getVideoPosition;
        let seekResolved, volumeResolved;

        beforeEach(() => {
            seekResolved = Promise.resolve();
            volumeResolved = Promise.resolve();

            setVideoDuration = sinon.spy();
            isMuted = sinon.mock().returns(false);
            play = sinon.spy();
            seekTo = sinon.mock().returns(seekResolved);
            setVolume = sinon.mock().returns(volumeResolved);
            getVideoPosition = sinon.mock().twice().returns(0);

            adUnitMock = {
                getOverlay: () => ({ setVideoDuration: setVideoDuration, isMuted: isMuted }),
                getVideoPlayer: () => ({ play: play, seekTo: seekTo, setVolume: setVolume }),
                getVideoPosition: getVideoPosition
            };

        });

        it('should set video duration for overlay', () => {
            VideoAdEventHandlers.onVideoPrepared(<VideoAdUnit> <any> adUnitMock, 10, 200, 300);

            assert.isOk(setVideoDuration.calledWith(10));
        });

        it('should set video volume to 1.0 by default', () => {
            VideoAdEventHandlers.onVideoPrepared(<VideoAdUnit> <any> adUnitMock, 10, 200, 300);

            assert.isOk(setVolume.calledWith(new Double(1.0)));
        });

        it('should set video volume to 0.0 when overlay says it is muted', () => {
            isMuted = sinon.mock().returns(true);
            VideoAdEventHandlers.onVideoPrepared(<VideoAdUnit> <any> adUnitMock, 10, 200, 300);

            assert.isOk(setVolume.calledWith(new Double(0.0)));
        });

        it('should just play when video position is set to 0', (done) => {
            VideoAdEventHandlers.onVideoPrepared(<VideoAdUnit> <any> adUnitMock, 10, 200, 300);

            volumeResolved.then(() => {
                assert.isOk(play.called);
                assert.isOk(seekTo.notCalled);
                done();
            });
        });

        it('should seek and play when video position is set to greater than 0', (done) => {
            adUnitMock.getVideoPosition = sinon.mock().twice().returns(123);

            VideoAdEventHandlers.onVideoPrepared(<VideoAdUnit> <any> adUnitMock, 10, 200, 300);
            Promise.all([volumeResolved, seekResolved]).then(() => {
                assert.isOk(seekTo.calledWith(123));
                assert.isOk(play.called);
                done();
            });
        });

    });

});
