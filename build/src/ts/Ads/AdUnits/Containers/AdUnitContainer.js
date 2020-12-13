export var Orientation;
(function (Orientation) {
    Orientation[Orientation["NONE"] = 0] = "NONE";
    Orientation[Orientation["PORTRAIT"] = 1] = "PORTRAIT";
    Orientation[Orientation["LANDSCAPE"] = 2] = "LANDSCAPE";
})(Orientation || (Orientation = {}));
export var AdUnitContainerSystemMessage;
(function (AdUnitContainerSystemMessage) {
    AdUnitContainerSystemMessage[AdUnitContainerSystemMessage["MEMORY_WARNING"] = 0] = "MEMORY_WARNING";
    AdUnitContainerSystemMessage[AdUnitContainerSystemMessage["AUDIO_SESSION_INTERRUPT_BEGAN"] = 1] = "AUDIO_SESSION_INTERRUPT_BEGAN";
    AdUnitContainerSystemMessage[AdUnitContainerSystemMessage["AUDIO_SESSION_INTERRUPT_ENDED"] = 2] = "AUDIO_SESSION_INTERRUPT_ENDED";
    AdUnitContainerSystemMessage[AdUnitContainerSystemMessage["AUDIO_SESSION_ROUTE_CHANGED"] = 3] = "AUDIO_SESSION_ROUTE_CHANGED";
    AdUnitContainerSystemMessage[AdUnitContainerSystemMessage["AUDIO_SESSION_CATEGORY_CHANGED"] = 4] = "AUDIO_SESSION_CATEGORY_CHANGED";
})(AdUnitContainerSystemMessage || (AdUnitContainerSystemMessage = {}));
export class AdUnitContainer {
    constructor() {
        this._handlers = [];
        this._paused = false;
    }
    static setForcedOrientation(orientation) {
        AdUnitContainer._forcedOrientation = orientation;
    }
    static getForcedOrientation() {
        return AdUnitContainer._forcedOrientation;
    }
    getLockedOrientation() {
        return this._lockedOrientation;
    }
    addEventHandler(handler) {
        this._handlers.push(handler);
        return handler;
    }
    removeEventHandler(handler) {
        if (this._handlers.length) {
            if (typeof handler !== 'undefined') {
                this._handlers = this._handlers.filter(storedHandler => storedHandler !== handler);
            }
            else {
                this._handlers = [];
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0Q29udGFpbmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9BZFVuaXRzL0NvbnRhaW5lcnMvQWRVbml0Q29udGFpbmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBTixJQUFZLFdBSVg7QUFKRCxXQUFZLFdBQVc7SUFDbkIsNkNBQUksQ0FBQTtJQUNKLHFEQUFRLENBQUE7SUFDUix1REFBUyxDQUFBO0FBQ2IsQ0FBQyxFQUpXLFdBQVcsS0FBWCxXQUFXLFFBSXRCO0FBUUQsTUFBTSxDQUFOLElBQVksNEJBTVg7QUFORCxXQUFZLDRCQUE0QjtJQUNwQyxtR0FBYyxDQUFBO0lBQ2QsaUlBQTZCLENBQUE7SUFDN0IsaUlBQTZCLENBQUE7SUFDN0IsNkhBQTJCLENBQUE7SUFDM0IsbUlBQThCLENBQUE7QUFDbEMsQ0FBQyxFQU5XLDRCQUE0QixLQUE1Qiw0QkFBNEIsUUFNdkM7QUFjRCxNQUFNLE9BQWdCLGVBQWU7SUFBckM7UUFhYyxjQUFTLEdBQStCLEVBQUUsQ0FBQztRQUMzQyxZQUFPLEdBQUcsS0FBSyxDQUFDO0lBNEI5QixDQUFDO0lBeENVLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxXQUF3QjtRQUN2RCxlQUFlLENBQUMsa0JBQWtCLEdBQUcsV0FBVyxDQUFDO0lBQ3JELENBQUM7SUFFTSxNQUFNLENBQUMsb0JBQW9CO1FBQzlCLE9BQU8sZUFBZSxDQUFDLGtCQUFrQixDQUFDO0lBQzlDLENBQUM7SUFnQk0sb0JBQW9CO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO0lBQ25DLENBQUM7SUFFTSxlQUFlLENBQUMsT0FBaUM7UUFDcEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVNLGtCQUFrQixDQUFDLE9BQWlDO1FBQ3ZELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDdkIsSUFBSSxPQUFPLE9BQU8sS0FBSyxXQUFXLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEtBQUssT0FBTyxDQUFDLENBQUM7YUFDdEY7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDdkI7U0FDSjtJQUNMLENBQUM7Q0FDSiJ9