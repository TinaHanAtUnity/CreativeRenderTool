import { StoreHandler, IStoreHandlerParameters, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class StandaloneAndroidStoreHandler extends StoreHandler {

    constructor(parameters: IStoreHandlerParameters) {
        super(parameters);
    }

    public onDownload(parameters: IStoreHandlerDownloadParameters) {
        super.onDownload(parameters);

        if (parameters.clickAttributionUrl) {
            this.handleClickAttributionWithoutRedirect(parameters.clickAttributionUrl);
        }
        if (parameters.appDownloadUrl) {
            this.handleAppDownloadUrl(parameters.appDownloadUrl);
        } else {
            Diagnostics.trigger('standalone_android_misconfigured', {
                message: 'missing appDownloadUrl'
            });
        }
    }

    private handleAppDownloadUrl(appDownloadUrl: string) {
        const decodedAppDownloadUrl = decodeURIComponent(appDownloadUrl);
        this.openURL(decodedAppDownloadUrl);
    }

    protected openURL(url: string): void {
        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': url
        });
    }
}
