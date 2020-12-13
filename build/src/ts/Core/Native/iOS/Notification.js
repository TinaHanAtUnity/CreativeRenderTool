import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable2 } from 'Core/Utilities/Observable';
var NotificationEvent;
(function (NotificationEvent) {
    NotificationEvent[NotificationEvent["ACTION"] = 0] = "ACTION";
})(NotificationEvent || (NotificationEvent = {}));
export class NotificationApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Notification', ApiPackage.CORE, EventCategory.NOTIFICATION);
        this.onNotification = new Observable2();
    }
    addNotificationObserver(name, keys) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'addNotificationObserver', [name, keys]);
    }
    removeNotificationObserver(name) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'removeNotificationObserver', [name]);
    }
    removeAllNotificationObservers() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'removeAllNotificationObservers');
    }
    addAVNotificationObserver(name, keys) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'addAVNotificationObserver', [name, keys]);
    }
    removeAVNotificationObserver(name) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'removeAVNotificationObserver', [name]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case NotificationEvent[NotificationEvent.ACTION]:
                this.onNotification.trigger(parameters[0], parameters[1]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm90aWZpY2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL2lPUy9Ob3RpZmljYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELElBQUssaUJBRUo7QUFGRCxXQUFLLGlCQUFpQjtJQUNsQiw2REFBTSxDQUFBO0FBQ1YsQ0FBQyxFQUZJLGlCQUFpQixLQUFqQixpQkFBaUIsUUFFckI7QUFFRCxNQUFNLE9BQU8sZUFBZ0IsU0FBUSxTQUFTO0lBSTFDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxjQUFjLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7UUFIckUsbUJBQWMsR0FBRyxJQUFJLFdBQVcsRUFBbUIsQ0FBQztJQUlwRSxDQUFDO0lBRU0sdUJBQXVCLENBQUMsSUFBWSxFQUFFLElBQWM7UUFDdkQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUseUJBQXlCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RyxDQUFDO0lBRU0sMEJBQTBCLENBQUMsSUFBWTtRQUMxQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSw0QkFBNEIsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUVNLDhCQUE4QjtRQUNqQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO0lBQ3JHLENBQUM7SUFFTSx5QkFBeUIsQ0FBQyxJQUFZLEVBQUUsSUFBYztRQUN6RCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSwyQkFBMkIsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlHLENBQUM7SUFFTSw0QkFBNEIsQ0FBQyxJQUFZO1FBQzVDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLDhCQUE4QixFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRyxDQUFDO0lBRU0sV0FBVyxDQUFDLEtBQWEsRUFBRSxVQUFxQjtRQUNuRCxRQUFRLEtBQUssRUFBRTtZQUNYLEtBQUssaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsTUFBTSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xFLE1BQU07WUFFVjtnQkFDSSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7Q0FDSiJ9