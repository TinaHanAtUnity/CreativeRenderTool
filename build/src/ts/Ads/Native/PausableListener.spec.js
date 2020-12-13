import { PausableListenerApi } from 'Ads/Native/PausableListener';
import { FinishState } from 'Core/Constants/FinishState';
import { NativeBridge } from 'Core/Native/Bridge/__mocks__/NativeBridge';
describe('PausableListenerTest', () => {
    const methodNameCallIndex = 1;
    const expectedMethodNames = [
        'sendReadyEvent',
        'sendStartEvent',
        'sendFinishEvent',
        'sendClickEvent',
        'sendPlacementStateChangedEvent',
        'sendErrorEvent'
    ];
    let nativeBridge;
    let listener;
    beforeEach(() => {
        nativeBridge = new NativeBridge();
        listener = new PausableListenerApi(nativeBridge);
    });
    describe('should invoke native bridge', () => {
        beforeEach(() => {
            listener.sendReadyEvent('video');
        });
        it('should call once', () => {
            expect(nativeBridge.invoke.mock.calls.length).toBe(1);
        });
        it('should call with correct params', () => {
            expect(nativeBridge.invoke).toBeCalledWith(expect.anything(), 'sendReadyEvent', expect.anything());
        });
    });
    describe('when pauseEvents is called and events are triggered', () => {
        beforeEach(() => {
            listener.pauseEvents();
            listener.sendReadyEvent('video');
            listener.sendStartEvent('video');
            listener.sendFinishEvent('video', FinishState.COMPLETED);
            listener.sendClickEvent('video');
            listener.sendPlacementStateChangedEvent('video', 'WAITING', 'READY');
            listener.sendErrorEvent('test', 'error details');
        });
        it('should not send events', () => {
            expect(nativeBridge.invoke.mock.calls.length).toBe(0);
        });
        describe('when resumed after pause', () => {
            beforeEach(() => {
                listener.resumeEvents();
            });
            it('should send all events', () => {
                expect(nativeBridge.invoke.mock.calls.length).toBe(6);
            });
            it('should send the events in the order received', () => {
                for (const methodName of expectedMethodNames) {
                    const call = nativeBridge.invoke.mock.calls.shift();
                    expect(methodName).toBe(call[methodNameCallIndex]);
                }
            });
        });
    });
    describe('when resumeEvents is called', () => {
        beforeEach(() => {
            listener.pauseEvents();
            listener.sendReadyEvent('video');
            listener.resumeEvents();
        });
        it('should clear events', () => {
            listener.resumeEvents();
            expect(nativeBridge.invoke.mock.calls.length).toBe(1);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF1c2FibGVMaXN0ZW5lci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9OYXRpdmUvUGF1c2FibGVMaXN0ZW5lci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsWUFBWSxFQUFvQixNQUFNLDJDQUEyQyxDQUFDO0FBRTNGLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7SUFDbEMsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLENBQUM7SUFDOUIsTUFBTSxtQkFBbUIsR0FBYTtRQUNsQyxnQkFBZ0I7UUFDaEIsZ0JBQWdCO1FBQ2hCLGlCQUFpQjtRQUNqQixnQkFBZ0I7UUFDaEIsZ0NBQWdDO1FBQ2hDLGdCQUFnQjtLQUNuQixDQUFDO0lBRUYsSUFBSSxZQUE4QixDQUFDO0lBQ25DLElBQUksUUFBNkIsQ0FBQztJQUVsQyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDbEMsUUFBUSxHQUFHLElBQUksbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDckQsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1FBRXpDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtZQUN4QixNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FB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