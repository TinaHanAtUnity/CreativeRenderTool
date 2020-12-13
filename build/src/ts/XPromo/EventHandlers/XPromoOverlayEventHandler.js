import { OverlayEventHandlerWithDownloadSupport } from 'Ads/EventHandlers/OverlayEventHandlerWithDownloadSupport';
export class XPromoOverlayEventHandler extends OverlayEventHandlerWithDownloadSupport {
    constructor(adUnit, parameters, storeHandler) {
        super(adUnit, parameters, storeHandler);
        this._xPromoAdUnit = adUnit;
    }
    onOverlaySkip(position) {
        if (this._placement.skipEndCardOnClose()) {
            super.onOverlayClose();
        }
        else {
            super.onOverlaySkip(position);
            const endScreen = this._xPromoAdUnit.getEndScreen();
            if (endScreen) {
                endScreen.show();
            }
            this._xPromoAdUnit.onFinish.trigger();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vT3ZlcmxheUV2ZW50SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9YUHJvbW8vRXZlbnRIYW5kbGVycy9YUHJvbW9PdmVybGF5RXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxzQ0FBc0MsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBR2xILE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxzQ0FBc0Q7SUFHakcsWUFBWSxNQUFvQixFQUFFLFVBQW1DLEVBQUUsWUFBMkI7UUFDOUYsS0FBSyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7SUFDaEMsQ0FBQztJQUVNLGFBQWEsQ0FBQyxRQUFnQjtRQUNqQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsRUFBRTtZQUN0QyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDMUI7YUFBTTtZQUNILEtBQUssQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwRCxJQUFJLFNBQVMsRUFBRTtnQkFDWCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDcEI7WUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUN6QztJQUNMLENBQUM7Q0FDSiJ9