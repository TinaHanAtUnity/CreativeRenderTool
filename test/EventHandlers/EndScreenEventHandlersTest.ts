/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import * as sinon from 'sinon';
import { EndScreenEventHandlers } from '../../src/ts/EventHandlers/EndScreenEventHandlers';
import { Double } from '../../src/ts/Utilities/Double';

describe('EndScreenEventHandlersTest', () => {

    describe('with onDownload', () => {
        let adUnitMock, nativeInvoke, sessionManagerSendClick;

        beforeEach(() => {
            nativeInvoke = sinon.spy();
            sessionManagerSendClick = sinon.spy();

            adUnitMock = {
                getNativeBridge: () => ({ invoke: nativeInvoke }),
                getSessionManager: () => ({ sendClick: sessionManagerSendClick }),
                getPlacement: () => ({ getId: () => 123 }),
                getCampaign: () => ({ getAppStoreId: () => 'foomarketid'})
            };

            EndScreenEventHandlers.onDownload(adUnitMock);
        });

        it('should send a click with session manager', () => {
            sinon.assert.called(sessionManagerSendClick);
        });

        it('should send a click with event with native bridge', () => {
            sinon.assert.calledWith(nativeInvoke, 'Listener', 'sendClickEvent', [123]);
        });

        it('should send a launch intent for market link', () => {
            sinon.assert.calledWith(nativeInvoke, 'Intent', 'launch', [{'action': 'android.intent.action.VIEW', 'uri': 'market://details?id=foomarketid'}]);
        });

    });

    describe('with onReplay', () => {
        let adUnitMock, setSkipEnabled, setSkipDuration, videoPrepare, overlayShow, getVideoPosition;
        let endScreenHide, nativeInvoke, invokePromise;

        beforeEach(() => {
            invokePromise = Promise.resolve(true);
            setSkipEnabled = sinon.spy();
            overlayShow = sinon.spy();
            setSkipDuration = sinon.spy();
            endScreenHide = sinon.spy();
            nativeInvoke = sinon.mock().returns(invokePromise);
            videoPrepare = sinon.spy();

            adUnitMock = {
                setVideoActive: sinon.spy(),
                getOverlay: () => ({ setSkipEnabled: setSkipEnabled, show: overlayShow, setSkipDuration: setSkipDuration }),
                getVideoPlayer: () => ({ prepare: videoPrepare }),
                getEndScreen: () => ({ hide: endScreenHide }),
                getVideoPosition: getVideoPosition,
                setVideoPosition: sinon.spy(),
                getNativeBridge: () => ({ invoke: nativeInvoke }),
                getCampaign: () => ({ getVideoUrl: () => 'fake url' }),
                getPlacement: () => ({ muteVideo: () => false }),
            };
        });

        it('should activate video', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            sinon.assert.calledWith(adUnitMock.setVideoActive, true);
        });

        it('should set video position to start', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            sinon.assert.calledWith(adUnitMock.setVideoPosition, 0);
        });

        it('should setup skipping', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            sinon.assert.calledWith(setSkipEnabled, true);
            sinon.assert.calledWith(setSkipDuration, 0);
        });

        it('should hide endscreen', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            sinon.assert.called(endScreenHide);
        });

        it('should show overlay', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            sinon.assert.called(overlayShow);
        });

        it('should call native for views', () => {
            EndScreenEventHandlers.onReplay((adUnitMock));

            sinon.assert.calledWith(nativeInvoke, 'AdUnit', 'setViews', [['videoplayer', 'webview']]);
        });

        it('should prepare video', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            return invokePromise.then(() => {
                sinon.assert.calledWith(videoPrepare, 'fake url', new Double(1.0));
            });
        });
    });

});
