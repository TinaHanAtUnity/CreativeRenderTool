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
        nativeBridge.invoke = jest.fn().mockReturnValue(Promise.resolve(() => {}));
        listener = new PausableListenerApi(nativeBridge);
    });

    describe('when created', () => {
        it('should be unpaused', () => {
            listener.sendReadyEvent('video');
            listener.sendStartEvent('video');
            listener.sendFinishEvent('video', FinishState.COMPLETED);
            listener.sendClickEvent('video');
            listener.sendPlacementStateChangedEvent('video', 'WAITING', 'READY');
            listener.sendErrorEvent('test', 'error details');

            expect(nativeBridge.invoke.mock.calls.length).toBe(expectedMethodNames.length);
            for (const methodName of expectedMethodNames) {
                const call = nativeBridge.invoke.mock.calls.shift();
                expect(methodName).toBe(call[methodNameCallIndex]);
            }
        });
    });

    describe('when paused', () => {
        it('should not send events', () => {
            listener.pauseEvents();

            listener.sendReadyEvent('video');
            listener.sendStartEvent('video');
            listener.sendFinishEvent('video', FinishState.COMPLETED);
            listener.sendClickEvent('video');
            listener.sendPlacementStateChangedEvent('video', 'WAITING', 'READY');
            listener.sendErrorEvent('test', 'error details');

            expect(nativeBridge.invoke.mock.calls.length).toBe(0);
        });
    });

    describe('when unpaused', () => {
        it('should send queued events', () => {
            listener.pauseEvents();

            listener.sendReadyEvent('video');
            listener.sendStartEvent('video');
            listener.sendFinishEvent('video', FinishState.COMPLETED);
            listener.sendClickEvent('video');
            listener.sendPlacementStateChangedEvent('video', 'WAITING', 'READY');
            listener.sendErrorEvent('test', 'error details');

            listener.resumeEvents();

            expect(nativeBridge.invoke.mock.calls.length).toBe(expectedMethodNames.length);
            for (const methodName of expectedMethodNames) {
                const call = nativeBridge.invoke.mock.calls.shift();
                expect(methodName).toBe(call[methodNameCallIndex]);
            }
        });

        it('should send new events', () => {
            listener.pauseEvents();

            listener.sendReadyEvent('video');
            listener.sendStartEvent('video');
            listener.sendFinishEvent('video', FinishState.COMPLETED);

            listener.resumeEvents();

            listener.sendClickEvent('video');
            listener.sendPlacementStateChangedEvent('video', 'WAITING', 'READY');
            listener.sendErrorEvent('test', 'error details');

            expect(nativeBridge.invoke.mock.calls.length).toBe(expectedMethodNames.length);
            for (const methodName of expectedMethodNames) {
                const call = nativeBridge.invoke.mock.calls.shift();
                expect(methodName).toBe(call[methodNameCallIndex]);
            }
        });
    });
});
