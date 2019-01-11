import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StoreHandler, IStoreHandlerDownloadParameters, IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandler/StoreHandler';

export class GoogleStoreHandler extends StoreHandler {

    constructor(parameters: IStoreHandlerParameters) {
        super(parameters);
    }

    public onDownload(parameters: IStoreHandlerDownloadParameters): void {
        super.onDownload(parameters);

        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);

            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openGoogleAppStore(parameters);
            }
        } else {
            this.openGoogleAppStore(parameters);
        }
    }

    private openGoogleAppStore(parameters: IStoreHandlerDownloadParameters, isAppSheetBroken?: boolean) {
        let packageName: string | undefined;

        packageName = this._clientInfo.getApplicationName();

        const appStoreUrl = this.getGoogleAppStoreUrl(parameters, packageName);
        if (!appStoreUrl) {
            Diagnostics.trigger('no_appstore_url', {
                message: 'cannot generate appstore url'
            });
            return;
        }

        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': appStoreUrl
        });
    }

    private getGoogleAppStoreUrl(parameters: IStoreHandlerDownloadParameters, packageName?: string): string | undefined {
        if (!parameters.appStoreId) {
            return;
        }

        return 'market://details?id=' + parameters.appStoreId;
    }
}
