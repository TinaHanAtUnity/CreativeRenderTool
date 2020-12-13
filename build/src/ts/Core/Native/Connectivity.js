import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable0, Observable2 } from 'Core/Utilities/Observable';
var ConnectivityEvent;
(function (ConnectivityEvent) {
    ConnectivityEvent[ConnectivityEvent["CONNECTED"] = 0] = "CONNECTED";
    ConnectivityEvent[ConnectivityEvent["DISCONNECTED"] = 1] = "DISCONNECTED";
    ConnectivityEvent[ConnectivityEvent["NETWORK_CHANGE"] = 2] = "NETWORK_CHANGE";
})(ConnectivityEvent || (ConnectivityEvent = {}));
export class ConnectivityApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Connectivity', ApiPackage.CORE, EventCategory.CONNECTIVITY);
        this.onConnected = new Observable2();
        this.onDisconnected = new Observable0();
    }
    setListeningStatus(status) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setConnectionMonitoring', [status]);
    }
    handleEvent(event, parameters) {
        switch (event) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdGl2aXR5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL0Nvbm5lY3Rpdml0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXJFLElBQUssaUJBSUo7QUFKRCxXQUFLLGlCQUFpQjtJQUNsQixtRUFBUyxDQUFBO0lBQ1QseUVBQVksQ0FBQTtJQUNaLDZFQUFjLENBQUE7QUFDbEIsQ0FBQyxFQUpJLGlCQUFpQixLQUFqQixpQkFBaUIsUUFJckI7QUFFRCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxTQUFTO0lBSzFDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxjQUFjLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFKckUsZ0JBQVcsR0FBRyxJQUFJLFdBQVcsRUFBbUIsQ0FBQztRQUNqRCxtQkFBYyxHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7SUFJbkQsQ0FBQztJQUVNLGtCQUFrQixDQUFDLE1BQWU7UUFDckMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUseUJBQXlCLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLENBQUM7SUFFTSxXQUFXLENBQUMsS0FBYSxFQUFFLFVBQXFCO1FBQ25ELFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFVLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBVSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEUsTUFBTTtZQUVWLEtBQUssaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDO2dCQUNsRCxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM5QixNQUFNO1lBRVYsS0FBSyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUM7Z0JBQ3BELHVDQUF1QztnQkFDdkMsTUFBTTtZQUVWO2dCQUNJLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztDQUNKIn0=