import { Observable2 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

enum ConnectivityEvent {
    CONNECTED,
    DISCONNECTED,
    NETWORK_CHANGE
}

export class ConnectivityApi {

    public static onConnected: Observable2<boolean, string> = new Observable2();

    private static ApiClass = 'Connectivity';

    public static setListeningStatus(status: boolean): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(ConnectivityApi.ApiClass, 'setConnectionMonitoring', [status]);
    }

    public static handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case ConnectivityEvent[ConnectivityEvent.CONNECTED]:
                ConnectivityApi.onConnected.trigger(parameters[0], parameters[1]);
                break;

            default:
                throw new Error('Connectivity event ' + event + ' does not have an observable');
        }
    }
}
