import { Platform } from 'Core/Constants/Platform';
import { IframeMRAIDEventBridge } from 'ExternalEndScreen/MRAIDEventBridge/IframeMRAIDEventBridge';
import { Core } from 'Core/__mocks__/Core';
import { IMRAIDEventBridgeHandler } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridge';
import { MRAIDEventBridge } from 'ExternalEndScreen/MRAIDEventBridge/__mocks__/MRAIDEventBridge';
import { ICoreApi } from 'Core/ICore';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    let eventBridge: IframeMRAIDEventBridge;
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

    describe('IFrameMRAIDEventBridge on ' + (platform === Platform.ANDROID ? 'android' : 'ios'), () => {
        beforeEach(() => {
            core = new Core().Api;
            iframe.contentWindow!.postMessage = jest.fn();

            handler = new MRAIDEventBridge();

            eventBridge = new IframeMRAIDEventBridge(handler, core, iframe);
        });

        describe('when an event is called from the iframe', () => {
            it('is closed', () => {
                return sendEvent('close').then(() => {
                    expect(handler.onClose).toBeCalledTimes(1);
                });
            });

            it('is loaded', () => {
                return sendEvent('loaded').then(() => {
                    expect(handler.onLoaded).toBeCalledTimes(1);
                });
            });

            it('is opened', () => {
                const url = 'https://cataas.com/cat';
                return sendEvent('open', url).then(() => {
                    expect(handler.onOpen).toBeCalledWith(url);
                });
            });

            it('is ready', () => {
                return sendEvent('ready').then(() => {
                    expect(handler.onReady).toBeCalledTimes(1);
                });
            });
        });

        describe('when calling a method', () => {
            it('sends viewable event', () => {
                eventBridge.sendViewableEvent(true);
                expect(iframe.contentWindow!.postMessage).toBeCalledWith({ type: 'viewable', value: true }, '*');
            });

            it('sends resize event', () => {
                eventBridge.sendResizeEvent(1234, 4321);
                expect(iframe.contentWindow!.postMessage).toBeCalledWith({
                    type: 'resize',
                    value: { width: 1234, height: 4321 }
                }, '*');
            });
        });
    });
});
