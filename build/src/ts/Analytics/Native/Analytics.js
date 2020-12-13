import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export var AnalyticsEvent;
(function (AnalyticsEvent) {
    AnalyticsEvent[AnalyticsEvent["POSTEVENT"] = 0] = "POSTEVENT";
})(AnalyticsEvent || (AnalyticsEvent = {}));
export class AnalyticsApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Analytics', ApiPackage.ANALYTICS, EventCategory.ANALYTICS);
    }
    addExtras(extras) {
        const jsonExtras = JSON.stringify(extras);
        return this._nativeBridge.invoke(this._fullApiClassName, 'addExtras', [jsonExtras]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case AnalyticsEvent[AnalyticsEvent.POSTEVENT]:
                // Do nothing with this information for now
                break;
            default:
                throw new Error(`AnalyticsApi no known event : "${event}"`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0FuYWx5dGljcy9OYXRpdmUvQW5hbHl0aWNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBR3JFLE1BQU0sQ0FBTixJQUFZLGNBRVg7QUFGRCxXQUFZLGNBQWM7SUFDdEIsNkRBQVMsQ0FBQTtBQUNiLENBQUMsRUFGVyxjQUFjLEtBQWQsY0FBYyxRQUV6QjtBQUVELE1BQU0sT0FBTyxZQUFhLFNBQVEsU0FBUztJQUV2QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFTSxTQUFTLENBQUMsTUFBZ0M7UUFDN0MsTUFBTSxVQUFVLEdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFTSxXQUFXLENBQUMsS0FBYSxFQUFFLFVBQXFCO1FBQ25ELFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxjQUFjLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQztnQkFDekMsMkNBQTJDO2dCQUMzQyxNQUFNO1lBRVY7Z0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsS0FBSyxHQUFHLENBQUMsQ0FBQztTQUNuRTtJQUNMLENBQUM7Q0FDSiJ9