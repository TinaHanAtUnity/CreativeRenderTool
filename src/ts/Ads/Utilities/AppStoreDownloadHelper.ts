import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { RequestError } from 'Core/Errors/RequestError';
import { Video } from 'Ads/Models/Assets/Video';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { Campaign } from 'Ads/Models/Campaign';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { VideoAdUnit } from 'Ads/AdUnits/VideoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { ICoreApi } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';

export interface IAppStoreDownloadHelper {
    onDownload(parameters: IAppStoreDownloadParameters): void;
}

export interface IAppStoreDownloadHelperParameters {
    platform: Platform;
    core: ICoreApi;
    ads: IAdsApi;
    thirdPartyEventManager: ThirdPartyEventManager;
    operativeEventManager: OperativeEventManager;
    deviceInfo: DeviceInfo;
    clientInfo: ClientInfo;
    placement: Placement;
    adUnit: VideoAdUnit;
    campaign: Campaign;
    coreConfig: CoreConfiguration;
}

export interface IAppStoreDownloadParameters {
    clickAttributionUrl: string | undefined;
    clickAttributionUrlFollowsRedirects: boolean | undefined;
    bypassAppSheet: boolean | undefined;
    appStoreId: string | undefined;
    store: StoreName | undefined;
    appDownloadUrl?: string | undefined;
    adUnitStyle?: AdUnitStyle;
}

export class AppStoreDownloadHelper  {

    private _platform: Platform;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _placement: Placement;
    private _campaign: Campaign;
    private _operativeEventManager: OperativeEventManager;
    private _adUnit: VideoAdUnit;
    private _coreConfig: CoreConfiguration;

    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(parameters: IAppStoreDownloadHelperParameters) {
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._ads = parameters.ads;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._operativeEventManager = parameters.operativeEventManager;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
        this._coreConfig = parameters.coreConfig;
        this._adUnit = parameters.adUnit;
    }

    public onDownload(parameters: IAppStoreDownloadParameters): void {
        this._ads.Listener.sendClickEvent(this._placement.getId());
        const operativeEventParameters = this.getOperativeEventParams(parameters);
        this._operativeEventManager.sendClick(operativeEventParameters);
        if (this._campaign instanceof XPromoCampaign) {
            const clickTrackingUrls = this._campaign.getTrackingUrlsForEvent('click');
            for (const url of clickTrackingUrls) {
                this._thirdPartyEventManager.sendWithGet('xpromo click', this._campaign.getSession().getId(), url);
            }
        }

        if (this._platform === Platform.IOS) {
            this.onDownloadIos(parameters);
        } else if (this._platform === Platform.ANDROID) {
            this.onDownloadAndroid(parameters);
        }
    }

    private onDownloadAndroid(parameters: IAppStoreDownloadParameters): void {
        if (parameters.store === StoreName.STANDALONE_ANDROID) {
            this.handleStandaloneAndroid(parameters);
            return;
        }

        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);

            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters);
            }
        } else {
            this.openAppStore(parameters);
        }
    }

    private handleAppDownloadUrl(appDownloadUrl: string) {
        appDownloadUrl = decodeURIComponent(appDownloadUrl);

        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': appDownloadUrl
        });
    }

    private handleStandaloneAndroid(parameters: IAppStoreDownloadParameters) {
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

    private onDownloadIos(parameters: IAppStoreDownloadParameters): void {
        const isAppSheetBroken = IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion(), this._deviceInfo.getModel());
        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);
            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters, isAppSheetBroken);
            }
        } else {
            this.openAppStore(parameters, isAppSheetBroken);
        }
    }

    private handleClickAttribution(parameters: IAppStoreDownloadParameters) {
        if (parameters.clickAttributionUrlFollowsRedirects && parameters.clickAttributionUrl) {
            this.handleClickAttributionWithRedirects(parameters.clickAttributionUrl);
            return;
        }

        if (parameters.clickAttributionUrl) {
            this.handleClickAttributionWithoutRedirect(parameters.clickAttributionUrl);
        }
    }

    private handleClickAttributionWithoutRedirect(clickAttributionUrl: string) {
        this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false).catch(error => {
            this.triggerDiagnosticsError(error, clickAttributionUrl);
        });
    }

    private handleClickAttributionWithRedirects(clickAttributionUrl: string) {
        const platform = this._platform;

        this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true).then(response => {
            const location = RequestManager.getHeader(response.headers, 'location');
            if (location) {
                if (platform === Platform.ANDROID) {
                    this._core.Android!.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': location
                    });
                } else if (platform === Platform.IOS) {
                    this._core.iOS!.UrlScheme.open(location);
                }
            } else {
                Diagnostics.trigger('click_attribution_misconfigured', {
                    url: clickAttributionUrl,
                    followsRedirects: true,
                    response: response
                });
            }
        }).catch(error => {
            this.triggerDiagnosticsError(error, clickAttributionUrl);
        });
    }

    private triggerDiagnosticsError(error: unknown, clickAttributionUrl: string) {
        const currentSession = this._campaign.getSession();

        if (error instanceof RequestError) {
            error = new DiagnosticError(new Error(error.message), {
                request: error.nativeRequest,
                auctionId: currentSession.getId(),
                url: clickAttributionUrl,
                response: error.nativeResponse
            });
        }
        SessionDiagnostics.trigger('click_attribution_failed', error, currentSession);
    }

    private openAppStore(parameters: IAppStoreDownloadParameters, isAppSheetBroken?: boolean) {
        const platform = this._platform;
        let packageName: string | undefined;

        if (platform === Platform.ANDROID) {
            packageName = this._clientInfo.getApplicationName();
        }

        const appStoreUrl = this.getAppStoreUrl(parameters, packageName);
        if (!appStoreUrl) {
            Diagnostics.trigger('no_appstore_url', {
                message: 'cannot generate appstore url'
            });
            return;
        }

        if (platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': appStoreUrl
            });
        } else if (platform === Platform.IOS) {
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
    }

    private getAppStoreUrl(parameters: IAppStoreDownloadParameters, packageName?: string): string | undefined {
        if (!parameters.appStoreId) {
            return;
        }

        switch (parameters.store) {
            case StoreName.APPLE:
                return 'https://itunes.apple.com/app/id' + parameters.appStoreId;
            case StoreName.GOOGLE:
                return 'market://details?id=' + parameters.appStoreId;
            case StoreName.XIAOMI:
                return 'migamecenter://details?pkgname=' + parameters.appStoreId + '&channel=unityAds&from=' + packageName + '&trace=' + this._coreConfig.getToken();
            default:
                return '';
        }
    }

    private getVideo(): Video | undefined {
        if (this._adUnit instanceof PerformanceAdUnit) {
            return this._adUnit.getVideo();
        }

        return undefined;
    }

    private getVideoOrientation(): string | undefined {
        return this._adUnit.getVideoOrientation();
    }

    private getOperativeEventParams(parameters: IAppStoreDownloadParameters): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this.getVideo()
        };
    }
}
