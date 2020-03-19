import { PausableListenerApi } from 'Ads/Native/PausableListener';
import { FinishState } from 'Core/Constants/FinishState';

import { NativeBridge, NativeBridgeMock } from 'Core/Native/Bridge/__mocks__/NativeBridge';

describe('PausableListenerTest', () => {
    const methodNameCallIndex = 1;
    const expectedMethodNames: string[] = [
        'sendReadyEvent',
        'sendStartEvent',
        'sendFinishEvent',
        'sendClickEvent',
        'sendPlacementStateChangedEvent',
        'sendErrorEvent'
    ];

    let nativeBridge: NativeBridgeMock;
    let listener: PausableListenerApi;

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
            listener.sendErrorEvent('test', 'error details');        });

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

        const sendEventAfterResumeEvents = () => {
            listener.pauseEvents();
            listener.sendReadyEvent('video');
            listener.resumeEvents();
        }

        beforeEach(() => {
            sendEventAfterResumeEvents();
        });

        it('should clear events', () => {
            listener.resumeEvents();
            expect(nativeBridge.invoke.mock.calls.length).toBe(1);
        });
    });
});
