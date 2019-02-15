import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StoreHandler, IStoreHandlerDownloadParameters, IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { ClientInfo } from 'Core/Models/ClientInfo';

export interface IGoogleStoreHandlerParameters extends IStoreHandlerParameters {
    clientInfo: ClientInfo;
}

export class GoogleStoreHandler extends StoreHandler {

    private _clientInfo: ClientInfo;

    constructor(parameters: IGoogleStoreHandlerParameters) {
        super(parameters);

        this._clientInfo = parameters.clientInfo;
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

    private openGoogleAppStore(parameters: IStoreHandlerDownloadParameters) {
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

    protected openURL(url: string): void {
        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': url
        });
    }
}
