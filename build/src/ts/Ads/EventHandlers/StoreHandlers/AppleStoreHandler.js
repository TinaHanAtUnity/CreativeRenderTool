import { StoreHandler } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
export class AppleStoreHandler extends StoreHandler {
    constructor(parameters) {
        super(parameters);
        if (!parameters.deviceInfo) {
            throw new Error('Missing deviceInfo for creating AppleStoreHandler');
        }
        this._deviceInfo = parameters.deviceInfo;
    }
    onDownload(parameters) {
        super.onDownload(parameters);
        const orientation = this._deviceInfo.get('screenWidth') >= this._deviceInfo.get('screenHeight') ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
        const isAppSheetBroken = IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion(), this._deviceInfo.getModel(), orientation);
        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);
            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppleAppStore(parameters, isAppSheetBroken);
            }
        }
        else {
            this.openAppleAppStore(parameters, isAppSheetBroken);
        }
    }
    openAppleAppStore(parameters, isAppSheetBroken) {
        const appStoreUrl = this.getAppleAppStoreUrl(parameters);
        if (!appStoreUrl) {
            Diagnostics.trigger('no_appstore_url', {
                message: 'cannot generate appstore url'
            });
            return;
        }
        if (isAppSheetBroken || parameters.bypassAppSheet) {
            this.openURL(appStoreUrl);
        }
        else {
            this._store.iOS.AppSheet.canOpen().then(canOpenAppSheet => {
                if (canOpenAppSheet) {
                    if (!parameters.appStoreId) {
                        Diagnostics.trigger('no_appstore_id', {
                            message: 'trying to open ios appstore without appstore id'
                        });
                        return;
                    }
                    const options = {
                        id: parseInt(parameters.appStoreId, 10)
                    };
                    this._store.iOS.AppSheet.present(options).then(() => {
                        this._store.iOS.AppSheet.destroy(options);
                    }).catch(([error]) => {
                        if (error === 'APPSHEET_NOT_FOUND') {
                            this.openURL(appStoreUrl);
                        }
                    });
                }
                else {
                    this.openURL(appStoreUrl);
                }
            });
        }
    }
    getAppleAppStoreUrl(parameters) {
        if (!parameters.appStoreId) {
            return;
        }
        return 'https://itunes.apple.com/app/id' + parameters.appStoreId;
    }
    openURL(url) {
        this._core.iOS.UrlScheme.open(url);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwbGVTdG9yZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0V2ZW50SGFuZGxlcnMvU3RvcmVIYW5kbGVycy9BcHBsZVN0b3JlSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQ0gsWUFBWSxFQUdmLE1BQU0sOENBQThDLENBQUM7QUFDdEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV6RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFFckUsTUFBTSxPQUFPLGlCQUFrQixTQUFRLFlBQVk7SUFJL0MsWUFBWSxVQUFtQztRQUMzQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1NBQ3hFO1FBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO0lBQzdDLENBQUM7SUFFTSxVQUFVLENBQUMsVUFBMkM7UUFDekQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUM3QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUMvSSxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMs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