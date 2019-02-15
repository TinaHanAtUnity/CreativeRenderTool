import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StoreHandler, IStoreHandlerDownloadParameters, IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';

export class XiaomiStoreHandler extends StoreHandler {

    private _clientInfo: ClientInfo;
    private _coreConfig: CoreConfiguration;

    constructor(parameters: IStoreHandlerParameters) {
        super(parameters);
        if (!parameters.clientInfo || !parameters.coreConfig) {
            throw new Error('Missing clientInfo or coreConfig for creating XiaomiStoreHandler');
        }
        this._clientInfo = parameters.clientInfo;
        this._coreConfig = parameters.coreConfig;
    }

    public onDownload(parameters: IStoreHandlerDownloadParameters): void {
        super.onDownload(parameters);

        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);

            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openXiaomiAppStore(parameters);
            }
        } else {
            this.openXiaomiAppStore(parameters);
        }
    }

    private openXiaomiAppStore(parameters: IStoreHandlerDownloadParameters) {
        let packageName: string | undefined;

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

    private getXiaomiAppStoreUrl(parameters: IStoreHandlerDownloadParameters, packageName?: string): string | undefined {
        if (!parameters.appStoreId) {
            return;
        }

        return 'migamecenter://details?pkgname=' + parameters.appStoreId + '&channel=unityAds&from=' + packageName + '&trace=' + this. _coreConfig.getToken();
    }

    protected openURL(url: string): void {
        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': url
        });
    }
}
