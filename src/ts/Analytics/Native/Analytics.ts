import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1 } from 'Core/Utilities/Observable';
import { AnalyticsGenericEvent } from 'Analytics/AnalyticsProtocol';

export enum AnalyticsEvent {
    POSTEVENT
}

export class AnalyticsApi extends NativeApi {

    public onPostEvent: Observable1<AnalyticsGenericEvent[]> = new Observable1();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Analytics', ApiPackage.ANALYTICS, EventCategory.ANALYTICS);
    }

    public addExtras(extras: {[key: string]: unknown}): Promise<void> {
        const jsonExtras: string = JSON.stringify(extras);
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'addExtras', [jsonExtras]);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch(event) {
            case AnalyticsEvent[AnalyticsEvent.POSTEVENT]:
                this.onPostEvent.trigger(JSON.parse(parameters[0]));
                break;

            default:
                throw new Error(`AnalyticsApi no known event : "${event}"`);
        }
    }
}
