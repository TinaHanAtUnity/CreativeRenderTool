import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Observable1 } from 'Utilities/Observable';

export enum LifecycleError {
    APPLICATION_NULL,
    LISTENER_NOT_NULL,
    JSON_ERROR
}

export enum LifecycleEvent {
    CREATED,
    STARTED,
    RESUMED,
    PAUSED,
    STOPPED,
    SAVE_INSTANCE_STATE,
    DESTROYED
}

export class LifecycleApi extends NativeApi {
    public onActivityCreated: Observable1<string> = new Observable1<string>();
    public onActivityStarted: Observable1<string> = new Observable1<string>();
    public onActivityResumed: Observable1<string> = new Observable1<string>();
    public onActivityPaused: Observable1<string> = new Observable1<string>();
    public onActivityStopped: Observable1<string> = new Observable1<string>();
    public onActivitySaveInstanceState: Observable1<string> = new Observable1<string>();
    public onActivityDestroyed: Observable1<string> = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Lifecycle');
    }

    public register(events: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'register', [events]);
    }

    public unregister(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'unregister');
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case LifecycleEvent[LifecycleEvent.CREATED]:
                this.onActivityCreated.trigger(parameters[0]);
                break;

            case LifecycleEvent[LifecycleEvent.STARTED]:
                this.onActivityStarted.trigger(parameters[0]);
                break;

            case LifecycleEvent[LifecycleEvent.RESUMED]:
                this.onActivityResumed.trigger(parameters[0]);
                break;

            case LifecycleEvent[LifecycleEvent.PAUSED]:
                this.onActivityPaused.trigger(parameters[0]);
                break;

            case LifecycleEvent[LifecycleEvent.STOPPED]:
                this.onActivityStopped.trigger(parameters[0]);
                break;

            case LifecycleEvent[LifecycleEvent.SAVE_INSTANCE_STATE]:
                this.onActivitySaveInstanceState.trigger(parameters[0]);
                break;

            case LifecycleEvent[LifecycleEvent.DESTROYED]:
                this.onActivityDestroyed.trigger(parameters[0]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
