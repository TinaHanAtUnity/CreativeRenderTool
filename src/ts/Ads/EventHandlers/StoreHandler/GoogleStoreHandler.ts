import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StoreHandler, IStoreHandlerDownloadParameters, IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandler/StoreHandler';

export class GoogleStoreHandler extends StoreHandler {

    constructor(parameters: IStoreHandlerParameters) {
        super(parameters);
    }

    public onDownload(parameters: IStoreHandlerDownloadParameters): void {
        if (parameters.store !== StoreName.GOOGLE && parameters.store !== StoreName.XIAOMI) {
            return;
        }
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

        switch (parameters.store) {
            case StoreName.GOOGLE:
                return 'market://details?id=' + parameters.appStoreId;
            case StoreName.XIAOMI:
                return 'migamecenter://details?pkgname=' + parameters.appStoreId + '&channel=unityAds&from=' + packageName + '&trace=' + this._coreConfig.getToken();
            default:
                return '';
        }
    }
}
