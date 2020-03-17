import { PausableListenerApi } from 'Ads/Native/PausableListener';
import { FinishState } from 'Core/Constants/FinishState';

import { NativeBridge, NativeBridgeMock } from 'Core/Native/Bridge/__mocks__/NativeBridge';

describe('PausableListenerTest', () => {
    const methodNameCallIndex = 1;


    describe('when created', () => {
        let nativeBridge: NativeBridgeMock;
        let listener: PausableListenerApi;

        beforeEach(() => {
            nativeBridge = new NativeBridge();
            nativeBridge.invoke = jest.fn().mockReturnValue(Promise.resolve());
            listener = new PausableListenerApi(nativeBridge);
        });

        it('should be unpaused', () => {
            listener.sendReadyEvent('video');
            expect(nativeBridge.invoke.mock.calls.length).toBe(1);
        });
    });

    describe('when paused', () => {
        let nativeBridge: NativeBridgeMock;
        let listener: PausableListenerApi;

        beforeEach(() => {
            nativeBridge = new NativeBridge();
            nativeBridge.invoke = jest.fn().mockReturnValue(Promise.resolve());
            listener = new PausableListenerApi(nativeBridge);
            listener.pauseEvents();
        });

        it('should not send events', () => {
            listener.sendReadyEvent('video');
            listener.sendStartEvent('video');
            listener.sendFinishEvent('video', FinishState.COMPLETED);
            listener.sendClickEvent('video');
            listener.sendPlacementStateChangedEvent('video', 'WAITING', 'READY');
            listener.sendErrorEvent('test', 'error details');

            expect(nativeBridge.invoke.mock.calls.length).toBe(0);
        });
    });

    describe('when resumed', () => {
        let nativeBridge: NativeBridgeMock;
        let listener: PausableListenerApi;

        beforeEach(() => {
            nativeBridge = new NativeBridge();
            nativeBridge.invoke = jest.fn().mockReturnValue(Promise.resolve());
            listener = new PausableListenerApi(nativeBridge);
            listener.pauseEvents();
            listener.sendReadyEvent('video');
            listener.sendStartEvent('video');
            listener.sendFinishEvent('video', FinishState.COMPLETED);
            listener.sendClickEvent('video');
            listener.sendPlacementStateChangedEvent('video', 'WAITING', 'READY');
            listener.sendErrorEvent('test', 'error details');
        });

        it('should send all events', () => {
            listener.resumeEvents();
            expect(nativeBridge.invoke.mock.calls.length).toBe(6);
        });

        it('should send the events in the order recieved', () => {
            listener.resumeEvents();
            const expectedMethodNames: string[] = [
                'sendReadyEvent',
                'sendStartEvent',
                'sendFinishEvent',
                'sendClickEvent',
                'sendPlacementStateChangedEvent',
                'sendErrorEvent'
            ];

            for (const methodName of expectedMethodNames) {
                const call = nativeBridge.invoke.mock.calls.shift();
                expect(methodName).toBe(call[methodNameCallIndex]);
            }
        });
    });
});
