import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
export class XiaomiStoreHandler extends StoreHandler {
    constructor(parameters) {
        super(parameters);
        if (!parameters.clientInfo || !parameters.coreConfig) {
            throw new Error('Missing clientInfo or coreConfig for creating XiaomiStoreHandler');
        }
        this._clientInfo = parameters.clientInfo;
        this._coreConfig = parameters.coreConfig;
    }
    onDownload(parameters) {
        super.onDownload(parameters);
        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);
            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openXiaomiAppStore(parameters);
            }
        }
        else {
            this.openXiaomiAppStore(parameters);
        }
    }
    openXiaomiAppStore(parameters) {
        let packageName;
        packageName = this._clientInfo.getApplicationName();
        const appStoreUrl = this.getXiaomiAppStoreUrl(parameters, packageName);
        if (!appStoreUrl) {
            Diagnostics.trigger('no_appstore_url', {
                message: 'cannot generate appstore url'
            });
            return;
        }
        this.openURL(appStoreUrl);
    }
    getXiaomiAppStoreUrl(parameters, packageName) {
        if (!parameters.appStoreId) {
            return;
        }
        return 'migamecenter://details?pkgname=' + parameters.appStoreId + '&channel=unityAds&from=' + packageName + '&trace=' + this._coreConfig.getToken();
    }
    openURL(url) {
        this._core.Android.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': url
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWGlhb21pU3RvcmVIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9FdmVudEhhbmRsZXJzL1N0b3JlSGFuZGxlcnMvWGlhb21pU3RvcmVIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsWUFBWSxFQUE0RCxNQUFNLDhDQUE4QyxDQUFDO0FBSXRJLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxZQUFZO0lBS2hELFlBQVksVUFBbUM7UUFDM0MsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtZQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLGtFQUFrRSxDQUFDLENBQUM7U0FDdkY7UUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7UUFDekMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQzdDLENBQUM7SUFFTSxVQUFVLENBQUMsVUFBMkM7UUFDekQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU3QixJQUFJLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRTtZQUNoQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFeEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxtQ0FBbUMsRUFBRTtnQkFDakQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3ZDO1NBQ0o7YUFBTTtZQUNILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxVQUEyQztRQUNsRSxJQUFJLFdBQStCLENBQUM7UUFFcEMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUVwRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDZCxXQUFXLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFO2dCQUNuQyxPQUFPLEVBQUUsOEJBQThCO2FBQzFDLENBQUMsQ0FBQztZQUNILE9BQU87U0FDVjtRQUVELElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFVBQTJDLEVBQUUsV0FBb0I7UUFDMUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDeEIsT0FBTztTQUNWO1FBRUQsT0FBTyxpQ0FBaUMsR0FBRyxVQUFVLENBQUMsVUFBVSxHQUFHLHlCQUF5QixHQUFHLFdBQVcsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMxSixDQUFDO0lBRVMsT0FBTyxDQUFDLEdBQVc7UUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUM5QixRQUFRLEVBQUUsNEJBQTRCO1lBQ3RDLEtBQUssRUFBRSxHQUFHO1NBQ2IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKIn0=