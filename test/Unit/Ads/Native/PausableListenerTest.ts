import { PausableListenerApi } from 'Ads/Native/PausableListener';
import { Platform } from 'Core/Constants/Platform';
import { FinishState } from 'Core/Constants/FinishState';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { EventCategory } from 'Core/Constants/EventCategory';
import { NativeApi } from 'Core/Native/Bridge/NativeApi';

import { assert } from 'chai';

class WebviewBridgeMock implements IWebViewBridge {
    public handleInvocation(invocations: string): void {
        // NOP
    }
    public handleCallback(id: string, status: string, parameters?: string): void {
        // NOP
    }
}

class InvokeElement {
    public className: string;
    public methodName: string;

    constructor(className: string, methodName: string) {
        this.className = className;
        this.methodName = methodName;
    }
}

class NativeBridgeMock extends NativeBridge {
    public _invokeList: InvokeElement[] = [];
    constructor() { super(new WebviewBridgeMock(), Platform.ANDROID, false); }
    public registerCallback<T>(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void): number {
        return 0;
    }
    public invoke<T>(className: string, methodName: string, parameters?: unknown[]): Promise<T> {
        this._invokeList.push(new InvokeElement(className, methodName));
        return new Promise<T>(() => {
            // NOP
        });
    }
    public handleCallback(results: unknown[][]): void {
        // NOP
    }
    public addEventHandler(eventCategory: EventCategory, nativeApi: NativeApi) {
        // NOP
    }
    public handleEvent(parameters: unknown[]): void {
        // NOP
    }
    public handleInvocation(parameters: unknown[]): void {
        // NOP
    }
    public getPlatform(): Platform {
        return Platform.ANDROID;
    }
    public setAutoBatchEnabled(enabled: boolean) {
        // NOP
    }
}

describe('PausableListenerTest', () => {
    const expectedEvents: InvokeElement[] = [
        new InvokeElement('com.unity3d.services.ads.api.Listener', 'sendReadyEvent'),
        new InvokeElement('com.unity3d.services.ads.api.Listener', 'sendStartEvent'),
        new InvokeElement('com.unity3d.services.ads.api.Listener', 'sendFinishEvent'),
        new InvokeElement('com.unity3d.services.ads.api.Listener', 'sendClickEvent'),
        new InvokeElement('com.unity3d.services.ads.api.Listener', 'sendPlacementStateChangedEvent'),
        new InvokeElement('com.unity3d.services.ads.api.Listener', 'sendErrorEvent')
    ];

    let nativeBridge: NativeBridgeMock;
    let listener: PausableListenerApi;

    beforeEach(() => {
        nativeBridge = new NativeBridgeMock();
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

            assert(nativeBridge._invokeList.length === expectedEvents.length, 'all queued events should be sent');
            for (const expected of expectedEvents) {
                const got: InvokeElement | undefined = nativeBridge._invokeList.shift();
                if (got !== undefined) {
                    assert(got.methodName === expected.methodName, 'queued events should be sent in the order recieved');
                }
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

            assert(nativeBridge._invokeList.length === 0, 'no events should be sent');
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
            assert(nativeBridge._invokeList.length === expectedEvents.length, 'all queued events should be sent');
            for (const expected of expectedEvents) {
                const got: InvokeElement | undefined = nativeBridge._invokeList.shift();
                if (got !== undefined) {
                    assert(got.methodName === expected.methodName, 'queued events should be sent in the order recieved');
                }
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

            assert(nativeBridge._invokeList.length === expectedEvents.length, 'all queued events should be sent');
            for (const expected of expectedEvents) {
                const got: InvokeElement | undefined = nativeBridge._invokeList.shift();
                if (got !== undefined) {
                    assert(got.methodName === expected.methodName, 'queued events should be sent in the order recieved');
                }
            }
        });
    });
});
