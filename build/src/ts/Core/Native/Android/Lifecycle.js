import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable1 } from 'Core/Utilities/Observable';
export var LifecycleError;
(function (LifecycleError) {
    LifecycleError[LifecycleError["APPLICATION_NULL"] = 0] = "APPLICATION_NULL";
    LifecycleError[LifecycleError["LISTENER_NOT_NULL"] = 1] = "LISTENER_NOT_NULL";
    LifecycleError[LifecycleError["JSON_ERROR"] = 2] = "JSON_ERROR";
})(LifecycleError || (LifecycleError = {}));
export var LifecycleEvent;
(function (LifecycleEvent) {
    LifecycleEvent[LifecycleEvent["CREATED"] = 0] = "CREATED";
    LifecycleEvent[LifecycleEvent["STARTED"] = 1] = "STARTED";
    LifecycleEvent[LifecycleEvent["RESUMED"] = 2] = "RESUMED";
    LifecycleEvent[LifecycleEvent["PAUSED"] = 3] = "PAUSED";
    LifecycleEvent[LifecycleEvent["STOPPED"] = 4] = "STOPPED";
    LifecycleEvent[LifecycleEvent["SAVE_INSTANCE_STATE"] = 5] = "SAVE_INSTANCE_STATE";
    LifecycleEvent[LifecycleEvent["DESTROYED"] = 6] = "DESTROYED";
})(LifecycleEvent || (LifecycleEvent = {}));
export class LifecycleApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Lifecycle', ApiPackage.CORE, EventCategory.LIFECYCLE);
        this.onActivityCreated = new Observable1();
        this.onActivityStarted = new Observable1();
        this.onActivityResumed = new Observable1();
        this.onActivityPaused = new Observable1();
        this.onActivityStopped = new Observable1();
        this.onActivitySaveInstanceState = new Observable1();
        this.onActivityDestroyed = new Observable1();
    }
    register(events) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'register', [events]);
    }
    unregister() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'unregister');
    }
    handleEvent(event, parameters) {
        switch (event) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL0FuZHJvaWQvTGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxNQUFNLENBQU4sSUFBWSxjQUlYO0FBSkQsV0FBWSxjQUFjO0lBQ3RCLDJFQUFnQixDQUFBO0lBQ2hCLDZFQUFpQixDQUFBO0lBQ2pCLCtEQUFVLENBQUE7QUFDZCxDQUFDLEVBSlcsY0FBYyxLQUFkLGNBQWMsUUFJekI7QUFFRCxNQUFNLENBQU4sSUFBWSxjQVFYO0FBUkQsV0FBWSxjQUFjO0lBQ3RCLHlEQUFPLENBQUE7SUFDUCx5REFBTyxDQUFBO0lBQ1AseURBQU8sQ0FBQTtJQUNQLHVEQUFNLENBQUE7SUFDTix5REFBTyxDQUFBO0lBQ1AsaUZBQW1CLENBQUE7SUFDbkIsNkRBQVMsQ0FBQTtBQUNiLENBQUMsRUFSVyxjQUFjLEtBQWQsY0FBYyxRQVF6QjtBQUVELE1BQU0sT0FBTyxZQUFhLFNBQVEsU0FBUztJQVV2QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBVC9ELHNCQUFpQixHQUFHLElBQUksV0FBVyxFQUFVLENBQUM7UUFDOUMsc0JBQWlCLEdBQUcsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUM5QyxzQkFBaUIsR0FBRyxJQUFJLFdBQVcsRUFBVSxDQUFDO1FBQzlDLHFCQUFnQixHQUFHLElBQUksV0FBVyxFQUFVLENBQUM7UUFDN0Msc0JBQWlCLEdBQUcsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUM5QyxnQ0FBMkIsR0FBRyxJQUFJLFdBQVcsRUFBVSxDQUFDO1FBQ3hELHdCQUFtQixHQUFHLElBQUksV0FBVyxFQUFVLENBQUM7SUFJaEUsQ0FBQztJQUVNLFFBQVEsQ0FBQyxNQUFnQjtRQUM1QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFTSxVQUFVO1FBQ2IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsVUFBcUI7UUFDbkQsUUFBUSxLQUFLLEVBQUU7WUFDWCxLQUFLLGNBQWMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO2dCQUN2QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFTLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNO1lBRVYsS0FBSyxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEQsTUFBTTtZQUVWLEtBQUssY0FBYyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7Z0JBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELE1BQU07WUFFVixLQUFLLGNBQWMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUN0QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFTLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxNQUFNO1lBRVYsS0FBSyxjQUFjLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQztnQkFDdkMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEQsTUFBTTtZQUVWLEtBQUssY0FBYyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDbkQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEUsTUFBTTtZQUVWLEtBQUssY0FBYyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hELE1BQU07WUFFVjtnQkFDSSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7Q0FDSiJ9