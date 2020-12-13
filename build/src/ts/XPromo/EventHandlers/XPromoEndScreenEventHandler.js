import { EndScreenEventHandler } from 'Ads/EventHandlers/EndScreenEventHandler';
export class XPromoEndScreenEventHandler extends EndScreenEventHandler {
    constructor(adUnit, parameters, storeHandler) {
        super(adUnit, parameters, storeHandler);
    }
    onKeyEvent(keyCode) {
        if (keyCode === 4 /* BACK */ && this._adUnit.isShowing() && !this._adUnit.canShowVideo()) {
            this._adUnit.hide();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vRW5kU2NyZWVuRXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1hQcm9tby9FdmVudEhhbmRsZXJzL1hQcm9tb0VuZFNjcmVlbkV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQU1oRixNQUFNLE9BQU8sMkJBQTRCLFNBQVEscUJBQW1EO0lBRWhHLFlBQVksTUFBb0IsRUFBRSxVQUFtQyxFQUFFLFlBQTBCO1FBQzdGLEtBQUssQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFTSxVQUFVLENBQUMsT0FBZTtRQUM3QixJQUFJLE9BQU8saUJBQWlCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDdEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUN2QjtJQUNMLENBQUM7Q0FDSiJ9