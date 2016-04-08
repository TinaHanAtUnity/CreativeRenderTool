import { Observable2 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

enum ConnectivityEvent {
    CONNECTED,
    DISCONNECTED,
    NETWORK_CHANGE
}

export class ConnectivityApi extends NativeApi {

    public onConnected: Observable2<boolean, string> = new Observable2();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Connectivity');
    }

    public setListeningStatus(status: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setConnectionMonitoring', [status]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case ConnectivityEvent[ConnectivityEvent.CONNECTED]:
                this.onConnected.trigger(parameters[0], parameters[1]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
