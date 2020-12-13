import { StoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
export class StandaloneAndroidStoreHandler extends StoreHandler {
    constructor(parameters) {
        super(parameters);
    }
    onDownload(parameters) {
        super.onDownload(parameters);
        if (parameters.clickAttributionUrl) {
            this.handleClickAttributionWithoutRedirect(parameters.clickAttributionUrl);
        }
        if (parameters.appDownloadUrl) {
            this.handleAppDownloadUrl(parameters.appDownloadUrl);
        }
        else {
            Diagnostics.trigger('standalone_android_misconfigured', {
                message: 'missing appDownloadUrl'
            });
        }
    }
    handleAppDownloadUrl(appDownloadUrl) {
        const decodedAppDownloadUrl = decodeURIComponent(appDownloadUrl);
        return this.openURL(decodedAppDownloadUrl);
    }
    openURL(url) {
        this._core.Android.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': url
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RhbmRhbG9uZUFuZHJvaWRTdG9yZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0V2ZW50SGFuZGxlcnMvU3RvcmVIYW5kbGVycy9TdGFuZGFsb25lQW5kcm9pZFN0b3JlSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTRELFlBQVksRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3RJLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV6RCxNQUFNLE9BQU8sNkJBQThCLFNBQVEsWUFBWTtJQUUzRCxZQUFZLFVBQW1DO1FBQzNDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRU0sVUFBVSxDQUFDLFVBQTJDO1FBQ3pELEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFN0IsSUFBSSxVQUFVLENBQUMsbUJBQW1CLEVBQUU7WUFDaEMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzlFO1FBQ0QsSUFBSSxVQUFVLENBQUMsY0FBYyxFQUFFO1lBQzNCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDeEQ7YUFBTTtZQUNILFdBQVcsQ0FBQyxPQUFPLENBQUMsa0NBQWtDLEVBQUU7Z0JBQ3BELE9BQU8sRUFBRSx3QkFBd0I7YUFDcEMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRU8sb0JBQW9CLENBQUMsY0FBc0I7UUFDL0MsTUFBTSxxQkFBcUIsR0FBRyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNqRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRVMsT0FBTyxDQUFDLEdBQVc7UUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUM5QixRQUFRLEVBQUUsNEJBQTRCO1lBQ3RDLEtBQUssRUFBRSxHQUFHO1NBQ2IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKIn0=