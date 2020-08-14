import { Platform } from 'Core/Constants/Platform';
import { MRAIDEventBridgeForIFrame } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridgeForIFrame';
import { Core } from 'Core/__mocks__/Core';
import { IMRAIDEventBridgeHandler } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridge';
import { MRAIDEventBridge } from 'ExternalEndScreen/MRAIDEventBridge/__mocks__/MRAIDEventBridge';
import { ICoreApi } from 'Core/ICore';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    let eventBridge: MRAIDEventBridgeForIFrame;
    let handler: IMRAIDEventBridgeHandler;
    let core: ICoreApi;
    const iframe = <HTMLIFrameElement>{
        contentWindow: {
            postMessage
        }
    };

    const sendEvent = (type: string, url?: string) => {
        return new Promise((res) => {
            window.postMessage({
                type,
                url: url
            }, '*');
            setTimeout(res);
        });
    };

    describe('MRAIDEventBridgeForIFrame on ' + (platform === Platform.ANDROID ? 'android' : 'ios'), () => {
        beforeEach(() => {
            core = new Core().Api;
            iframe.contentWindow!.postMessage = jest.fn();

            handler = new MRAIDEventBridge();

            eventBridge = new MRAIDEventBridgeForIFrame(handler, core, iframe);
        });

        describe('when receiving events', () => {
            describe('when a close event is called from the iframe', () => {
                beforeEach(async () => {
                    await sendEvent('close');
                });

                it('onClose event handler is called', () => {
                    expect(handler.onClose).toBeCalledTimes(1);
                });
            });

            describe('when a loaded event is called from the iframe', () => {
                beforeEach(async () => {
                    await sendEvent('loaded');
                });

                it('onLoaded event handler is called', () => {
                    expect(handler.onLoaded).toBeCalledTimes(1);
                });
            });

            describe('when a open event is called from the iframe', () => {
                const url = 'https://cataas.com/cat';
                beforeEach(async () => {
                    await sendEvent('open', url);
                });

                it('onOpen event handler is called with the url', () => {
                    expect(handler.onOpen).toBeCalledWith(url);
                });
            });

            describe('when a ready event is called from the iframe', () => {
                beforeEach(async () => {
                    await sendEvent('ready');
                });

                it('onReady event handler is called', () => {
                    expect(handler.onReady).toBeCalledTimes(1);
                });
            });
        });

        describe('when sending events', () => {
            describe('when sendViewableEvent is called', () => {
                beforeEach(() => {
                    eventBridge.sendViewableEvent(true);
                });

                it('sends viewable event', () => {
                    expect(iframe.contentWindow!.postMessage).toBeCalledWith({ type: 'viewable', value: true }, '*');
                });
            });

            describe('when sendResizeEvent is called', () => {
                beforeEach(() => {
                    eventBridge.sendResizeEvent(1234, 4321);
                });

                it('sends resize event', () => {
                    expect(iframe.contentWindow!.postMessage).toBeCalledWith({
                        type: 'resize',
                        value: { width: 1234, height: 4321 }
                    }, '*');
                });
            });
        });
    });
});
