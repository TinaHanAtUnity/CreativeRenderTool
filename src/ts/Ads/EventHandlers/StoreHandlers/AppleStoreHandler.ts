import {
    StoreHandler,
    IStoreHandlerParameters,
    IStoreHandlerDownloadParameters
} from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

export class AppleStoreHandler extends StoreHandler {

    private _deviceInfo: DeviceInfo;

    constructor(parameters: IStoreHandlerParameters) {
        super(parameters);
        if (!parameters.deviceInfo) {
            throw new Error('Missing deviceInfo for creating AppleStoreHandler');
        }
        this._deviceInfo = parameters.deviceInfo;
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
            this.openURL(appStoreUrl);
        } else {
            this._store.iOS!.AppSheet.canOpen().then(canOpenAppSheet => {
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
                    this._store.iOS!.AppSheet.present(options).then(() => {
                        this._store.iOS!.AppSheet.destroy(options);
                    }).catch(([error]) => {
                        if (error === 'APPSHEET_NOT_FOUND') {
                            this.openURL(appStoreUrl);
                        }
                    });
                } else {
                    this.openURL(appStoreUrl);
                }
            });
        }
    }

    private getAppleAppStoreUrl(parameters: IStoreHandlerDownloadParameters): string | undefined {
        if (!parameters.appStoreId) {
            return;
        }

        return 'https://itunes.apple.com/app/id' + parameters.appStoreId;
    }

    protected openURL(url: string): void {
        this._core.iOS!.UrlScheme.open(url);
    }
}
