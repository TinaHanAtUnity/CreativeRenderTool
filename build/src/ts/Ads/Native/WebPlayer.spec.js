import { NativeBridge } from 'Core/Native/Bridge/__mocks__/NativeBridge';
import { WebPlayerApi, WebplayerEvent } from 'Ads/Native/WebPlayer';
describe('WebPlayerApi', () => {
    let webPlayerApi;
    let nativeBridge;
    beforeEach(() => {
        nativeBridge = new NativeBridge();
        webPlayerApi = new WebPlayerApi(nativeBridge);
    });
    describe('Api calls', () => {
        // Currently nothing, but can test if native bridge mock is invoked with correct params
    });
    describe('Observer Tests', () => {
        const tests = [
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
                handleEventParams: ['testUrl', 'testErrorMessage', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl']
            }, {
                label: 'onWebPlayerEvent',
                event: WebplayerEvent.WEBPLAYER_EVENT,
                listener: () => {
                    return webPlayerApi.onWebPlayerEvent;
                },
                handleEventParams: ['testData', 'testViewId'],
                calledWithOrder: ['testViewId', 'testData']
            }, {
                label: 'shouldOverrideUrlLoading',
                event: WebplayerEvent.SHOULD_OVERRIDE_URL_LOADING,
                listener: () => {
                    return webPlayerApi.shouldOverrideUrlLoading;
                },
                handleEventParams: ['testUrl', 'testMethod', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl', 'testMethod']
            }, {
                label: 'shouldOverrideUrlLoading',
                event: WebplayerEvent.SHOULD_OVERRIDE_URL_LOADING,
                listener: () => {
                    return webPlayerApi.shouldOverrideUrlLoading;
                },
                handleEventParams: ['testUrl', 'testViewId'],
                calledWithOrder: ['testViewId', 'testUrl', undefined]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViUGxheWVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL05hdGl2ZS9XZWJQbGF5ZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFvQixNQUFNLDJDQUEyQyxDQUFDO0FBRTNGLE9BQU8sRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFHcEUsUUFBUSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7SUFDMUIsSUFBSSxZQUEwQixDQUFDO0lBQy9CLElBQUksWUFBOEIsQ0FBQztJQUVuQyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDbEMsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xELENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7UUFDdkIsdUZBQXVGO0lBQzNGLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtRQUM1QixNQUFNLEtBQUssR0FNTDtZQUNGO2dCQUNJLEtBQUssRUFBRSxlQUFlO2dCQUN0QixLQUFLLEVBQUUsY0FBYyxDQUFDLFlBQVk7Z0JBQ2xDLFFBQVEsRUFBRSxHQUFHLEVBQUU7b0JBQ1gsT0FBTyxZQUFZLENBQUMsYUFBYSxDQUFDO2dCQUN0QyxDQUFDO2dCQUNELGlCQUFpQixFQUFFLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQztnQkFDNUMsZUFBZSxFQUFFLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQzthQUM3QyxFQUFFO2dCQUNDLEtBQUssRUFBRSxnQkFBZ0I7Z0JBQ3ZCLEtBQUssRUFBRSxjQUFjLENBQUMsYUFBYTtnQkFDbkMsUUFBUSxFQUFFLEdBQUcsRUFBRTtvQkFDWCxPQUFPLFlBQVksQ0FB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