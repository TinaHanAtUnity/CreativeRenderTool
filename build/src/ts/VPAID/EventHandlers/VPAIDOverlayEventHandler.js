import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { FinishState } from 'Core/Constants/FinishState';
export class VPAIDOverlayEventHandler extends GDPREventHandler {
    constructor(adUnit, parameters) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig, parameters.privacySDK);
        this._adUnit = adUnit;
        this._operativeEventManager = parameters.operativeEventManager;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._endScreen = parameters.endScreen;
    }
    onClose(skipped) {
        const finishState = skipped ? FinishState.SKIPPED : FinishState.COMPLETED;
        this._adUnit.setFinishState(finishState);
        if (this._endScreen) {
            this._endScreen.show();
        }
        this._adUnit.hide();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURPdmVybGF5RXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZQQUlEL0V2ZW50SGFuZGxlcnMvVlBBSURPdmVybGF5RXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBSXRFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUt6RCxNQUFNLE9BQU8sd0JBQXlCLFNBQVEsZ0JBQWdCO0lBTzFELFlBQVksTUFBbUIsRUFBRSxVQUFrQztRQUMvRCxLQUFLLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3JHLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUM7UUFDL0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7SUFDM0MsQ0FBQztJQUVNLE9BQU8sQ0FBQyxPQUFnQjtRQUMzQixNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUM7UUFDMUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDekMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDMUI7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLENBQUM7Q0FDSiJ9