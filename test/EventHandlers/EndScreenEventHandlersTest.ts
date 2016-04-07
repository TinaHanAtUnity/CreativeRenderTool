/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import * as sinon from 'sinon';
import { EndScreenEventHandlers } from '../../src/ts/EventHandlers/EndScreenEventHandlers';
import { Double } from '../../src/ts/Utilities/Double';
import { TestBridge, TestBridgeApi } from '../TestBridge';

describe('EndScreenEventHandlersTest', () => {

    describe('with onDownload', () => {
        let adUnitMock, nativeInvoke, sessionManagerSendClick;
        let listenerSpy, intentSpy;

        class Listener extends TestBridgeApi {
            public sendClickEvent() {
                return ['OK'];
            }
        }

        class Intent extends TestBridgeApi {
            public launch() {
                return ['OK'];
            }
        }

        beforeEach(() => {
            nativeInvoke = sinon.spy();
            sessionManagerSendClick = sinon.spy();

            let testBridge = new TestBridge();
            let listener = new Listener();
            let intent = new Intent();
            testBridge.setApi('Listener', listener);
            testBridge.setApi('Intent', intent);

            listenerSpy = sinon.spy(listener, 'sendClickEvent');
            intentSpy = sinon.spy(intent, 'launch');

            adUnitMock = {
                getSession: () => ({ sendClick: sessionManagerSendClick }),
                getPlacement: () => ({ getId: () => 123 }),
                getCampaign: () => ({ getAppStoreId: () => 'foomarketid'})
            };

            EndScreenEventHandlers.onDownload(adUnitMock);
        });

        it('should send a click with session manager', () => {
            sinon.assert.called(sessionManagerSendClick);
        });

        it('should send a click with event with native bridge', () => {
            sinon.assert.calledWith(listenerSpy, 123);
        });

        it('should send a launch intent for market link', () => {
            sinon.assert.calledWith(intentSpy, {'action': 'android.intent.action.VIEW', 'uri': 'market://details?id=foomarketid'});
        });

    });

    describe('with onReplay', () => {
        let adUnitMock, mockAdUnitApi, setSkipEnabled, setSkipDuration, videoPrepare, overlayShow, getVideoPosition;
        let endScreenHide, invokePromise, testBridge;

        beforeEach(() => {
            testBridge = new TestBridge();

            let adUnitApi = new class MockAdUnit extends TestBridgeApi {
                public setViews() {
                    return ['OK'];
                }
            };

            testBridge.setApi('AdUnit', adUnitApi);

            invokePromise = Promise.resolve(true);
            setSkipEnabled = sinon.spy();
            overlayShow = sinon.spy();
            setSkipDuration = sinon.spy();
            endScreenHide = sinon.spy();
            mockAdUnitApi = sinon.mock(adUnitApi);
            videoPrepare = sinon.spy();

            adUnitMock = {
                setVideoActive: sinon.spy(),
                getOverlay: () => ({ setSkipEnabled: setSkipEnabled, show: overlayShow, setSkipDuration: setSkipDuration }),
                getVideoPlayer: () => ({ prepare: videoPrepare }),
                getEndScreen: () => ({ hide: endScreenHide }),
                getVideoPosition: getVideoPosition,
                setVideoPosition: sinon.spy(),
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
            mockAdUnitApi.expects('setViews').withArgs(['videoplayer', 'webview']);
            EndScreenEventHandlers.onReplay(adUnitMock);
            mockAdUnitApi.verify();
        });

        it('should prepare video', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            return invokePromise.then(() => {
                sinon.assert.calledWith(videoPrepare, 'fake url', new Double(1.0));
            });
        });
    });

});
