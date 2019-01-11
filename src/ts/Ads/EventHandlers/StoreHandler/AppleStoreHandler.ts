import {
    StoreHandler,
    IStoreHandlerParameters,
    IStoreHandlerDownloadParameters
} from 'Ads/EventHandlers/StoreHandler/StoreHandler';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class AppleStoreHandler extends StoreHandler {

    constructor(parameters: IStoreHandlerParameters) {
        super(parameters);
    }

    public onDownload(parameters: IStoreHandlerDownloadParameters): void {
        super.onDownload(parameters);

        const isAppSheetBroken = IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion(), this._deviceInfo.getModel());
        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);
            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppleAppStore(parameters, isAppSheetBroken);
            }
        } else {
            this.openAppleAppStore(parameters, isAppSheetBroken);
        }
    }

    private openAppleAppStore(parameters: IStoreHandlerDownloadParameters, isAppSheetBroken?: boolean) {
        const appStoreUrl = this.getAppleAppStoreUrl(parameters);
        if (!appStoreUrl) {
            Diagnostics.trigger('no_appstore_url', {
                message: 'cannot generate appstore url'
            });
            return;
        }

        if (isAppSheetBroken || parameters.bypassAppSheet) {
            this._core.iOS!.UrlScheme.open(appStoreUrl);
        } else {
            this._ads.iOS!.AppSheet.canOpen().then(canOpenAppSheet => {
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
                    this._ads.iOS!.AppSheet.present(options).then(() => {
                        this._ads.iOS!.AppSheet.destroy(options);
                    }).catch(([error]) => {
                        if (error === 'APPSHEET_NOT_FOUND') {
                            this._core.iOS!.UrlScheme.open(appStoreUrl);
                        }
                    });
                } else {
                    this._core.iOS!.UrlScheme.open(appStoreUrl);
                }
            });
        }
    }

    private getAppleAppStoreUrl(parameters: IStoreHandlerDownloadParameters): string | undefined {
        if (!parameters.appStoreId && parameters.store !== StoreName.APPLE) {
            return;
        }

        return 'https://itunes.apple.com/app/id' + parameters.appStoreId;
    }
}
