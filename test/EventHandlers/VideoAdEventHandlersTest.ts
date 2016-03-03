/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { VideoAdEventHandlers } from '../../src/ts/EventHandlers/VideoAdEventHandlers';
import { VideoAdUnit } from '../../src/ts/Models/VideoAdUnit';

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


});
