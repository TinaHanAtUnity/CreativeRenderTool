import { EventCategory } from 'Core/Constants/EventCategory';
import { FinishState } from 'Core/Constants/FinishState';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable2 } from 'Core/Utilities/Observable';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
export var IPlacementContentType;
(function (IPlacementContentType) {
    IPlacementContentType[IPlacementContentType["SHOW_AD"] = 0] = "SHOW_AD";
    IPlacementContentType[IPlacementContentType["PROMO_AD"] = 1] = "PROMO_AD";
    IPlacementContentType[IPlacementContentType["CUSTOM"] = 2] = "CUSTOM";
    IPlacementContentType[IPlacementContentType["NO_FILL"] = 3] = "NO_FILL";
})(IPlacementContentType || (IPlacementContentType = {}));
export var PlacementContentEvent;
(function (PlacementContentEvent) {
    PlacementContentEvent[PlacementContentEvent["CUSTOM"] = 0] = "CUSTOM";
})(PlacementContentEvent || (PlacementContentEvent = {}));
export class PlacementContentsApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'PlacementContents', ApiPackage.MONETIZATION_CORE, EventCategory.PLACEMENT_CONTENT);
        this.onPlacementContentCustomEvent = new Observable2();
    }
    createPlacementContent(placementId, params) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'createPlacementContent', [placementId, Object.assign({}, params, { 
                // necessary to coerce to string
                type: IPlacementContentType[params.type] })]);
    }
    setPlacementContentState(placementId, state) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setPlacementContentState', [placementId, PlacementContentState[state]]);
    }
    sendAdFinished(placementId, finishState) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendAdFinished', [placementId, FinishState[finishState]]);
    }
    sendAdStarted(placementId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendAdStarted', [placementId]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case PlacementContentEvent[PlacementContentEvent.CUSTOM]:
                this.onPlacementContentCustomEvent.trigger(parameters[0], parameters[1]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhY2VtZW50Q29udGVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTW9uZXRpemF0aW9uL05hdGl2ZS9QbGFjZW1lbnRDb250ZW50cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBR3JGLE1BQU0sQ0FBTixJQUFZLHFCQUtYO0FBTEQsV0FBWSxxQkFBcUI7SUFDN0IsdUVBQU8sQ0FBQTtJQUNQLHlFQUFRLENBQUE7SUFDUixxRUFBTSxDQUFBO0lBQ04sdUVBQU8sQ0FBQTtBQUNYLENBQUMsRUFMVyxxQkFBcUIsS0FBckIscUJBQXFCLFFBS2hDO0FBRUQsTUFBTSxDQUFOLElBQVkscUJBRVg7QUFGRCxXQUFZLHFCQUFxQjtJQUM3QixxRUFBTSxDQUFBO0FBQ1YsQ0FBQyxFQUZXLHFCQUFxQixLQUFyQixxQkFBcUIsUUFFaEM7QUFFRCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsU0FBUztJQUcvQyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBSDVGLGtDQUE2QixHQUFHLElBQUksV0FBVyxFQUE0QixDQUFDO0lBSTVGLENBQUM7SUFFTSxzQkFBc0IsQ0FBQyxXQUFtQixFQUFFLE1BQStCO1FBQzlFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLHdCQUF3QixFQUFFLENBQUMsV0FBVyxvQkFDdkYsTUFBTTtnQkFDVixnQ0FBZ0M7Z0JBQ2hDLElBQUksRUFBRSxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQzFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFTSx3QkFBd0IsQ0FBQyxXQUFtQixFQUFFLEtBQTRCO1FBQzdFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLDBCQUEwQixFQUFFLENBQUMsV0FBVyxFQUFFLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0SSxDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQW1CLEVBQUUsV0FBd0I7UUFDL0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN4SCxDQUFDO0lBQ00sYUFBYSxDQUFDLFdBQW1CO1FBQ3BDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsVUFBcUI7UUFDbkQsUUFBUSxLQUFLLEVBQUU7WUFDZixLQUFLLHFCQUFxQixDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQztnQkFDcEQsSUFBSSxDQUFDLDZCQUE2QixDQUFDLE9BQU8sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQW9CLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuRyxNQUFNO1lBQ1Y7Z0JBQ0ksS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDeEM7SUFDTCxDQUFDO0NBQ0oifQ==