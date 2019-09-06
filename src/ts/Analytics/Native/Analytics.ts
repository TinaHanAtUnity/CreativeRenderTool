import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export enum AnalyticsEvent {
    POSTEVENT
}

export class AnalyticsApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Analytics', ApiPackage.ANALYTICS, EventCategory.ANALYTICS);
    }

    public addExtras(extras: {[key: string]: unknown}): Promise<void> {
        const jsonExtras: string = JSON.stringify(extras);
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'addExtras', [jsonExtras]);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch (event) {
            case AnalyticsEvent[AnalyticsEvent.POSTEVENT]:
                // Do nothing with this information for now
                break;

            default:
                throw new Error(`AnalyticsApi no known event : "${event}"`);
        }
    }
}
