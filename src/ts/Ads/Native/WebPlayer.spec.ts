import { NativeBridge, NativeBridgeMock } from 'Core/Native/Bridge/__mocks__/NativeBridge';

import { WebPlayerApi, WebplayerEvent } from 'Ads/Native/WebPlayer';
import { Observable } from 'Core/Utilities/Observable';

describe('WebPlayerApi', () => {
    let webPlayerApi: WebPlayerApi;
    let nativeBridge: NativeBridgeMock;

    beforeEach(() => {
        nativeBridge = new NativeBridge();
        webPlayerApi = new WebPlayerApi(nativeBridge);
    });

    describe('Api calls', () => {
        // Currently nothing, but can test if native bridge mock is invoked with correct params
    });

    describe('Observer Tests', () => {
        const tests: {
            label: string;
            event: WebplayerEvent;
            listener(): Observable<unknown>;
            handleEventParams: unknown[];
            calledWithOrder: unknown[];
        }[] = [
            {
                label: 'onPageStarted',
                event: WebplayerEvent.PAGE_STARTED,
                listener: () => {
                    return webPlayerApi.onPageStarted;
                },
                handleEventParams: ['testUrl', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl']
            }, {
                label: 'onPageFinished',
                event: WebplayerEvent.PAGE_FINISHED,
                listener: () => {
                    return webPlayerApi.onPageFinished;
                },
                handleEventParams: ['testUrl', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl']
            }, {
                label: 'onPageFinished',
                event: WebplayerEvent.ERROR,
                listener: () => {
                    return webPlayerApi.onPageFinished;
                },
                handleEventParams: ['testUrl', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl']
            }, {
                label: 'onWebPlayerEvent',
                event: WebplayerEvent.WEBPLAYER_EVENT,
                listener: () => {
                    return webPlayerApi.onWebPlayerEvent;
                },
                handleEventParams: ['testUrl', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl']
            }, {
                label: 'shouldOverrideUrlLoading',
                event: WebplayerEvent.SHOULD_OVERRIDE_URL_LOADING,
                listener: () => {
                    return webPlayerApi.shouldOverrideUrlLoading;
                },
                handleEventParams: ['testUrl', 'testMethod', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl', 'testMethod']
            }, {
                label: 'onCreateWebView',
                event: WebplayerEvent.CREATE_WEBVIEW,
                listener: () => {
                    return webPlayerApi.onCreateWebView;
                },
                handleEventParams: ['testUrl', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl']
            }, {
                label: 'onFrameUpdate',
                event: WebplayerEvent.FRAME_UPDATE,
                listener: () => {
                    return webPlayerApi.onFrameUpdate;
                },
                handleEventParams: ['testViewId', 0, 10, 50, 50, 0.5],
                calledWithOrder: ['testViewId', 0, 10, 50, 50, 0.5]
            }, {
                label: 'onGetFrameResponse',
                event: WebplayerEvent.GET_FRAME_RESPONSE,
                listener: () => {
                    return webPlayerApi.onGetFrameResponse;
                },
                handleEventParams: ['testCallId', 'testViewId', 0, 0, 50, 50, 0.5],
                calledWithOrder: ['testCallId', 'testViewId', 0, 0, 50, 50, 0.5]
            }
        ];

        tests.forEach((t) => {
            it(`should trigger observer ${t.label} with event ${WebplayerEvent[t.event]} in the correct order`, () => {
                const mockListener = jest.fn().mockImplementation();
                t.listener().subscribe(mockListener);
                webPlayerApi.handleEvent(WebplayerEvent[t.event], t.handleEventParams);
                expect(mockListener).toBeCalledWith(...t.calledWithOrder);
            });
        });
    });
});
