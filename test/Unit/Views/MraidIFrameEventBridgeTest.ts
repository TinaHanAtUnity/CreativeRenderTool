import 'mocha';
import * as sinon from 'sinon';
import { MraidIFrameEventBridge, MRAIDEvents, IMRAIDHandler } from 'MRAID/Views/MRAIDIFrameEventBridge';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';

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
            onResizeWebview: sinon.spy()
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
        const tests = [{
            msg: {
                type: MRAIDEvents.OPEN,
                url: 'unityads.unity3d.com'
            },
            verify: (msg?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onOpen, msg.url)
        }, {
            msg: {
                type: MRAIDEvents.CLOSE
            },
            verify: (msg?: any) => sinon.assert.called(<sinon.SinonSpy>handler.onClose)
        }, {
            msg: {
                type: MRAIDEvents.ORIENTATION,
                properties: {
                    allowOrientationChange: true,
                    forceOrientation: 'portrait'
                }
            },
            verify: (msg?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSetOrientationProperties, true, Orientation.PORTRAIT)
        }, {
            msg: {
                type: MRAIDEvents.ORIENTATION,
                properties: {
                    allowOrientationChange: true,
                    forceOrientation: 'landscape'
                }
            },
            verify: (msg?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onSetOrientationProperties, true, Orientation.LANDSCAPE)
        }, {
            msg: {
                type: MRAIDEvents.LOADED
            },
            verify: (msg?: any) => sinon.assert.called(<sinon.SinonSpy>handler.onLoaded)
        }, {
            msg: {
                type: MRAIDEvents.ANALYTICS_EVENT,
                event: 'x',
                eventData: 'y'
            },
            verify: (msg?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onAnalyticsEvent, msg.event, msg.eventData)
        }, {
            msg: {
                type: MRAIDEvents.STATE_CHANGE,
                state: 'test'
            },
            verify: (msg?: any) => sinon.assert.calledWith(<sinon.SinonSpy>handler.onStateChange, msg.state)
        }];

        describe(`${tests[0].msg.type} MRAID event`, () => {
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
            beforeEach(sendEvent(tests[0].msg.type, tests[0].msg.url));
            it(`should handle the ${tests[0].msg.type} event`, () => tests[0].verify(tests[0].msg));
        });

        describe(`${tests[1].msg.type} MRAID event`, () => {
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
            beforeEach(sendEvent(tests[1].msg.type));
            it(`should handle the ${tests[1].msg.type} event`, () => tests[1].verify(tests[1].msg));
        });

        describe(`${tests[2].msg.type} MRAID event`, () => {
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
            beforeEach(sendEvent(tests[2].msg.type, tests[2].msg.properties));
            it(`should handle the ${tests[2].msg.type} event`, () => tests[2].verify(tests[2].msg));
        });

        describe(`${tests[3].msg.type} MRAID event`, () => {
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
            beforeEach(sendEvent(tests[3].msg.type, tests[3].msg.properties));
            it(`should handle the ${tests[3].msg.type} event`, () => tests[3].verify(tests[3].msg));
        });

        describe(`${tests[4].msg.type} MRAID event`, () => {
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
            beforeEach(sendEvent(tests[4].msg.type));
            it(`should handle the ${tests[4].msg.type} event`, () => tests[4].verify(tests[4].msg));
        });

        describe(`${tests[5].msg.type} MRAID event`, () => {
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
            beforeEach(sendEvent(tests[5].msg.type, tests[5].msg.event, tests[5].msg.eventData));
            it(`should handle the ${tests[5].msg.type} event`, () => tests[5].verify(tests[5].msg));
        });

        describe(`${tests[6].msg.type} MRAID event`, () => {
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
            beforeEach(sendEvent(tests[6].msg.type, tests[6].msg.state));
            it(`should handle the ${tests[6].msg.type} event`, () => tests[6].verify(tests[6].msg));
        });
    });
});