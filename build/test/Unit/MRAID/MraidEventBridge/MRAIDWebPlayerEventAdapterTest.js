import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { MRAIDWebPlayerEventAdapter } from 'MRAID/EventBridge/MRAIDWebPlayerEventAdapter';
import { MRAIDAdapterContainer } from 'MRAID/EventBridge/MRAIDAdapterContainer';
import { Platform } from 'Core/Constants/Platform';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { Observable1 } from 'Core/Utilities/Observable';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { MRAIDEvents } from 'MRAID/EventBridge/MRAIDEventAdapter';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} MRAIDWebPlayerEventAdapter`, () => {
        let handler;
        let containerHandler;
        let mraidAdapter;
        let webPlayerAPI;
        let nativeBridge;
        let backend;
        let core;
        let ads;
        let container;
        let mraidAdapterContainer;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            webPlayerAPI = new WebPlayerApi(nativeBridge);
            webPlayerAPI.onWebPlayerEvent = new Observable1();
            nativeBridge.Webplayer = webPlayerAPI;
            handler = {
                onBridgeSetOrientationProperties: sinon.spy(),
                onBridgeOpen: sinon.spy(),
                onBridgeLoad: sinon.spy(),
                onBridgeAnalyticsEvent: sinon.spy(),
                onBridgeClose: sinon.spy(),
                onBridgeStateChange: sinon.spy(),
                onBridgeResizeWebview: sinon.spy(),
                onBridgeSendStats: sinon.spy(),
                onBridgeAREvent: sinon.spy(),
                onBridgeArReadyToShow: sinon.spy(),
                onBridgeDeviceOrientationSubscribe: sinon.spy(),
                onUseCustomClose: sinon.spy(),
                onBridgeArButtonHide: sinon.spy()
            };
            mraidAdapterContainer = new MRAIDAdapterContainer(handler);
            containerHandler = mraidAdapterContainer.getHandler();
            container = new InterstitialWebPlayerContainer(platform, ads);
            mraidAdapter = new MRAIDWebPlayerEventAdapter(core, mraidAdapterContainer, container);
            mraidAdapter.connect();
        });
        afterEach(() => {
            mraidAdapter.disconnect();
        });
        describe('receiving MRAID events', () => {
            const tests = [{
                    event: MRAIDEvents.OPEN,
                    data: ['unityads.unity3d.com'],
                    verify: (data) => sinon.assert.calledWith(containerHandler.onBridgeOpen, JSON.parse(data)[0])
                },
                {
                    event: MRAIDEvents.CLOSE,
                    data: [],
                    verify: (data) => sinon.assert.called(containerHandler.onBridgeClose)
                },
                {
                    event: MRAIDEvents.ORIENTATION,
                    data: [{
                            'allowOrientationChange': true,
                            'forceOrientation': 'portrait'
                        }],
                    verify: (data) => sinon.assert.calledWith(containerHandler.onBridgeSetOrientationProperties, true, Orientation.PORTRAIT)
                },
                {
                    event: MRAIDEvents.ORIENTATION,
                    data: [{
                            'allowOrientationChange': true,
                            'forceOrientation': 'landscape'
                        }],
                    verify: (data) => sinon.assert.calledWith(containerHandler.onBridgeSetOrientationProperties, true, Orientation.LANDSCAPE)
                },
                {
                    event: MRAIDEvents.LOADED,
                    data: [],
                    verify: (data) => sinon.assert.called(containerHandler.onBridgeLoad)
                },
                {
                    event: MRAIDEvents.ANALYTICS_EVENT,
                    data: ['x', 'y'],
                    verify: (data) => sinon.assert.calledWith(containerHandler.onBridgeAnalyticsEvent, JSON.parse(data)[0], JSON.parse(data)[1])
                },
                {
                    event: MRAIDEvents.STATE_CHANGE,
                    data: ['test'],
                    verify: (data) => sinon.assert.calledWith(containerHandler.onBridgeStateChange, JSON.parse(data)[0])
                },
                {
                    event: MRAIDEvents.RESIZE_WEBVIEW,
                    data: [],
                    verify: (data) => sinon.assert.called(containerHandler.onBridgeResizeWebview)
                },
                {
                    event: MRAIDEvents.SEND_STATS,
                    data: [1, 3, 4],
                    verify: (data) => sinon.assert.calledWith(containerHandler.onBridgeSendStats, JSON.parse(data)[0], JSON.parse(data)[1], JSON.parse(data)[2])
                },
                {
                    event: MRAIDEvents.DEVORIENTATION_SUB,
                    data: [],
                    verify: (data) => sinon.assert.called(containerHandler.onBridgeDeviceOrientationSubscribe)
                }
            ];
            for (const test of tests) {
                const eventType = `"${test.event}"`;
                const params = JSON.stringify(test.data);
                describe(`${eventType} MRAID event`, () => {
                    beforeEach(() => {
                        container.onWebPlayerEvent.trigger(`[
                            ${eventType},
                            ${params}
                        ]`);
                    });
                    it(`should handle the ${eventType} event`, () => {
                        test.verify(params);
                    });
                });
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURXZWJQbGF5ZXJFdmVudEFkYXB0ZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01SQUlEL01yYWlkRXZlbnRCcmlkZ2UvTVJBSURXZWJQbGF5ZXJFdmVudEFkYXB0ZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFHL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUMxRixPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUdoRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDeEcsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUVwRCxPQUFPLEVBQWlCLFdBQVcsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRWpGLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELFFBQVEsQ0FBQyxHQUFHLFFBQVEsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1FBQ3BELElBQUksT0FBc0IsQ0FBQztRQUMzQixJQUFJLGdCQUErQixDQUFDO1FBQ3BDLElBQUksWUFBd0MsQ0FBQztRQUM3QyxJQUFJLFlBQTBCLENBQUM7UUFDL0IsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksT0FBZ0IsQ0FB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