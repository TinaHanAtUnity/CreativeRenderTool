import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
export var MRAIDEvents;
(function (MRAIDEvents) {
    MRAIDEvents["ORIENTATION"] = "orientation";
    MRAIDEvents["OPEN"] = "open";
    MRAIDEvents["LOADED"] = "loaded";
    MRAIDEvents["ANALYTICS_EVENT"] = "analyticsEvent";
    MRAIDEvents["CLOSE"] = "close";
    MRAIDEvents["USE_CUSTOM_CLOSE"] = "useCustomClose";
    MRAIDEvents["STATE_CHANGE"] = "customMraidState";
    MRAIDEvents["RESIZE_WEBVIEW"] = "resizeWebview";
    MRAIDEvents["SEND_STATS"] = "sendStats";
    MRAIDEvents["AR"] = "ar";
    MRAIDEvents["AR_READY_SHOW"] = "arReadyShow";
    MRAIDEvents["AR_BUTTON_HIDE"] = "hideArButton";
    MRAIDEvents["CONSOLE_LOG"] = "consoleLog";
    MRAIDEvents["DEVORIENTATION_SUB"] = "deviceorientationSubscribe";
})(MRAIDEvents || (MRAIDEvents = {}));
export class MRAIDEventAdapter {
    constructor(handler) {
        this._handler = handler;
        this._mraidHandlers = {};
        this._mraidHandlers[MRAIDEvents.LOADED] = () => this.handleLoaded();
        this._mraidHandlers[MRAIDEvents.CLOSE] = () => this.handleClose();
        this._mraidHandlers[MRAIDEvents.DEVORIENTATION_SUB] = () => this.handleSubscribeDeviceOrientation();
        this._mraidHandlers[MRAIDEvents.USE_CUSTOM_CLOSE] = (msg) => this.handleUseCustomClose(msg.hideClose);
    }
    handleSetOrientationProperties(properties) {
        let forceOrientation = Orientation.NONE;
        if (properties.forceOrientation) {
            switch (properties.forceOrientation) {
                case 'landscape':
                    forceOrientation = Orientation.LANDSCAPE;
                    break;
                case 'portrait':
                    forceOrientation = Orientation.PORTRAIT;
                    break;
                case 'none':
                    forceOrientation = Orientation.NONE;
                    break;
                default:
            }
        }
        this._handler.onBridgeSetOrientationProperties(properties.allowOrientationChange, forceOrientation);
    }
    handleOpen(url) {
        this._handler.onBridgeOpen(url);
    }
    handleAnalyticsEvent(event, eventData) {
        this._handler.onBridgeAnalyticsEvent(event, eventData);
    }
    handleCustomState(customState) {
        this._handler.onBridgeStateChange(customState);
    }
    handleLoaded() {
        this._handler.onBridgeLoad();
    }
    handleClose() {
        this._handler.onBridgeClose();
    }
    handleUseCustomClose(hideClose) {
        this._handler.onUseCustomClose(hideClose);
    }
    handleSendStats(totalTime, playTime, frameCount) {
        this._handler.onBridgeSendStats(totalTime, playTime, frameCount);
    }
    handleSubscribeDeviceOrientation() {
        this._handler.onBridgeDeviceOrientationSubscribe();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURFdmVudEFkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvRXZlbnRCcmlkZ2UvTVJBSURFdmVudEFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBa0NyRSxNQUFNLENBQU4sSUFBWSxXQWVYO0FBZkQsV0FBWSxXQUFXO0lBQ25CLDBDQUEyQixDQUFBO0lBQzNCLDRCQUFhLENBQUE7SUFDYixnQ0FBaUIsQ0FBQTtJQUNqQixpREFBa0MsQ0FBQTtJQUNsQyw4QkFBZSxDQUFBO0lBQ2Ysa0RBQW1DLENBQUE7SUFDbkMsZ0RBQWlDLENBQUE7SUFDakMsK0NBQWdDLENBQUE7SUFDaEMsdUNBQXdCLENBQUE7SUFDeEIsd0JBQVMsQ0FBQTtJQUNULDRDQUE2QixDQUFBO0lBQzdCLDhDQUErQixDQUFBO0lBQy9CLHlDQUEwQixDQUFBO0lBQzFCLGdFQUFpRCxDQUFBO0FBQ3JELENBQUMsRUFmVyxXQUFXLEtBQVgsV0FBVyxRQWV0QjtBQUVELE1BQU0sT0FBZ0IsaUJBQWlCO0lBSW5DLFlBQVksT0FBc0I7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFFeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFFekIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BFLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNsRSxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO1FBQ3BHLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBVSxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkgsQ0FBQztJQVVTLDhCQUE4QixDQUFDLFVBQXVDO1FBQzVFLElBQUksZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztRQUN4QyxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRTtZQUM3QixRQUFRLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRTtnQkFDckMsS0FBSyxXQUFXO29CQUNaLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUM7b0JBQ3pDLE1BQU07Z0JBQ1YsS0FBSyxVQUFVO29CQUNYLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7b0JBQ3hDLE1BQU07Z0JBQ1YsS0FBSyxNQUFNO29CQUNQLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUM7b0JBQ3BDLE1BQU07Z0JBQ1YsUUFBUTthQUNQO1NBQ0o7UUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3hHLENBQUM7SUFFUyxVQUFVLENBQUMsR0FBVztRQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRVMsb0JBQW9CLENBQUMsS0FBYSxFQUFFLFNBQWlCO1FBQzNELElBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFUyxpQkFBaUIsQ0FBQyxXQUFtQjtRQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFUyxZQUFZO1FBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVTLFdBQVc7UUFDakIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBRVMsb0JBQW9CLENBQUMsU0FBa0I7UUFDN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRVMsZUFBZSxDQUFDLFNBQWlCLEVBQUUsUUFBZ0IsRUFBRSxVQUFrQjtRQUM3RSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDckUsQ0FBQztJQUVTLGdDQUFnQztRQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLENBQUM7SUFDdkQsQ0FBQztDQUNKIn0=