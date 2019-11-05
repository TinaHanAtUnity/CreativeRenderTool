import { EventCategory } from 'Core/Constants/EventCategory';
import { NativeApi } from 'Core/Native/Bridge/NativeApi';

export interface INativeBridge {
    handleCallback(results: unknown[][]): void;
    handleEvent(parameters: unknown[]): void;
    handleInvocation(parameters: unknown[]): void;
    invoke<T>(className: string, methodName: string, parameters?: unknown[]): Promise<T>;
    addEventHandler(eventCategory: EventCategory, nativeApi: NativeApi): void;
}
