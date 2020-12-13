import 'mocha';
import * as sinon from 'sinon';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { MRAIDIFrameEventAdapter } from 'MRAID/EventBridge/MRAIDIFrameEventAdapter';
import { Platform } from 'Core/Constants/Platform';
import { MRAIDAdapterContainer } from 'MRAID/EventBridge/MRAIDAdapterContainer';
import { MRAIDEvents } from 'MRAID/EventBridge/MRAIDEventAdapter';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} MRAIDIframeEventAdapter`, () => {
        let handler;
        let containerHandler;
        let mraidAdapter;
        let iframe;
        let nativeBridge;
        let backend;
        let core;
        let mraidAdapterContainer;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
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
            iframe = sinon.createStubInstance(HTMLIFrameElement);
            Object.defineProperty(iframe, 'contentWindow', {
                value: {
                    postMessage: sinon.spy()
                }
            });
            mraidAdapter = new MRAIDIFrameEventAdapter(core, mraidAdapterContainer, iframe);
            mraidAdapter.connect();
        });
        afterEach(() => {
            mraidAdapter.disconnect();
        });
        describe('send MRAID events', () => {
            it('should send viewable event via postmessage', () => {
                const expected = true;
                mraidAdapter.sendViewableEvent(true);
                sinon.assert.calledWith(iframe.contentWindow.postMessage, { type: 'viewable', value: expected });
            });
        });
        describe('receiving MRAID events', () => {
            describe(`${MRAIDEvents.OPEN} MRAID event`, () => {
                const sendEvent = (e, data) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e,
                                url: data
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.OPEN, 'unityads.unity3d.com'));
                it(`should handle the Mraid ${MRAIDEvents.OPEN} event`, () => {
                    sinon.assert.calledWith(containerHandler.onBridgeOpen, 'unityads.unity3d.com');
                });
            });
            describe(`${MRAIDEvents.LOADED} MRAID event`, () => {
                const sendEvent = (e, data) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.LOADED));
                it(`should handle the ${MRAIDEvents.LOADED} event`, () => {
                    sinon.assert.called(containerHandler.onBridgeLoad);
                });
            });
            describe(`${MRAIDEvents.ANALYTICS_EVENT} MRAID event`, () => {
                const sendEvent = (e, event, eventData) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e,
                                event: event,
                                eventData: eventData
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.ANALYTICS_EVENT, 'x', 'y'));
                it(`should handle the ${MRAIDEvents.ANALYTICS_EVENT} event`, () => {
                    sinon.assert.calledWith(containerHandler.onBridgeAnalyticsEvent, 'x', 'y');
                });
            });
            describe(`${MRAIDEvents.STATE_CHANGE} MRAID event`, () => {
                const sendEvent = (e, data) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e,
                                state: data
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.STATE_CHANGE, 'test'));
                it(`should handle the ${MRAIDEvents.STATE_CHANGE} event`, () => {
                    sinon.assert.calledWith(containerHandler.onBridgeStateChange, 'test');
                });
            });
            describe(`${MRAIDEvents.SEND_STATS} MRAID event`, () => {
                const sendEvent = (e, totalTime, playTime, frameCount) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e,
                                totalTime: totalTime,
                                playTime: playTime,
                                frameCount: frameCount
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.SEND_STATS, 20, 10, 200));
                it(`should handle the ${MRAIDEvents.SEND_STATS} event`, () => {
                    sinon.assert.calledWith(containerHandler.onBridgeSendStats, 20, 10, 200);
                });
            });
            describe(`${MRAIDEvents.AR} MRAID event`, () => {
                const sendEvent = (e, functionName, args) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e,
                                data: {
                                    functionName: functionName,
                                    args: args
                                }
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.AR, 'log'));
                it(`should handle the ${MRAIDEvents.AR} event`, () => {
                    sinon.assert.calledWith(containerHandler.onBridgeAREvent, { data: { args: undefined, functionName: 'log' }, type: 'ar' });
                });
            });
            describe(`${MRAIDEvents.CLOSE} MRAID event`, () => {
                const sendEvent = (e, data) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.CLOSE));
                it(`should handle the ${MRAIDEvents.CLOSE} event`, () => {
                    sinon.assert.called(containerHandler.onBridgeClose);
                });
            });
            describe(`landscape ${MRAIDEvents.ORIENTATION} MRAID event`, () => {
                const sendEvent = (e, data) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e,
                                properties: data
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.ORIENTATION, { allowOrientationChange: true, forceOrientation: 'landscape' }));
                it(`should handle the ${MRAIDEvents.ORIENTATION} event`, () => {
                    sinon.assert.calledWith(containerHandler.onBridgeSetOrientationProperties, true, Orientation.LANDSCAPE);
                });
            });
            describe(`${MRAIDEvents.DEVORIENTATION_SUB} MRAID event`, () => {
                const sendEvent = (e, data) => {
                    return () => {
                        return new Promise((res) => {
                            window.postMessage({
                                type: e,
                                properties: data
                            }, '*');
                            setTimeout(res);
                        });
                    };
                };
                beforeEach(sendEvent(MRAIDEvents.DEVORIENTATION_SUB, {}));
                it(`should handle the ${MRAIDEvents.DEVORIENTATION_SUB} event`, () => {
                    sinon.assert.called(containerHandler.onBridgeDeviceOrientationSubscribe);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURJRnJhbWVFdmVudEFkYXB0ZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01SQUlEL01yYWlkRXZlbnRCcmlkZ2UvTVJBSURJRnJhbWVFdmVudEFkYXB0ZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFHL0IsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUNwRixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHbkQsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDaEYsT0FBTyxFQUFpQixXQUFXLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUVqRixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsR0FBRyxRQUFRLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtRQUNqRCxJQUFJLE9BQXNCLENBQUM7UUFDM0IsSUFBSSxnQkFBK0IsQ0FBQztRQUNwQyxJQUFJLFlBQXFDLENBQUM7UUFDMUMsSUFBSSxNQUF5QixDQUFDO1FBQzlCLElBQUksWUFBMEIsQ0FBQztRQUMvQixJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxJQUFjLENBQUM7UUFDbkIsSUFBSSxxQkFBNEMsQ0FBQztRQUVqRCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFH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