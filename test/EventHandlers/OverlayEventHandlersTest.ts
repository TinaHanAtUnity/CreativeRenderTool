/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import * as sinon from 'sinon';
import { OverlayEventHandlers } from '../../src/ts/EventHandlers/OverlayEventHandlers';
import { Double } from '../../src/ts/Utilities/Double';
import { VideoAdUnit} from '../../src/ts/AdUnits/VideoAdUnit';
import { FinishState} from '../../src/ts/Constants/FinishState';

describe('OverlayEventHandlersTest', () => {

    describe('with onSkip', () => {
        let adUnitMock, nativeInvoke, videoPlayerPause, overlayHide, endScreenShow, sessionManagerSendSkip;

        beforeEach(() => {
            videoPlayerPause = sinon.spy();
            nativeInvoke = sinon.spy();
            sessionManagerSendSkip = sinon.spy();
            overlayHide = sinon.spy();
            endScreenShow = sinon.spy();

            adUnitMock = {
                setVideoActive: sinon.spy(),
                setFinishState: sinon.spy(),
                getVideoPlayer: () => ({ pause: videoPlayerPause }),
                getNativeBridge: () => ({ invoke: nativeInvoke }),
                getSessionManager: () => ({ sendSkip: sessionManagerSendSkip }),
                getOverlay: () => ({ hide: overlayHide }),
                getEndScreen: () => ({ show: endScreenShow })
            };

            OverlayEventHandlers.onSkip(<VideoAdUnit> <any> adUnitMock);
        });

        it('should call pause on video player', () => {
            sinon.assert.called(videoPlayerPause);
        });

        it('should set video inactive', () => {
            sinon.assert.called(adUnitMock.setVideoActive);
        });

        it('should set finish state to skipped', () => {
            sinon.assert.calledWith(adUnitMock.setFinishState, FinishState.SKIPPED);
        });

        it('should send a click with session manager', () => {
            sinon.assert.calledWith(sessionManagerSendSkip, adUnitMock);
        });

        it('should send a setViews with native bridge', () => {
            sinon.assert.calledWith(nativeInvoke, 'AdUnit', 'setViews', [['webview']]);
        });

    });

    describe('with onMute', () => {
        let adUnitMock, setVolume;

        beforeEach(() => {
            setVolume = sinon.spy();

            adUnitMock = {
                getVideoPlayer: () => ({ setVolume: setVolume })
            };
        });

        it('should set volume to 0 when muted', () => {
            OverlayEventHandlers.onMute(adUnitMock, true);

            sinon.assert.calledWith(setVolume, new Double(0.0));
        });

        it('should set volume to 1 when unmuted', () => {
            OverlayEventHandlers.onMute(adUnitMock, false);

            sinon.assert.calledWith(setVolume, new Double(1.0));
        });

    });

});
