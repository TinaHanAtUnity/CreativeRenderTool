import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IAdsApi } from 'Ads/IAds';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { IEndScreenHandler } from 'Ads/Views/EndScreen';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export interface IEndScreenDownloadParameters {
    clickAttributionUrl: string | undefined;
    clickAttributionUrlFollowsRedirects: boolean | undefined;
    bypassAppSheet: boolean | undefined;
    appStoreId: string | undefined;
    store: StoreName | undefined;
    appDownloadUrl?: string | undefined;
    adUnitStyle?: AdUnitStyle;
}

export abstract class EndScreenEventHandler<T extends Campaign, T2 extends AbstractAdUnit> extends GDPREventHandler implements IEndScreenHandler {

    protected _platform: Platform;
    protected _core: ICoreApi;
    protected _ads: IAdsApi;
    protected _adUnit: T2;
    protected _campaign: T;
    protected _thirdPartyEventManager: ThirdPartyEventManager;

    private _operativeEventManager: OperativeEventManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _placement: Placement;

    constructor(adUnit: T2, parameters: IAdUnitParameters<T>) {
        super(parameters.gdprManager, parameters.coreConfig, parameters.adsConfig);
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._ads = parameters.ads;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
    }

    public onEndScreenDownload(parameters: IEndScreenDownloadParameters): void {
        if (this._platform === Platform.IOS) {
            this.onDownloadIos(parameters);
        } else if (this._platform === Platform.ANDROID) {
            this.onDownloadAndroid(parameters);
        }
    }

    public onEndScreenClose(): void {
        this._adUnit.hide();
    }

    public abstract onKeyEvent(keyCode: number): void;

    private onDownloadAndroid(parameters: IEndScreenDownloadParameters): void {
        this._ads.Listener.sendClickEvent(this._placement.getId());
        this._operativeEventManager.sendClick(this.getOperativeEventParams(parameters));
        if(this._campaign instanceof XPromoCampaign) {
            const clickTrackingUrls = this._campaign.getTrackingUrlsForEvent('click');
            for (const url of clickTrackingUrls) {
                this._thirdPartyEventManager.sendWithGet('xpromo click', this._campaign.getSession().getId(), url);
            }
        }

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

    private onDownloadIos(parameters: IEndScreenDownloadParameters): void {
        this._ads.Listener.sendClickEvent(this._placement.getId());

        this._operativeEventManager.sendClick(this.getOperativeEventParams(parameters));
        if(this._campaign instanceof XPromoCampaign) {
            const clickTrackingUrls = this._campaign.getTrackingUrlsForEvent('click');
            for (const url of clickTrackingUrls) {
                this._thirdPartyEventManager.sendWithGet('xpromo click', this._campaign.getSession().getId(), url);
            }
        }

        if(parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);

            if(!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters, IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion(), this._deviceInfo.getModel()));
            }
        } else {
            this.openAppStore(parameters, IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion(), this._deviceInfo.getModel()));
        }
    }

    private handleStandaloneAndroid(parameters: IEndScreenDownloadParameters) {
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

    private handleClickAttribution(parameters: IEndScreenDownloadParameters) {
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
        this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true).then(response => {
            const location = RequestManager.getHeader(response.headers, 'location');
            if (location) {
                if (this._platform === Platform.ANDROID) {
                    this._core.Android!.Intent.launch({
                        'action': 'android.intent.action.VIEW',
                        'uri': location
                    });
                } else if (this._platform === Platform.IOS) {
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

    private handleAppDownloadUrl(appDownloadUrl: string) {
        const modifiedAppDownloadUrl = decodeURIComponent(appDownloadUrl);

        this._core.Android!.Intent.launch({
            'action': 'android.intent.action.VIEW',
            'uri': modifiedAppDownloadUrl
        });
    }

    private triggerDiagnosticsError(error: any, clickAttributionUrl: string) {
        const currentSession = this._campaign.getSession();
        let diagnosticError = error;

        if (error instanceof RequestError) {
            diagnosticError = new DiagnosticError(new Error(error.message), {
                request: error.nativeRequest,
                auctionId: currentSession.getId(),
                url: clickAttributionUrl,
                response: error.nativeResponse
            });
        }
        SessionDiagnostics.trigger('click_attribution_failed', diagnosticError, currentSession);
    }

    private openAppStore(parameters: IEndScreenDownloadParameters, isAppSheetBroken?: boolean) {
        const platform = this._platform;
        let packageName: string | undefined;

        if(platform === Platform.ANDROID) {
            packageName = this._clientInfo.getApplicationName();
        }

        const appStoreUrl = this.getAppStoreUrl(parameters, packageName);
        if(!appStoreUrl) {
            Diagnostics.trigger('no_appstore_url', {
                message: 'cannot generate appstore url'
            });
            return;
        }

        if(platform === Platform.ANDROID) {
            this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': appStoreUrl
            });
        } else if(platform === Platform.IOS) {
            if(isAppSheetBroken || parameters.bypassAppSheet) {
                this._core.iOS!.UrlScheme.open(appStoreUrl);
            } else {
                this._ads.iOS!.AppSheet.canOpen().then(canOpenAppSheet => {
                    if(canOpenAppSheet) {
                        if(!parameters.appStoreId) {
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
                            if(error === 'APPSHEET_NOT_FOUND') {
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

    private getVideoOrientation(): string | undefined {
        if(this._adUnit instanceof PerformanceAdUnit || this._adUnit instanceof XPromoAdUnit) {
            return (<PerformanceAdUnit>this._adUnit).getVideoOrientation();
        }

        return undefined;
    }

    private getAppStoreUrl(parameters: IEndScreenDownloadParameters, packageName?: string): string | undefined {
        if(!parameters.appStoreId) {
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
        if(this._adUnit instanceof PerformanceAdUnit) {
            return this._adUnit.getVideo();
        }

        return undefined;
    }

    private getOperativeEventParams(parameters: IEndScreenDownloadParameters): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this.getVideo()
        };
    }
}
