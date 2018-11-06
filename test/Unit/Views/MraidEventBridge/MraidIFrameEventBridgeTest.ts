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
            onSetOrientationProperties: sinon.spy(),
            onOpen: sinon.spy(),
            onLoaded: sinon.spy(),
            onAnalyticsEvent: sinon.spy(),
            onClose: sinon.spy(),
            onStateChange: sinon.spy(),
            onResizeWebview: sinon.spy(),
            onSendStats: sinon.spy()
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onOpen, 'unityads.unity3d.com');
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
                sinon.assert.called(<sinon.SinonSpy>handler.onLoaded);
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onAnalyticsEvent, 'x', 'y');
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onStateChange, 'test');
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onSendStats, 20, 10, 200);
            });
        });

        describe(`${MRAIDEvents.ORIENTATION} MRAID event`, () => {
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onSetOrientationProperties, true, Orientation.PORTRAIT);
            });
        });

        describe(`${MRAIDEvents.ORIENTATION} MRAID event`, () => {
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
                sinon.assert.calledWith(<sinon.SinonSpy>handler.onSetOrientationProperties, true, Orientation.LANDSCAPE);
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
                sinon.assert.called(<sinon.SinonSpy>handler.onClose);
            });
        });
    });
});
