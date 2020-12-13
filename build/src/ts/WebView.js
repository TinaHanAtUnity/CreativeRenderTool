import { Core } from 'Core/Core';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
export class WebView {
    constructor(nativeBridge) {
        if (window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(event), false);
        }
        this._core = new Core(nativeBridge);
    }
    initialize() {
        return this._core.initialize();
    }
    show(placementId, options, callback) {
        this._core.Ads.show(placementId, options, callback);
    }
    onError(event) {
        if (event.lineno && typeof event.lineno === 'number' && event.lineno > 1) {
            Diagnostics.trigger('js_error', {
                'message': event.message,
                'url': event.filename,
                'line': event.lineno,
                'column': event.colno,
                'object': event.error
            });
        }
        return true; // returning true from window.onerror will suppress the error (in theory)
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViVmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90cy9XZWJWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFakMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXpELE1BQU0sT0FBTyxPQUFPO0lBSWhCLFlBQVksWUFBMEI7UUFDbEMsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLGdCQUFnQixFQUFFO1lBQ25DLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDM0U7UUFFRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTSxVQUFVO1FBQ2IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFFTSxJQUFJLENBQUMsV0FBbUIsRUFBRSxPQUFnQixFQUFFLFFBQXlCO1FBQ3hFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFTyxPQUFPLENBQUMsS0FBaUI7UUFDN0IsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLE9BQU8sS0FBSyxDQUFDLE1BQU0sS0FBSyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDdEUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7Z0JBQzVCLFNBQVMsRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDeEIsS0FBSyxFQUFFLEtBQUssQ0FBQyxRQUFRO2dCQUNyQixNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU07Z0JBQ3BCLFFBQVEsRUFBRSxLQUFLLENBQUMsS0FBSztnQkFDckIsUUFBUSxFQUFFLEtBQUssQ0FBQyxLQUFLO2FBQ3hCLENBQUMsQ0FBQztTQUNOO1FBQ0QsT0FBTyxJQUFJLENBQUMsQ0FBQyx5RUFBeUU7SUFDMUYsQ0FBQztDQUVKIn0=