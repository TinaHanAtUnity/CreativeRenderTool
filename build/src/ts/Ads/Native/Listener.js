import { FinishState } from 'Core/Constants/FinishState';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable3 } from 'Core/Utilities/Observable';
export class ListenerApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Listener', ApiPackage.ADS);
        this.onPlacementStateChangedEventSent = new Observable3();
    }
    sendReadyEvent(placementId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendReadyEvent', [placementId]);
    }
    sendStartEvent(placementId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendStartEvent', [placementId]);
    }
    sendFinishEvent(placementId, result) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendFinishEvent', [placementId, FinishState[result]]);
    }
    sendClickEvent(placementId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendClickEvent', [placementId]);
    }
    sendPlacementStateChangedEvent(placementId, oldState, newState) {
        this.onPlacementStateChangedEventSent.trigger(placementId, oldState, newState);
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendPlacementStateChangedEvent', [placementId, oldState, newState]);
    }
    sendErrorEvent(error, message) {
        // Uses same codepath as Core/Native/Listener.sendErrorEvent
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendErrorEvent', [error, message]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL05hdGl2ZS9MaXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFeEQsTUFBTSxPQUFPLFdBQVksU0FBUSxTQUFTO0lBR3RDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxnQ0FBZ0MsR0FBRyxJQUFJLFdBQVcsRUFBMEIsQ0FBQztJQUN0RixDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQW1CO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNwRyxDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQW1CO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNwRyxDQUFDO0lBRU0sZUFBZSxDQUFDLFdBQW1CLEVBQUUsTUFBbUI7UUFDM0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxSCxDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQW1CO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUNwRyxDQUFDO0lBRU0sOEJBQThCLENBQUMsV0FBbUIsRUFBRSxRQUFnQixFQUFFLFFBQWdCO1FBQ3pGLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMvRSxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxnQ0FBZ0MsRUFBRSxDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN4SSxDQUFDO0lBRU0sY0FBYyxDQUFDLEtBQWEsRUFBRSxPQUFlO1FBQ2hELDREQUE0RDtRQUM1RCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7Q0FFSiJ9