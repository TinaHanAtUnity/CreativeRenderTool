import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { TencentUtils } from 'VAST/Utilities/TencentUtils';
export class TencentVastOverlayEventHandler extends VastOverlayEventHandler {
    getClickThroughURL() {
        let tap;
        if (this._vastOverlay) {
            tap = this._vastOverlay.tap('.call-button');
        }
        else {
            tap = undefined;
        }
        let clickThroughURL = super.getClickThroughURL();
        if (clickThroughURL) {
            clickThroughURL = TencentUtils.replaceClickThroughMacro(clickThroughURL, tap);
        }
        return clickThroughURL;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuY2VudFZhc3RPdmVybGF5RXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvRXZlbnRIYW5kbGVycy9UZW5jZW50VmFzdE92ZXJsYXlFdmVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDckYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRzNELE1BQU0sT0FBTyw4QkFBK0IsU0FBUSx1QkFBdUI7SUFDN0Qsa0JBQWtCO1FBQ3hCLElBQUksR0FBb0IsQ0FBQztRQUN6QixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQy9DO2FBQU07WUFDSCxHQUFHLEdBQUcsU0FBUyxDQUFDO1NBQ25CO1FBQ0QsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDakQsSUFBSSxlQUFlLEVBQUU7WUFDakIsZUFBZSxHQUFHLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDakY7UUFDRCxPQUFPLGVBQWUsQ0FBQztJQUMzQixDQUFDO0NBRUoifQ==