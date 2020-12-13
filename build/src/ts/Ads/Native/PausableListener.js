import { ListenerApi } from 'Ads/Native/Listener';
export class PausableListenerApi extends ListenerApi {
    constructor(nativeBridge) {
        super(nativeBridge);
        this._paused = false;
        this._eventQueue = [];
    }
    sendReadyEvent(placementId) {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendReadyEvent(placementId);
            });
            return Promise.resolve();
        }
        return super.sendReadyEvent(placementId);
    }
    sendStartEvent(placementId) {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendStartEvent(placementId);
            });
            return Promise.resolve();
        }
        return super.sendStartEvent(placementId);
    }
    sendFinishEvent(placementId, result) {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendFinishEvent(placementId, result);
            });
            return Promise.resolve();
        }
        return super.sendFinishEvent(placementId, result);
    }
    sendClickEvent(placementId) {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendClickEvent(placementId);
            });
            return Promise.resolve();
        }
        return super.sendClickEvent(placementId);
    }
    sendPlacementStateChangedEvent(placementId, oldState, newState) {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendPlacementStateChangedEvent(placementId, oldState, newState);
            });
            return Promise.resolve();
        }
        return super.sendPlacementStateChangedEvent(placementId, oldState, newState);
    }
    sendErrorEvent(error, message) {
        if (this._paused) {
            this._eventQueue.push(() => {
                return super.sendErrorEvent(error, message);
            });
            return Promise.resolve();
        }
        return super.sendErrorEvent(error, message);
    }
    pauseEvents() {
        this._paused = true;
    }
    resumeEvents() {
        this._eventQueue.forEach((f) => {
            f();
        });
        this._eventQueue = [];
        this._paused = false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF1c2FibGVMaXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTmF0aXZlL1BhdXNhYmxlTGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBS2xELE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxXQUFXO0lBRWhELFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBR2hCLFlBQU8sR0FBWSxLQUFLLENBQUM7UUFDekIsZ0JBQVcsR0FBZ0IsRUFBRSxDQUFDO0lBSHRDLENBQUM7SUFLTSxjQUFjLENBQUMsV0FBbUI7UUFDckMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUN2QixPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDN0MsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtRQUNELE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQW1CO1FBQ3JDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDdkIsT0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDNUI7UUFDRCxPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLGVBQWUsQ0FBQyxXQUFtQixFQUFFLE1BQW1CO1FBQzNELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDdkIsT0FBTyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQW1CO1FBQ3JDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDdkIsT0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDNUI7UUFDRCxPQUFPLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDN0MsQ0FBQztJQUVNLDhCQUE4QixDQUFDLFdBQW1CLEVBQUUsUUFBZ0IsRUFBRSxRQUFnQjtRQUN6RixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZCLE9BQU8sS0FBSyxDQUFDLDhCQUE4QixDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDakYsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtRQUNELE9BQU8sS0FBSyxDQUFDLDhCQUE4QixDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVNLGNBQWMsQ0FBQyxLQUFhLEVBQUUsT0FBZTtRQUNoRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZCLE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtRQUNELE9BQU8sS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVNLFdBQVc7UUFDZCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0lBRU0sWUFBWTtRQUNmLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsQ0FBQyxFQUFFLENBQUM7UUFDUixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLENBQUM7Q0FDSiJ9