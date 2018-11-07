import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IMRAIDHandler, MraidIFrameEventBridge, MRAIDEvents } from 'Ads/Views/MraidIFrameEventBridge';

describe('MraidIframeEventBridge', () => {
    let handler: IMRAIDHandler;
    let mraidBridge: MraidIFrameEventBridge;
    let iframe: HTMLIFrameElement;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        handler = {
            onBridgeSetOrientationProperties: sinon.spy(),
            onBridgeOpen: sinon.spy(),
            onBridgeLoad: sinon.spy(),
            onBridgeAnalyticsEvent: sinon.spy(),
            onBridgeClose: sinon.spy(),
            onBridgeStateChange: sinon.spy(),
            onBridgeResizeWebview: sinon.spy(),
            onBridgeSendStats: sinon.spy(),
            onBridgeAREvent: sinon.spy()
        };
        mraidBridge = new MraidIFrameEventBridge(nativeBridge, handler);
        iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        mraidBridge.connect(iframe);
    });

    afterEach(() => {
        document.body.removeChild(iframe);
        mraidBridge.disconnect();
    });

    describe('receiving MRAID events', () => {
        describe(`${MRAIDEvents.OPEN} MRAID event`, () => {
            const sendEvent = (e: string, data?: any) => {
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeOpen, 'unityads.unity3d.com');
            });
        });

        describe(`${MRAIDEvents.LOADED} MRAID event`, () => {
            const sendEvent = (e: string, data?: any) => {
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
                sinon.assert.called(<sinon.SinonSpy>handler.onBridgeLoad);
            });
        });

        describe(`${MRAIDEvents.ANALYTICS_EVENT} MRAID event`, () => {
            const sendEvent = (e: string, event: any, eventData: any) => {
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeAnalyticsEvent, 'x', 'y');
            });
        });

        describe(`${MRAIDEvents.STATE_CHANGE} MRAID event`, () => {
            const sendEvent = (e: string, data?: any) => {
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeStateChange, 'test');
            });
        });

        describe(`${MRAIDEvents.SEND_STATS} MRAID event`, () => {
            const sendEvent = (e: string, totalTime: any, playTime: any, frameCount: any) => {
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeSendStats, 20, 10, 200);
            });
        });

        describe(`${MRAIDEvents.AR} MRAID event`, () => {
            const sendEvent = (e: string, functionName: string, args?: any) => {
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeAREvent, { data: { args: undefined, functionName: 'log' }, type: 'ar' });
            });
        });

        describe(`${MRAIDEvents.CLOSE} MRAID event`, () => {
            const sendEvent = (e: string, data?: any) => {
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
                sinon.assert.called(<sinon.SinonSpy>handler.onBridgeClose);
            });
        });

        xdescribe(`portrait ${MRAIDEvents.ORIENTATION} MRAID event`, () => {
            const sendEvent = (e: string, data?: any) => {
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
            beforeEach(sendEvent(MRAIDEvents.ORIENTATION, {allowOrientationChange: true, forceOrientation: 'portrait'}));
            it(`should handle the ${MRAIDEvents.ORIENTATION} event`, () => {
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeSetOrientationProperties, true, Orientation.PORTRAIT);
            });
        });

        xdescribe(`landscape ${MRAIDEvents.ORIENTATION} MRAID event`, () => {
            const sendEvent = (e: string, data?: any) => {
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
            beforeEach(sendEvent(MRAIDEvents.ORIENTATION, {allowOrientationChange: true, forceOrientation: 'landscape'}));
            it(`should handle the ${MRAIDEvents.ORIENTATION} event`, () => {
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onBridgeSetOrientationProperties, true, Orientation.LANDSCAPE);
            });
        });
    });
});
