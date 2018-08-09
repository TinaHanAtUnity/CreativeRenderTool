import { NativeBridge } from 'Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { Observable2 } from 'Utilities/Observable';

enum NotificationEvent {
    ACTION
}

export class NotificationApi extends NativeApi {

    public readonly onNotification = new Observable2<string, any>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Notification', ApiPackage.CORE);
    }

    public addNotificationObserver(name: string, keys: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'addNotificationObserver', [name, keys]);
    }

    public removeNotificationObserver(name: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeNotificationObserver', [name]);
    }

    public removeAllNotificationObservers(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeAllNotificationObservers');
    }

    public addAVNotificationObserver(name: string, keys: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'addAVNotificationObserver', [name, keys]);
    }

    public removeAVNotificationObserver(name: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeAVNotificationObserver', [name]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case NotificationEvent[NotificationEvent.ACTION]:
                this.onNotification.trigger(parameters[0], parameters[1]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
