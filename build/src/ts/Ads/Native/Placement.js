import { PlacementState } from 'Ads/Models/Placement';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class PlacementApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Placement', ApiPackage.ADS);
    }
    setDefaultPlacement(placementId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setDefaultPlacement', [placementId]);
    }
    setDefaultBannerPlacement(placementId) {
        return this._nativeBridge.invoke(this._apiClass, 'setDefaultBannerPlacement', [placementId]);
    }
    setPlacementState(placementId, placementState) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setPlacementState', [placementId, PlacementState[placementState]]);
    }
    setPlacementAnalytics(sendAnalytics) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setPlacementAnalytics', [sendAnalytics]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhY2VtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9OYXRpdmUvUGxhY2VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBR3JFLE1BQU0sT0FBTyxZQUFhLFNBQVEsU0FBUztJQUV2QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRU0sbUJBQW1CLENBQUMsV0FBbUI7UUFDMUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ3pHLENBQUM7SUFFTSx5QkFBeUIsQ0FBQyxXQUFtQjtRQUNoRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxXQUFtQixFQUFFLGNBQThCO1FBQ3hFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLENBQUMsV0FBVyxFQUFFLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkksQ0FBQztJQUVNLHFCQUFxQixDQUFDLGFBQXNCO1FBQy9DLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUM3RyxDQUFDO0NBRUoifQ==