import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable4 } from 'Core/Utilities/Observable';
var BroadcastEvent;
(function (BroadcastEvent) {
    BroadcastEvent[BroadcastEvent["ACTION"] = 0] = "ACTION";
})(BroadcastEvent || (BroadcastEvent = {}));
export class BroadcastApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Broadcast', ApiPackage.CORE, EventCategory.BROADCAST);
        this.onBroadcastAction = new Observable4();
    }
    addBroadcastListener(listenerName, actions) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'addBroadcastListener', [listenerName, actions]);
    }
    addDataSchemeBroadcastListener(listenerName, dataScheme, actions) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'addBroadcastListener', [listenerName, dataScheme, actions]);
    }
    removeBroadcastListener(listenerName) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'removeBroadcastListener', [listenerName]);
    }
    removeAllBroadcastListeners() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'removeAllBroadcastListeners', []);
    }
    handleEvent(event, parameters) {
        if (event === BroadcastEvent[BroadcastEvent.ACTION]) {
            this.onBroadcastAction.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
        }
        else {
            super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnJvYWRjYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL0FuZHJvaWQvQnJvYWRjYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxJQUFLLGNBRUo7QUFGRCxXQUFLLGNBQWM7SUFDZix1REFBTSxDQUFBO0FBQ1YsQ0FBQyxFQUZJLGNBQWMsS0FBZCxjQUFjLFFBRWxCO0FBRUQsTUFBTSxPQUFPLFlBQWEsU0FBUSxTQUFTO0lBSXZDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFIL0Qsc0JBQWlCLEdBQUcsSUFBSSxXQUFXLEVBQW1DLENBQUM7SUFJdkYsQ0FBQztJQUVNLG9CQUFvQixDQUFDLFlBQW9CLEVBQUUsT0FBaUI7UUFDL0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNwSCxDQUFDO0lBRU0sOEJBQThCLENBQUMsWUFBb0IsRUFBRSxVQUFrQixFQUFFLE9BQWlCO1FBQzdGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLHNCQUFzQixFQUFFLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2hJLENBQUM7SUFFTSx1QkFBdUIsQ0FBQyxZQUFvQjtRQUMvQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSx5QkFBeUIsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDOUcsQ0FBQztJQUVNLDJCQUEyQjtRQUM5QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSw2QkFBNkIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRU0sV0FBVyxDQUFDLEtBQWEsRUFBRSxVQUFxQjtRQUNuRCxJQUFJLEtBQUssS0FBSyxjQUFjLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ2pELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFVLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBVSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEg7YUFBTTtZQUNILEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQ3hDO0lBQ0wsQ0FBQztDQUNKIn0=