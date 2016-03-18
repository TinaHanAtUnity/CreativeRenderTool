/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { EndScreenEventHandlers } from '../../src/ts/EventHandlers/EndScreenEventHandlers';
import { Double } from '../../src/ts/Utilities/Double';
import {NativeBridge} from "../../src/ts/Native/NativeBridge";
import {TestBridge, TestBridgeApi} from "../TestBridge";

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
                getSessionManager: () => ({ sendClick: sessionManagerSendClick }),
                getPlacement: () => ({ getId: () => 123 }),
                getCampaign: () => ({ getAppStoreId: () => 'foomarketid'})
            };

            EndScreenEventHandlers.onDownload(adUnitMock);
        });

        it('should send a click with session manager', () => {
            assert.isOk(sessionManagerSendClick.called);
        });

        it('should send a click with event with native bridge', () => {
            assert.isOk(listenerSpy.calledWith(123));
        });

        it('should send a launch intent for market link', () => {
            assert.isOk(intentSpy.calledWith({'action': 'android.intent.action.VIEW', 'uri': 'market://details?id=foomarketid'}));
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

            assert.isOk(adUnitMock.setVideoActive.calledWith(true));
        });

        it('should set video position to start', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            assert.isOk(adUnitMock.setVideoPosition.calledWith(0));
        });

        it('should setup skipping', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            assert.isOk(setSkipEnabled.calledWith(true));
            assert.isOk(setSkipDuration.calledWith(0));
        });

        it('should hide endscreen', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            assert.isOk(endScreenHide.called);
        });

        it('should show overlay', () => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            assert.isOk(overlayShow.called);
        });

        it('should call native for views', () => {
            EndScreenEventHandlers.onReplay((adUnitMock));

            assert.isOk(nativeInvoke.calledWith('AdUnit', 'setViews', [['videoplayer', 'webview']]));
        });

        it('should prepare video', (done) => {
            EndScreenEventHandlers.onReplay(adUnitMock);

            invokePromise.then(() => {
                assert.isOk(videoPrepare.calledWith('fake url', new Double(1.0)));

                done();
            });
        });
    });

});
