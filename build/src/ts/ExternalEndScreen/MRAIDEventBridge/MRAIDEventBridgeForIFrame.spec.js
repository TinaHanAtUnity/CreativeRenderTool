import * as tslib_1 from "tslib";
import { Platform } from 'Core/Constants/Platform';
import { MRAIDEventBridgeForIFrame } from 'ExternalEndScreen/MRAIDEventBridge/MRAIDEventBridgeForIFrame';
import { Core } from 'Core/__mocks__/Core';
import { MRAIDEventBridge } from 'ExternalEndScreen/MRAIDEventBridge/__mocks__/MRAIDEventBridge';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    let eventBridge;
    let handler;
    let core;
    const iframe = {
        contentWindow: {
            postMessage
        }
    };
    const sendEvent = (type, url) => {
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
            iframe.contentWindow.postMessage = jest.fn();
            handler = new MRAIDEventBridge();
            eventBridge = new MRAIDEventBridgeForIFrame(handler, core, iframe);
        });
        describe('when receiving events', () => {
            describe('when a close event is called from the iframe', () => {
                beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield sendEvent('close');
                }));
                it('onClose event handler is called', () => {
                    expect(handler.onClose).toBeCalledTimes(1);
                });
            });
            describe('when a loaded event is called from the iframe', () => {
                beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield sendEvent('loaded');
                }));
                it('onLoaded event handler is called', () => {
                    expect(handler.onLoaded).toBeCalledTimes(1);
                });
            });
            describe('when a open event is called from the iframe', () => {
                const url = 'https://cataas.com/cat';
                beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield sendEvent('open', url);
                }));
                it('onOpen event handler is called with the url', () => {
                    expect(handler.onOpen).toBeCalledWith(url);
                });
            });
            describe('when a ready event is called from the iframe', () => {
                beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    yield sendEvent('ready');
                }));
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
                    expect(iframe.contentWindow.postMessage).toBeCalledWith({ type: 'viewable', value: true }, '*');
                });
            });
            describe('when sendResizeEvent is called', () => {
                beforeEach(() => {
                    eventBridge.sendResizeEvent(1234, 4321);
                });
                it('sends resize event', () => {
                    expect(iframe.contentWindow.postMessage).toBeCalledWith({
                        type: 'resize',
                        value: { width: 1234, height: 4321 }
                    }, '*');
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURFdmVudEJyaWRnZUZvcklGcmFtZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0V4dGVybmFsRW5kU2NyZWVuL01SQUlERXZlbnRCcmlkZ2UvTVJBSURFdmVudEJyaWRnZUZvcklGcmFtZS5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sOERBQThELENBQUM7QUFDekcsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtEQUErRCxDQUFDO0FBR2pHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELElBQUksV0FBc0MsQ0FBQztJQUMzQyxJQUFJLE9BQWlDLENBQUM7SUFDdEMsSUFBSSxJQUFjLENBQUM7SUFDbkIsTUFBTSxNQUFNLEdBQXNCO1FBQzlCLGFBQWEsRUFBRTtZQUNYLFdBQVc7U0FDZDtLQUNKLENBQUM7SUFFRixNQUFNLFNBQVMsR0FBRyxDQUFDLElBQVksRUFBRSxHQUFZLEVBQUUsRUFBRTtRQUM3QyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDdkIsTUFBTSxDQUFDLFdBQVcsQ0FBQztnQkFDZixJQUFJO2dCQUNKLEdBQUcsRUFBRSxHQUFHO2FBQ1gsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNSLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztJQUVGLFFBQVEsQ0FBQywrQkFBK0IsR0FBRyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNqRyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxhQUFjLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUU5QyxPQUFPLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO1lBRWpDLFdBQVcsR0FBRyxJQUFJLHlCQUF5QixDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkUsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ25DLFFBQVEsQ0FBQyw4Q0FBOEMsRUFBRSxHQUFHLEVBQUU7Z0JBQzFELFVBQVUsQ0FBQyxHQUFTLEVBQUU7b0JBQ2xCLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM3QixDQUFDLENBQUEsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7b0JBQ3ZDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsUUFBUSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtnQkFDM0QsVUFBVSxDQUFDLEdBQVMsRUFBRTtvQkFDbEIsTUFBTSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzlCLENBQUMsQ0FBQSxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtvQkFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxRQUFRLENBQUMsNkNBQTZDLEVBQUUsR0FBRyxFQUFFO2dCQUN6RCxNQUFNLEdBQUcsR0FBRyx3QkFBd0IsQ0FBQztnQkFDckMsVUFBVSxDQUFDLEdBQVMsRUFBRTtvQkFDbEIsTUFBTSxTQUFTLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLENBQUEsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyw2Q0FBNkMsRUFBRSxHQUFHLEVBQUU7b0JBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsUUFBUSxDQUFDLDhDQUE4QyxFQUFFLEdBQUcsRUFBRTtnQkFDMUQsVUFBVSxDQUFDLEdBQVMsRUFBRTtvQkFDbEIsTUFBTSxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzdCLENBQUMsQ0FBQSxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtvQkFDdkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7WUFDakMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtnQkFDOUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDWixXQUFXLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hDLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7b0JBQzVCLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUNyRyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtnQkFDNUMsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDWixXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUMsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtvQkFDMUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsY0FBYyxDQUFDO3dCQUNyRCxJQUFJLEVBQUUsUUFBUTt3QkFDZCxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7cUJBQ3ZDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ1osQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9