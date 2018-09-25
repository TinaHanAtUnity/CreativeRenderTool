import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import { Request } from 'Core/Utilities/Request';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { RequestError } from 'Core/Errors/RequestError';
import { Video } from 'Ads/Models/Assets/Video';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { StoreName } from 'Performance/Models/PerformanceCampaign';

export interface IVideoOverlayDownloadParameters extends IEndScreenDownloadParameters {
    videoProgress: number;
}

export class PerformanceOverlayWithCTAButtonEventHandler extends PerformanceOverlayEventHandler {

    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _performanceOverlay?: AbstractVideoOverlay;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(nativeBridge, adUnit, parameters);
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._performanceOverlay = this._performanceAdUnit.getOverlay();
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        this.setCallButtonEnabled(false);
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.CLICK);

        const operativeEventParameters = this.getOperativeEventParams(parameters);
        this._operativeEventManager.sendClick(operativeEventParameters);

        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this.onDownloadIos(parameters);
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this.onDownloadAndroid(parameters);
        }
    }

    private onDownloadAndroid(parameters: IVideoOverlayDownloadParameters): void {
        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);
            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters);
            }
        } else {
            this.openAppStore(parameters);
        }
    }
    private onDownloadIos(parameters: IVideoOverlayDownloadParameters): void {
        if (parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);
            if (!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters);
            }
        } else {
            this.openAppStore(parameters);
        }
    }

    private handleClickAttribution(parameters: IVideoOverlayDownloadParameters) {
        if (parameters.clickAttributionUrlFollowsRedirects && parameters.clickAttributionUrl) {
            this.handleClickAttributionWithRedirects(parameters.clickAttributionUrl, parameters.clickAttributionUrlFollowsRedirects);
        } else {
            if (parameters.clickAttributionUrl) {
                this._thirdPartyEventManager.clickAttributionEvent(parameters.clickAttributionUrl, false);
            }
        }
    }

    private handleClickAttributionWithRedirects(clickAttributionUrl: string, clickAttributionUrlFollowsRedirects: boolean) {
        const platform = this._nativeBridge.getPlatform();

        this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true).then(response => {
            const location = Request.getHeader(response.headers, 'location');
            if (location) {
                if (platform === Platform.ANDROID) {
                    this._nativeBridge.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': location
                    });
                } else if (platform === Platform.IOS) {
                    this._nativeBridge.UrlScheme.open(location);
                }
            } else {
                Diagnostics.trigger('click_attribution_misconfigured', {
                    url: clickAttributionUrl,
                    followsRedirects: clickAttributionUrlFollowsRedirects,
                    response: response
                });
            }
        }).catch(error => {
            this.triggerDiagnosticsError(error, clickAttributionUrl);
        });
    }

    private triggerDiagnosticsError(error: any, clickAttributionUrl: string) {
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

    private openAppStore(parameters: IVideoOverlayDownloadParameters) {
        const platform = this._nativeBridge.getPlatform();
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
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': appStoreUrl
            });
        } else if (platform === Platform.IOS) {
            const isAppSheetBroken = IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion(), this._deviceInfo.getModel());
            if (isAppSheetBroken || parameters.bypassAppSheet) {
                this._nativeBridge.UrlScheme.open(appStoreUrl);
            } else {
                this._nativeBridge.AppSheet.canOpen().then(canOpenAppSheet => {
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
                        this._nativeBridge.AppSheet.present(options).then(() => {
                            this._nativeBridge.AppSheet.destroy(options);
                        }).catch(([error]) => {
                            if (error === 'APPSHEET_NOT_FOUND') {
                                this._nativeBridge.UrlScheme.open(appStoreUrl);
                            }
                        });
                    } else {
                        this._nativeBridge.UrlScheme.open(appStoreUrl);
                    }
                });
            }
        }

        this.onOverlaySkip(parameters.videoProgress);
        this.setCallButtonEnabled(true);
    }

    private getAppStoreUrl(parameters: IVideoOverlayDownloadParameters, packageName?: string): string | undefined {
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
        return this._performanceAdUnit.getVideo();
    }

    private getOperativeEventParams(parameters: IVideoOverlayDownloadParameters): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this.getVideo()
        };
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._performanceOverlay) {
            this._performanceOverlay.setCallButtonEnabled(enabled);
        }
    }
}
