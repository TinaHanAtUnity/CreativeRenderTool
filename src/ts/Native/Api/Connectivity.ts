import { Observable0, Observable2 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Native/NativeApi';

enum ConnectivityEvent {
    CONNECTED,
    DISCONNECTED,
    NETWORK_CHANGE
}

export class ConnectivityApi extends NativeApi {

    public readonly onConnected = new Observable2<boolean, number>();
    public readonly onDisconnected = new Observable0();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Connectivity', ApiPackage.CORE);
    }

    public setListeningStatus(status: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setConnectionMonitoring', [status]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case ConnectivityEvent[ConnectivityEvent.CONNECTED]:
                this.onConnected.trigger(parameters[0], parameters[1]);
                break;

            case ConnectivityEvent[ConnectivityEvent.DISCONNECTED]:
                this.onDisconnected.trigger();
                break;

            case ConnectivityEvent[ConnectivityEvent.NETWORK_CHANGE]:
                // cleanly ignore network change events
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
