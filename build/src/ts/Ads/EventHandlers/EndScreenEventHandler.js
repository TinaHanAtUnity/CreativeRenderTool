import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
export class EndScreenEventHandler extends GDPREventHandler {
    constructor(adUnit, parameters, storeHandler) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig, parameters.privacySDK);
        this._adUnit = adUnit;
        this._storeHandler = storeHandler;
    }
    onEndScreenDownload(parameters) {
        this._storeHandler.onDownload(parameters);
    }
    onEndScreenClose() {
        this._adUnit.hide();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW5kU2NyZWVuRXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9FdmVudEhhbmRsZXJzL0VuZFNjcmVlbkV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQXFCdEUsTUFBTSxPQUFnQixxQkFBcUUsU0FBUSxnQkFBZ0I7SUFVL0csWUFBWSxNQUFVLEVBQUUsVUFBcUMsRUFBRSxZQUEyQjtRQUN0RixLQUFLLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JHLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxVQUEyQztRQUNsRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEIsQ0FBQztDQUlKIn0=