import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable3, Observable4 } from 'Core/Utilities/Observable';
export var ResolveEvent;
(function (ResolveEvent) {
    ResolveEvent[ResolveEvent["COMPLETE"] = 0] = "COMPLETE";
    ResolveEvent[ResolveEvent["FAILED"] = 1] = "FAILED";
})(ResolveEvent || (ResolveEvent = {}));
export class ResolveApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Resolve', ApiPackage.CORE, EventCategory.RESOLVE);
        this.onComplete = new Observable3();
        this.onFailed = new Observable4();
    }
    resolve(id, host) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'resolve', [id, host]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case ResolveEvent[ResolveEvent.COMPLETE]:
                this.onComplete.trigger(parameters[0], parameters[1], parameters[2]);
                break;
            case ResolveEvent[ResolveEvent.FAILED]:
                this.onFailed.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVzb2x2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9SZXNvbHZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFckUsTUFBTSxDQUFOLElBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUNwQix1REFBUSxDQUFBO0lBQ1IsbURBQU0sQ0FBQTtBQUNWLENBQUMsRUFIVyxZQUFZLEtBQVosWUFBWSxRQUd2QjtBQUVELE1BQU0sT0FBTyxVQUFXLFNBQVEsU0FBUztJQUtyQyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBSjNELGVBQVUsR0FBRyxJQUFJLFdBQVcsRUFBMkIsQ0FBQztRQUN4RCxhQUFRLEdBQUcsSUFBSSxXQUFXLEVBQWtDLENBQUM7SUFJN0UsQ0FBQztJQUVNLE9BQU8sQ0FBQyxFQUFVLEVBQUUsSUFBWTtRQUNuQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFTLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBRU0sV0FBVyxDQUFDLEtBQWEsRUFBRSxVQUFxQjtRQUNuRCxRQUFRLEtBQUssRUFBRTtZQUNYLEtBQUssWUFBWSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7Z0JBQ3BDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFTLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBVSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQVUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdGLE1BQU07WUFFVixLQUFLLFlBQVksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQVUsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFVLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBVSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEgsTUFBTTtZQUVWO2dCQUNJLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztDQUVKIn0=