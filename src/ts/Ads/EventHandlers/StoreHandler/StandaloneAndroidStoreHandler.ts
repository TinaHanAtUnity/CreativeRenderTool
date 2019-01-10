import {StoreHandler} from "./StoreHandler";
import {PerformanceAdUnit} from "../../../Performance/AdUnits/PerformanceAdUnit";
import {DownloadStatus} from "../../../Core/Native/Android/AndroidDownload";
import {DownloadManager, DownloadMessage, DownloadState} from "../../Managers/DownloadManager";
import {IObserver0, IObserver3} from "../../../Core/Utilities/IObserver";
import {Localization} from "../../../Core/Utilities/Localization";
import {DeviceIdManager} from "../../Managers/DeviceIdManager";
import {AndroidDeviceInfo} from "../../../Core/Models/AndroidDeviceInfo";
import {PerformanceCampaign, StoreName} from "../../../Performance/Models/PerformanceCampaign";
import {Platform} from "../../../Core/Constants/Platform";
import {IAppStoreDownloadParameters} from "../../Utilities/AppStoreDownloadHelper";
import {XPromoCampaign} from "../../../XPromo/Models/XPromoCampaign";
import {Diagnostics} from "../../../Core/Utilities/Diagnostics";

export class StandaloneAndroidStoreHandler extends StoreHandler {

    private onDownload(parameters: IAppStoreDownloadParameters) {
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

    private setDownloadMessageAndEnableButton(message: string) {
        if (this._adUnit instanceof PerformanceAdUnit) {
            const adUnit: PerformanceAdUnit = this._adUnit;
            adUnit.setDownloadStatusMessage(message);
            adUnit.enableDownloadButton();
        }
    }

    private unsubscribeDownloadObservers(adUnitOnCloseObserver: IObserver0, onDownloadUpdateObserver: IObserver3<number, DownloadStatus, string|number>) {
        this._adUnit.onClose.unsubscribe(adUnitOnCloseObserver);
        DownloadManager.onDownloadUpdate.unsubscribe(onDownloadUpdateObserver);
        delete this._currentDownloadUrl;
    }

    private handleAppDownloadUrl(appDownloadUrl: string) {
        appDownloadUrl = decodeURIComponent(appDownloadUrl);

        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': appDownloadUrl
        });
    }
}
