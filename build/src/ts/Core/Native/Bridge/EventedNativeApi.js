import { NativeApi } from 'Core/Native/Bridge/NativeApi';
export class EventedNativeApi extends NativeApi {
    constructor(nativeBridge, apiClass, apiPackage, eventCategory) {
        super(nativeBridge, apiClass, apiPackage, eventCategory);
        this._handlers = [];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRlZE5hdGl2ZUFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9CcmlkZ2UvRXZlbnRlZE5hdGl2ZUFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWMsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHckUsTUFBTSxPQUFnQixnQkFBbUMsU0FBUSxTQUFTO0lBSXRFLFlBQXNCLFlBQTBCLEVBQUUsUUFBZ0IsRUFBRSxVQUFzQixFQUFFLGFBQTZCO1FBQ3JILEtBQUssQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUhuRCxjQUFTLEdBQVEsRUFBRSxDQUFDO0lBSTlCLENBQUM7SUFFTSxlQUFlLENBQUMsT0FBVTtRQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM3QixPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sa0JBQWtCLENBQUMsT0FBVTtRQUNoQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO1lBQ3ZCLElBQUksT0FBTyxPQUFPLEtBQUssV0FBVyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsYUFBYSxLQUFLLE9BQU8sQ0FBQyxDQUFDO2FBQ3RGO2lCQUFNO2dCQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO2FBQ3ZCO1NBQ0o7SUFDTCxDQUFDO0NBRUoifQ==