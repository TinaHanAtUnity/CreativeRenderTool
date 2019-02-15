import { StoreHandler, IStoreHandlerParameters, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DownloadStatus } from 'China/Native/Android/Download';
import { Localization } from 'Core/Utilities/Localization';
import { DownloadManager, DownloadMessage, DownloadState } from 'China/Managers/DownloadManager';
import { DeviceIdManager } from 'China/Managers/DeviceIdManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IObserver0, IObserver3 } from 'Core/Utilities/IObserver';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Platform } from 'Core/Constants/Platform';

export interface IStandaloneAndroidStoreHandlerParameters extends IStoreHandlerParameters {
    deviceInfo: DeviceInfo;
    clientInfo: ClientInfo;
    coreConfig: CoreConfiguration;
    downloadManager: DownloadManager;
    deviceIdManager: DeviceIdManager;
}

export class StandaloneAndroidStoreHandler extends StoreHandler {

    private _coreConfigs: CoreConfiguration;
    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;
    private _currentDownloadUrl: string | null;
    private _downloadManager: DownloadManager;
    private _deviceIdManager: DeviceIdManager;
    private _localization: Localization;

    private onDownloadUpdateObserver: IObserver3<number, DownloadStatus, string|number>;
    private adUnitOnCloseObserver: IObserver0;

    constructor(parameters: IStandaloneAndroidStoreHandlerParameters) {
        super(parameters);

        this._coreConfigs = parameters.coreConfig;
        this._deviceInfo = parameters.deviceInfo;
        this._clientInfo = parameters.clientInfo;
        if (parameters.downloadManager) {
            this._downloadManager = parameters.downloadManager;
        }
        if (parameters.deviceIdManager) {
            this._deviceIdManager = parameters.deviceIdManager;
        }
        this._localization = new Localization(this._deviceInfo.getLanguage(), 'endscreen');
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

    private isDownloadManagerReady(appDownloadUrl: string): boolean {
        return this._downloadManager.getState() !== DownloadState.ENQUEUING && this._currentDownloadUrl !== appDownloadUrl;
    }

    private isPerformance(): boolean {
        return this._adUnit instanceof PerformanceAdUnit && this._campaign instanceof PerformanceCampaign;
    }

    private handleAppDownloadUrl(appDownloadUrl: string) {
        const decodedAppDownloadUrl = decodeURIComponent(appDownloadUrl);

        if (!CustomFeatures.isChinaSDK(Platform.ANDROID, this._clientInfo.getSdkVersionName()) || !this._downloadManager) {
            this.openURL(decodedAppDownloadUrl);
            return;
        }

        const deviceIdPromise = new Promise<void> ((resolve, reject) => {
            if (this._deviceIdManager && !(<AndroidDeviceInfo>this._deviceInfo).getDeviceId1()) {
                this._deviceIdManager.getDeviceIdsWithPermissionRequest().then(resolve).catch(reject);
            } else {
                resolve();
            }
        });

        deviceIdPromise.catch(() => {
            // no logging needed as device id manager manages the device id logs
        }).then(() => {
            if (!this.isPerformance() || !this.isDownloadManagerReady(decodedAppDownloadUrl)) {
                return;
            }

            const title = (<PerformanceCampaign>this._campaign).getGameName();
            const description = title;
            const perfAdUnit: PerformanceAdUnit = <PerformanceAdUnit>this._adUnit;

            perfAdUnit.disableDownloadButton();
            perfAdUnit.setDownloadStatusMessage('');

            this._currentDownloadUrl = decodedAppDownloadUrl;

            this.adUnitOnCloseObserver = perfAdUnit.onClose.subscribe(() => {
                this.unsubscribeDownloadObservers();
            });

            this._downloadManager.download(decodedAppDownloadUrl, title, description)
                .then((newDownloadId) => {
                    if (newDownloadId === -1) {
                        this.setDownloadMessageAndEnableButton(this._localization.translate(DownloadMessage.OPENING_BROWSER));
                        this.unsubscribeDownloadObservers();
                    } else {
                        perfAdUnit.setDownloadStatusMessage(this._localization.translate(DownloadMessage.DOWNLOADING));
                        this.onDownloadUpdateObserver = this._downloadManager.onDownloadUpdate.subscribe((downloadId, status, update) => {
                            this.updateEndcard(downloadId, status, update);
                        });
                    }
                }).catch((error) => {
                    this.setDownloadMessageAndEnableButton(this._localization.translate(error.message));
                    this.unsubscribeDownloadObservers();
                });
        });
    }

    private updateEndcard(downloadId: number, status: DownloadStatus, update: string | number) {
        if (this._downloadManager.getCurrentDownloadId() !== downloadId) {
            return;
        }

        const perfAdUnit: PerformanceAdUnit = <PerformanceAdUnit>this._adUnit;
        switch (status) {
            case DownloadStatus.RUNNING:
                const runningMessage = `${this._localization.translate(DownloadMessage.DOWNLOADING)} (${update}%) - ${this._localization.translate(DownloadMessage.DOWNLOADING_REMINDER)}`;
                perfAdUnit.setDownloadStatusMessage(this._localization.translate(runningMessage));
                break;
            case DownloadStatus.PENDING:
                const pendingMessage = `${this._localization.translate(DownloadMessage.DOWNLOADING)} - ${this._localization.translate(DownloadMessage.DOWNLOADING_REMINDER)}`;
                perfAdUnit.setDownloadStatusMessage(this._localization.translate(pendingMessage));
                break;
            case DownloadStatus.FAILED:
            case DownloadStatus.CANCELED_OR_NOT_FOUND:
            case DownloadStatus.SUCCESSFUL:
                this.setDownloadMessageAndEnableButton(this._localization.translate(<string>update));
                this.unsubscribeDownloadObservers();
                break;
            case DownloadStatus.PAUSED:
                perfAdUnit.setDownloadStatusMessage(this._localization.translate(<string>update));
                break;
            default:
        }
    }

    private setDownloadMessageAndEnableButton(message: string) {
        if (this._adUnit instanceof PerformanceAdUnit) {
            const perfAdUnit: PerformanceAdUnit = this._adUnit;
            perfAdUnit.setDownloadStatusMessage(message);
            perfAdUnit.enableDownloadButton();
        }
    }

    private unsubscribeDownloadObservers() {
        this._adUnit.onClose.unsubscribe(this.adUnitOnCloseObserver);
        this._downloadManager.onDownloadUpdate.unsubscribe(this.onDownloadUpdateObserver);
        this._currentDownloadUrl = null;
    }

    protected openURL(url: string): void {
        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': url
        });
    }
}
