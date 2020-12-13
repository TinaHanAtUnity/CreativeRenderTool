import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
export class MonetizationListenerApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'MonetizationListener', ApiPackage.MONETIZATION_CORE);
    }
    isMonetizationEnabled() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isMonetizationEnabled');
    }
    sendPlacementContentReady(placementId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendPlacementContentReady', [placementId]);
    }
    sendPlacementContentStateChanged(placementId, previousState, newState) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendPlacementContentStateChanged', [placementId, PlacementContentState[previousState], PlacementContentState[newState]]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZXRpemF0aW9uTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTW9uZXRpemF0aW9uL05hdGl2ZS9Nb25ldGl6YXRpb25MaXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBRXJGLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxTQUFTO0lBQ2xELFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxzQkFBc0IsRUFBRSxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUM5RSxDQUFDO0lBRU0scUJBQXFCO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQVUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLHVCQUF1QixDQUFDLENBQUM7SUFDL0YsQ0FBQztJQUVNLHlCQUF5QixDQUFDLFdBQW1CO1FBQ2hELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLDJCQUEyQixFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUN6RyxDQUFDO0lBRU0sZ0NBQWdDLENBQUMsV0FBbUIsRUFBRSxhQUFvQyxFQUFFLFFBQStCO1FBQzlILE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGtDQUFrQyxFQUFFLENBQUMsV0FBVyxFQUFFLHFCQUFxQixDQUFDLGFBQWEsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2TCxDQUFDO0NBQ0oifQ==