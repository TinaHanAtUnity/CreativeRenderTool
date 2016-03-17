import {Observable2} from "../../Utilities/Observable";
import {NativeBridge} from "../NativeBridge";

enum ConnectivityEvent {
    ON_CONNECTED,
    ON_DISCONNECTED,
    ON_NETWORK_CHANGE
}

export class Connectivity {

    public static onConnected: Observable2<boolean, string> = new Observable2();

    private static ApiClass = 'Connectivity';

    public static setListeningStatus(status: boolean): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(Connectivity.ApiClass, 'setConnectionMonitoring', [status]);
    }

    public static handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case ConnectivityEvent[ConnectivityEvent.ON_CONNECTED]:
                Connectivity.onConnected.trigger(parameters[0], parameters[1]);
                break;

            default:
                throw new Error('Connectivity event ' + event + ' does not have an observable');
        }
    }
}
