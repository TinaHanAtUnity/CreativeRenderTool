import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { Observable1 } from 'Core/Utilities/Observable';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export enum AnalyticsEvent {
    POSTEVENT
}

export class AnalyticsApi extends NativeApi {

    public onPostEvent: Observable1<any[]> = new Observable1();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Analytics', ApiPackage.ANALYTICS);
    }

    public addExtras(extras: {[key: string]: any}): Promise<void> {
        const jsonExtras: string = JSON.stringify(extras);
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'addExtras', [jsonExtras]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case AnalyticsEvent[AnalyticsEvent.POSTEVENT]:
                this.onPostEvent.trigger(JSON.parse(parameters[0]));
                break;

            default:
                this._nativeBridge.Sdk.logError(`AnaltyicsApi no known event : "${event}"`);
        }
    }
}
