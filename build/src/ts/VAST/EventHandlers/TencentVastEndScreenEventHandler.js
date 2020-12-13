import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { TencentUtils } from 'VAST/Utilities/TencentUtils';
export class TencentVastEndScreenEventHandler extends VastEndScreenEventHandler {
    getClickThroughURL() {
        let tap;
        if (this._vastEndScreen) {
            tap = this._vastEndScreen.tap('.game-background');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuY2VudFZhc3RFbmRTY3JlZW5FdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9FdmVudEhhbmRsZXJzL1RlbmNlbnRWYXN0RW5kU2NyZWVuRXZlbnRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUczRCxNQUFNLE9BQU8sZ0NBQWlDLFNBQVEseUJBQXlCO0lBQ2pFLGtCQUFrQjtRQUN4QixJQUFJLEdBQW9CLENBQUM7UUFDekIsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO1lBQ3JCLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3JEO2FBQU07WUFDSCxHQUFHLEdBQUcsU0FBUyxDQUFDO1NBQ25CO1FBQ0QsSUFBSSxlQUFlLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDakQsSUFBSSxlQUFlLEVBQUU7WUFDakIsZUFBZSxHQUFHLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDakY7UUFDRCxPQUFPLGVBQWUsQ0FBQztJQUMzQixDQUFDO0NBQ0oifQ==