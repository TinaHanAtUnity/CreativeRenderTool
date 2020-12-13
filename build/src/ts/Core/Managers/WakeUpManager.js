import { Observable0 } from 'Core/Utilities/Observable';
export class WakeUpManager {
    constructor(core) {
        this.onNetworkConnected = new Observable0();
        this._core = core;
        this._firstConnection = Date.now();
        this._connectionEvents = 0;
        this._core.Connectivity.onConnected.subscribe((wifi, networkType) => this.onConnected(wifi, networkType));
    }
    setListenConnectivity(status) {
        return this._core.Connectivity.setListeningStatus(status);
    }
    onConnected(wifi, networkType) {
        const thirtyMinutes = 30 * 60 * 1000;
        if (this._firstConnection + thirtyMinutes < Date.now()) {
            this._firstConnection = Date.now();
            this._connectionEvents = 0;
            this.onNetworkConnected.trigger();
        }
        else {
            this._connectionEvents++;
            // allow max 10 connection events in 30 minutes
            if (this._connectionEvents <= 10) {
                this.onNetworkConnected.trigger();
            }
            else if (this._connectionEvents === 11) {
                this._core.Sdk.logWarning('Unity Ads has received more than 10 connection events in 30 minutes, now ignoring connection events');
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FrZVVwTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL01hbmFnZXJzL1dha2VVcE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE1BQU0sT0FBTyxhQUFhO0lBT3RCLFlBQVksSUFBYztRQU5WLHVCQUFrQixHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFPbkQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzlHLENBQUM7SUFFTSxxQkFBcUIsQ0FBQyxNQUFlO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVPLFdBQVcsQ0FBQyxJQUFhLEVBQUUsV0FBbUI7UUFDbEQsTUFBTSxhQUFhLEdBQVcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFN0MsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNwRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3JDO2FBQU07WUFDSCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUN6QiwrQ0FBK0M7WUFDL0MsSUFBSSxJQUFJLENBQUMsaUJBQWlCLElBQUksRUFBRSxFQUFFO2dCQUM5QixJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDckM7aUJBQU0sSUFBSSxJQUFJLENBQUMsaUJBQWlCLEtBQUssRUFBRSxFQUFFO2dCQUN0QyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMscUdBQXFHLENBQUMsQ0FBQzthQUNwSTtTQUNKO0lBQ0wsQ0FBQztDQUNKIn0=