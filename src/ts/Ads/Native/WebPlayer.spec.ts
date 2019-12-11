import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { WebPlayerApi, WebplayerEvent } from 'Ads/Native/WebPlayer';
import { Observable } from 'Core/Utilities/Observable';

[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('WebPlayerApi', () => {
    let nativeBridge: NativeBridge;
    let webPlayerApi: WebPlayerApi;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation: () => {
                // no op
            },
            handleCallback: () => {
                // no op
            }
        }, platform);
        webPlayerApi = new WebPlayerApi(nativeBridge);
    });

    describe('Observer Tests', () => {
        const tests: {
            label: string;
            event: WebplayerEvent;
            listener(): Observable<unknown>;
            handleEvent: unknown[];
            calledWith: unknown[];
        }[] = [
            {
                label: 'onPageStarted',
                event: WebplayerEvent.PAGE_STARTED,
                listener: () => {
                    return webPlayerApi.onPageStarted;
                },
                handleEvent: ['WEBPLAYER', 'PAGE_STARTED', 'testUrl', 'testViewId'],
                calledWith: ['testViewId', 'testUrl']
            }, {
                label: 'onPageFinished',
                event: WebplayerEvent.PAGE_FINISHED,
                listener: () => {
                    return webPlayerApi.onPageFinished;
                },
                handleEvent: ['WEBPLAYER', 'PAGE_FINISHED', 'testUrl', 'testViewId'],
                calledWith: ['testViewId', 'testUrl']
            }, {
                label: 'onPageFinished',
                event: WebplayerEvent.ERROR,
                listener: () => {
                    return webPlayerApi.onPageFinished;
                },
                handleEvent: ['WEBPLAYER', 'ERROR', 'testUrl', 'testViewId'],
                calledWith: ['testViewId', 'testUrl']
            }, {
                label: 'onWebPlayerEvent',
                event: WebplayerEvent.WEBPLAYER_EVENT,
                listener: () => {
                    return webPlayerApi.onWebPlayerEvent;
                },
                handleEvent: ['WEBPLAYER', 'WEBPLAYER_EVENT', 'testUrl', 'testViewId'],
                calledWith: ['testViewId', 'testUrl']
            }, {
                label: 'shouldOverrideUrlLoading',
                event: WebplayerEvent.SHOULD_OVERRIDE_URL_LOADING,
                listener: () => {
                    return webPlayerApi.shouldOverrideUrlLoading;
                },
                handleEvent: ['WEBPLAYER', 'SHOULD_OVERRIDE_URL_LOADING', 'testUrl', 'testMethod', 'testViewId'],
                calledWith: ['testViewId', 'testUrl', 'testMethod']
            }, {
                label: 'onCreateWebView',
                event: WebplayerEvent.CREATE_WEBVIEW,
                listener: () => {
                    return webPlayerApi.onCreateWebView;
                },
                handleEvent: ['WEBPLAYER', 'CREATE_WEBVIEW', 'testUrl', 'testViewId'],
                calledWith: ['testViewId', 'testUrl']
            }, {
                label: 'onFrameUpdate',
                event: WebplayerEvent.FRAME_UPDATE,
                listener: () => {
                    return webPlayerApi.onFrameUpdate;
                },
                handleEvent: ['WEBPLAYER', 'FRAME_UPDATE', 'testViewId', 0, 10, 50, 50, 0.5],
                calledWith: ['testViewId', 0, 10, 50, 50, 0.5]
            }, {
                label: 'onGetFrameResponse',
                event: WebplayerEvent.GET_FRAME_RESPONSE,
                listener: () => {
                    return webPlayerApi.onGetFrameResponse;
                },
                handleEvent: ['WEBPLAYER', 'GET_FRAME_RESPONSE', 'testCallId', 'testViewId', 0, 0, 50, 50, 0.5],
                calledWith: ['testCallId', 'testViewId', 0, 0, 50, 50, 0.5]
            }
        ];

        tests.forEach((t) => {
            it(`should trigger observer ${t.label} with event ${WebplayerEvent[t.event]}`, () => {
                const mockListener = jest.fn().mockImplementation(() => {
                    // no op
                });
                t.listener().subscribe(mockListener);
                nativeBridge.handleEvent(t.handleEvent);
                expect(mockListener).toBeCalledWith(...t.calledWith);
            });
        });
    });

}));
