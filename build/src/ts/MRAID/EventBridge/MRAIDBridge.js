import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
export var MRAIDEvents;
(function (MRAIDEvents) {
    MRAIDEvents["ORIENTATION"] = "orientation";
    // OPEN                = 'open',
    // LOADED              = 'loaded',
    // ANALYTICS_EVENT     = 'analyticsEvent',
    // CLOSE               = 'close',
    // STATE_CHANGE        = 'customMraidState'
})(MRAIDEvents || (MRAIDEvents = {}));
export class MRAIDBridge {
    constructor(core, handler) {
        this._core = core;
        this._handler = handler;
        this._messageListener = (e) => this.onMessage(e);
        this._mraidHandlers = {};
        this._mraidHandlers[MRAIDEvents.ORIENTATION] = (msg) => this.handleSetOrientationProperties(msg.data);
    }
    connect(iframe) {
        window.addEventListener('message', this._messageListener, false);
    }
    disconnect() {
        window.removeEventListener('message', this._messageListener);
    }
    onMessage(e) {
        const message = e.data;
        if (message.type === 'mraid') {
            this._core.Sdk.logDebug(`mraid: event=${message.event}, data=${message.data}`);
            if (message.event in this._mraidHandlers) {
                const handler = this._mraidHandlers[message.event];
                handler(message);
            }
        }
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
        this._handler.onSetOrientationProperties(properties.allowOrientation, forceOrientation);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURCcmlkZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvRXZlbnRCcmlkZ2UvTVJBSURCcmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBR3JFLE1BQU0sQ0FBTixJQUFZLFdBT1g7QUFQRCxXQUFZLFdBQVc7SUFDbkIsMENBQTJCLENBQUE7SUFDM0IsZ0NBQWdDO0lBQ2hDLGtDQUFrQztJQUNsQywwQ0FBMEM7SUFDMUMsaUNBQWlDO0lBQ2pDLDJDQUEyQztBQUMvQyxDQUFDLEVBUFcsV0FBVyxLQUFYLFdBQVcsUUFPdEI7QUFpQkQsTUFBTSxPQUFPLFdBQVc7SUFPcEIsWUFBWSxJQUFjLEVBQUUsT0FBc0I7UUFDOUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFlLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBa0IsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUE4QixHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEosQ0FBQztJQUVNLE9BQU8sQ0FBQyxNQUF5QjtRQUNwQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRU0sVUFBVTtRQUNiLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVPLFNBQVMsQ0FBQyxDQUFlO1FBQzdCLE1BQU0sT0FBTyxHQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3RDLElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxPQUFPLEVBQUU7WUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixPQUFPLENBQUMsS0FBSyxVQUFVLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQy9FLElBQUksT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUN0QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3BCO1NBQ0o7SUFDTCxDQUFDO0lBRU8sOEJBQThCLENBQUMsVUFBdUM7UUFDMUUsSUFBSSxnQkFBZ0IsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDO1FBQ3hDLElBQUksVUFBVSxDQUFDLGdCQUFnQixFQUFFO1lBQzdCLFFBQVEsVUFBVSxDQUFDLGdCQUFnQixFQUFFO2dCQUNyQyxLQUFLLFdBQVc7b0JBQ1osZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLFNBQVMsQ0FBQztvQkFDekMsTUFBTTtnQkFDVixLQUFLLFVBQVU7b0JBQ1gsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztvQkFDeEMsTUFBTTtnQkFDVixLQUFLLE1BQU07b0JBQ1AsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQztvQkFDcEMsTUFBTTtnQkFDVixRQUFRO2FBQ1A7U0FDSjtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsMEJBQTBCLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDNUYsQ0FBQztDQUNKIn0=