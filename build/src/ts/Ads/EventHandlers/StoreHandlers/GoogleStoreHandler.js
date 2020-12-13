import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
export class GoogleStoreHandler extends StoreHandler {
    constructor(parameters) {
        super(parameters);
        if (!parameters.clientInfo) {
            throw new Error('Missing clientInfo for creating GoogleStoreHandler');
        }
        this._clientInfo = parameters.clientInfo;
    }
    onDownload(parameters) {
        super.onDownload(parameters);
        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);
            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openGoogleAppStore(parameters);
            }
        }
        else {
            this.openGoogleAppStore(parameters);
        }
    }
    openGoogleAppStore(parameters) {
        let packageName;
        packageName = this._clientInfo.getApplicationName();
        const appStoreUrl = this.getGoogleAppStoreUrl(parameters, packageName);
        if (!appStoreUrl) {
            Diagnostics.trigger('no_appstore_url', {
                message: 'cannot generate appstore url'
            });
            return;
        }
        this._core.Android.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': appStoreUrl
        });
    }
    getGoogleAppStoreUrl(parameters, packageName) {
        if (!parameters.appStoreId) {
            return;
        }
        return 'market://details?id=' + parameters.appStoreId;
    }
    openURL(url) {
        this._core.Android.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': url
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR29vZ2xlU3RvcmVIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9FdmVudEhhbmRsZXJzL1N0b3JlSGFuZGxlcnMvR29vZ2xlU3RvcmVIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsWUFBWSxFQUE0RCxNQUFNLDhDQUE4QyxDQUFDO0FBR3RJLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxZQUFZO0lBSWhELFlBQVksVUFBbUM7UUFDM0MsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO1lBQ3hCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQztTQUN6RTtRQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztJQUM3QyxDQUFDO0lBRU0sVUFBVSxDQUFDLFVBQTJDO1FBQ3pELEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFN0IsSUFBSSxVQUFVLENBQUMsbUJBQW1CLEVBQUU7WUFDaEMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxVQUFVLENBQUMsbUNBQW1DLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUN2QztTQUNKO2FBQU07WUFDSCxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsVUFBMkM7UUFDbEUsSUFBSSxXQUErQixDQUFDO1FBRXBDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFcEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2QsV0FBVyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtnQkFDbkMsT0FBTyxFQUFFLDhCQUE4QjthQUMxQyxDQUFDLENBQUM7WUFDSCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzlCLFFBQVEsRUFBRSw0QkFBNEI7WUFDdEMsS0FBSyxFQUFFLFdBQVc7U0FDckIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFVBQTJDLEVBQUUsV0FBb0I7UUFDMUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDeEIsT0FBTztTQUNWO1FBRUQsT0FBTyxzQkFBc0IsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQzFELENBQUM7SUFFUyxPQUFPLENBQUMsR0FBVztRQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzlCLFFBQVEsRUFBRSw0QkFBNEI7WUFDdEMsS0FBSyxFQUFFLEdBQUc7U0FDYixDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0oifQ==