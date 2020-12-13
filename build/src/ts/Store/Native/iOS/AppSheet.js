import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
export var AppSheetEvent;
(function (AppSheetEvent) {
    AppSheetEvent[AppSheetEvent["PREPARED"] = 0] = "PREPARED";
    AppSheetEvent[AppSheetEvent["OPENED"] = 1] = "OPENED";
    AppSheetEvent[AppSheetEvent["CLOSED"] = 2] = "CLOSED";
    AppSheetEvent[AppSheetEvent["FAILED"] = 3] = "FAILED";
})(AppSheetEvent || (AppSheetEvent = {}));
export class AppSheetApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'AppSheet', ApiPackage.STORE, EventCategory.APPSHEET);
        this.onPrepared = new Observable1();
        this.onOpen = new Observable1();
        this.onClose = new Observable1();
        this.onError = new Observable2();
    }
    canOpen() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'canOpen');
    }
    prepare(options, timeout = 30000) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'prepare', [options, timeout]);
    }
    present(options, animated = true) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'present', [options, animated]);
    }
    destroy(options) {
        if (typeof options === 'undefined') {
            return this._nativeBridge.invoke(this._fullApiClassName, 'destroy');
        }
        return this._nativeBridge.invoke(this._fullApiClassName, 'destroy', [options]);
    }
    setPrepareTimeout(timeout) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setPrepareTimeout', [timeout]);
    }
    getPrepareTimeout() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getPrepareTimeout');
    }
    handleEvent(event, parameters) {
        switch (event) {
            case AppSheetEvent[AppSheetEvent.PREPARED]:
                this.onPrepared.trigger(parameters[0]);
                break;
            case AppSheetEvent[AppSheetEvent.OPENED]:
                this.onOpen.trigger(parameters[0]);
                break;
            case AppSheetEvent[AppSheetEvent.CLOSED]:
                this.onClose.trigger(parameters[0]);
                break;
            case AppSheetEvent[AppSheetEvent.FAILED]:
                this.onError.trigger(parameters[0], parameters[1]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwU2hlZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvU3RvcmUvTmF0aXZlL2lPUy9BcHBTaGVldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBNENyRSxNQUFNLENBQU4sSUFBWSxhQUtYO0FBTEQsV0FBWSxhQUFhO0lBQ3JCLHlEQUFRLENBQUE7SUFDUixxREFBTSxDQUFBO0lBQ04scURBQU0sQ0FBQTtJQUNOLHFEQUFNLENBQUE7QUFDVixDQUFDLEVBTFcsYUFBYSxLQUFiLGFBQWEsUUFLeEI7QUFFRCxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFPdEMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQU45RCxlQUFVLEdBQUcsSUFBSSxXQUFXLEVBQW9CLENBQUM7UUFDakQsV0FBTSxHQUFHLElBQUksV0FBVyxFQUFvQixDQUFDO1FBQzdDLFlBQU8sR0FBRyxJQUFJLFdBQVcsRUFBb0IsQ0FBQztRQUM5QyxZQUFPLEdBQUcsSUFBSSxXQUFXLEVBQTRCLENBQUM7SUFJdEUsQ0FBQztJQUVNLE9BQU87UUFDVixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFVLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQXlCLEVBQUUsVUFBa0IsS0FBSztRQUM3RCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQXlCLEVBQUUsV0FBb0IsSUFBSTtRQUM5RCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUNuRyxDQUFDO0lBRU0sT0FBTyxDQUFDLE9BQTBCO1FBQ3JDLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQzdFO1FBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRU0saUJBQWlCLENBQUMsT0FBZTtRQUNwQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDbkcsQ0FBQztJQUVNLGlCQUFpQjtRQUNwQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFTLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFFTSxXQUFXLENBQUMsS0FBYSxFQUFFLFVBQXFCO1FBQ25ELFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxhQUFhLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQW1CLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxNQUFNO1lBRVYsS0FBSyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQW1CLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRCxNQUFNO1lBRVYsS0FBSyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQW1CLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNO1lBRVYsS0FBSyxhQUFhLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztnQkFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFvQixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0UsTUFBTTtZQUVWO2dCQUNJLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztDQUVKIn0=