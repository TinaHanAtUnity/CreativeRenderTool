import { IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { IOperativeEventParams } from 'Ads/Managers/OperativeEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';

export interface IVideoOverlayDownloadParameters extends IEndScreenDownloadParameters {
    videoDuration: number;
    videoProgress: number;
}

export class PerformanceOverlayWithCTAButtonEventHandler extends PerformanceOverlayEventHandler {

    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _performanceOverlay?: AbstractVideoOverlay;
    private _platform: Platform;
    private _core: ICoreApi;

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
        super(adUnit, parameters);
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._performanceOverlay = this._performanceAdUnit.getOverlay();
    }

    public onOverlayDownload(parameters: IVideoOverlayDownloadParameters): void {
        this.setCallButtonEnabled(false);
        this._ads.Listener.sendClickEvent(this._placement.getId());
        this._thirdPartyEventManager.sendPerformanceTrackingEvent(this._campaign, ICometTrackingUrlEvents.CLICK);

        const operativeEventParameters = this.getOperativeEventParams(parameters);
        this._operativeEventManager.sendClick(operativeEventParameters);

        this.sendClickEventToKafka(parameters);

        if (this._platform === Platform.IOS) {
            this.onDownloadIos(parameters);
        } else if (this._platform === Platform.ANDROID) {
            this.onDownloadAndroid(parameters);
        }
    }

    private sendClickEventToKafka(parameters: IVideoOverlayDownloadParameters) {
        const currentSession = this._campaign.getSession();
        const kafkaObject: any = {};
        kafkaObject.type = 'video_overlay_cta_button_click';
        kafkaObject.auctionId = currentSession.getId();
        kafkaObject.number1 = parameters.videoDuration / 1000;
        kafkaObject.number2 = parameters.videoProgress / 1000;
        kafkaObject.number3 = parameters.videoProgress / parameters.videoDuration;
        HttpKafka.sendEvent('ads.sdk2.events.aui.experiments.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
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
            const isAppSheetBroken = IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion(), this._deviceInfo.getModel());
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
