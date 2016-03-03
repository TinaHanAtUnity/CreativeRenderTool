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
});
