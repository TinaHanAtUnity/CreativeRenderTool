import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1 } from 'Core/Utilities/Observable';

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

    public readonly onActivityCreated = new Observable1<string>();
    public readonly onActivityStarted = new Observable1<string>();
    public readonly onActivityResumed = new Observable1<string>();
    public readonly onActivityPaused = new Observable1<string>();
    public readonly onActivityStopped = new Observable1<string>();
    public readonly onActivitySaveInstanceState = new Observable1<string>();
    public readonly onActivityDestroyed = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Lifecycle', ApiPackage.CORE);
    }

    public register(events: string[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'register', [events]);
    }

    public unregister(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'unregister');
    }

    public handleEvent(event: string, parameters: unknown[]): void {
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
