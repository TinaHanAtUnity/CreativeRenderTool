import { IEndScreenHandler } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { OperativeEventManager, IOperativeEventParams } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { StoreName, PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { IosUtils } from 'Utilities/IosUtils';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { RequestError } from 'Errors/RequestError';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { Url } from 'Utilities/Url';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { XPromoAdUnit } from 'AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Video } from 'Models/Assets/Video';
import { GDPREventHandler } from 'EventHandlers/GDPREventHandler';
import { Configuration } from 'Models/Configuration';
import { ICometTrackingUrlEvents } from 'Parsers/CometCampaignParser';

export interface IEndScreenDownloadParameters {
    clickAttributionUrl: string | undefined;
    clickAttributionUrlFollowsRedirects: boolean | undefined;
    bypassAppSheet: boolean | undefined;
    appStoreId: string | undefined;
    store: StoreName | undefined;
    adUnitStyle?: AdUnitStyle;
}

export abstract class EndScreenEventHandler<T extends Campaign, T2 extends AbstractAdUnit> extends GDPREventHandler implements IEndScreenHandler {

    protected _adUnit: T2;
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _placement: Placement;
    private _campaign: T;

    constructor(nativeBridge: NativeBridge, adUnit: T2, parameters: IAdUnitParameters<T>) {
        super(parameters.gdprManager, parameters.configuration);
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
    }

    public onEndScreenDownload(parameters: IEndScreenDownloadParameters): void {
        if (this._nativeBridge.getPlatform() === Platform.IOS) {
            this.onDownloadIos(parameters);
        } else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            this.onDownloadAndroid(parameters);
        }
    }

    public onEndScreenClose(): void {
        this._adUnit.hide();
    }

    public abstract onKeyEvent(keyCode: number): void;

    private onDownloadAndroid(parameters: IEndScreenDownloadParameters): void {
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());
        this._operativeEventManager.sendClick(this.getOperativeEventParams(parameters));
        if(this._campaign instanceof XPromoCampaign) {
            const clickTrackingUrls = this._campaign.getTrackingUrlsForEvent('click');
            for (const url of clickTrackingUrls) {
                this._thirdPartyEventManager.sendEvent('xpromo click', this._campaign.getSession().getId(), url);
            }
        } else if (this._campaign instanceof PerformanceCampaign) {
            const url = this._campaign.getVideoEventUrls()[ICometTrackingUrlEvents.CLICK];
            if (url) {
                this._thirdPartyEventManager.sendEvent(ICometTrackingUrlEvents.CLICK, this._campaign.getSession().getId(), url);
            }
        }

        if(parameters.clickAttributionUrl) {
            this.handleClickAttribution(parameters);

            if(!parameters.clickAttributionUrlFollowsRedirects) {
                this.openAppStore(parameters);
            }
        } else {
            this.openAppStore(parameters);
        }
    }

    private onDownloadIos(parameters: IEndScreenDownloadParameters): void {
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());

        this._operativeEventManager.sendClick(this.getOperativeEventParams(parameters));
        if(this._campaign instanceof XPromoCampaign) {
            const clickTrackingUrls = this._campaign.getTrackingUrlsForEvent('click');
            for (const url of clickTrackingUrls) {
                this._thirdPartyEventManager.sendEvent('xpromo click', this._campaign.getSession().getId(), url);
            }
        } else if (this._campaign instanceof PerformanceCampaign) {
            const url = this._campaign.getVideoEventUrls()[ICometTrackingUrlEvents.CLICK];
            if (url) {
                this._thirdPartyEventManager.sendEvent(ICometTrackingUrlEvents.CLICK, this._campaign.getSession().getId(), url);
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

    private handleClickAttribution(parameters: IEndScreenDownloadParameters) {
        const platform = this._nativeBridge.getPlatform();

        if (parameters.clickAttributionUrlFollowsRedirects && parameters.clickAttributionUrl) {
            const apkDownloadLink = Url.getQueryParameter(parameters.clickAttributionUrl, 'apk_download_link');
            if (apkDownloadLink && platform === Platform.ANDROID) {
                this.handleAPKDownloadLink(apkDownloadLink, parameters.clickAttributionUrl);
            } else {
                this.handleClickAttributionWithRedirects(parameters.clickAttributionUrl, parameters.clickAttributionUrlFollowsRedirects);
            }
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

    private handleAPKDownloadLink(apkDownloadLink: string, clickAttributionUrl: string) {
        this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false).catch(error => {
            this.triggerDiagnosticsError(error, clickAttributionUrl);
        });

        if (this._nativeBridge.getApiLevel() >= 21) {
            // Using WEB_SEARCH bypasses some security check for directly downloading .apk files
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.WEB_SEARCH',
                'extras': [
                    {
                        'key': 'query',
                        'value': apkDownloadLink
                    }
                ]
            });
        } else {
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': apkDownloadLink
            });
        }
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
        Diagnostics.trigger('click_attribution_failed', error, currentSession);
    }

    private openAppStore(parameters: IEndScreenDownloadParameters, isAppSheetBroken?: boolean) {
        const platform = this._nativeBridge.getPlatform();
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
            this._nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': appStoreUrl
            });
        } else if(platform === Platform.IOS) {
            if(isAppSheetBroken || parameters.bypassAppSheet) {
                this._nativeBridge.UrlScheme.open(appStoreUrl);
            } else {
                this._nativeBridge.AppSheet.canOpen().then(canOpenAppSheet => {
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
                        this._nativeBridge.AppSheet.present(options).then(() => {
                            this._nativeBridge.AppSheet.destroy(options);
                        }).catch(([error]) => {
                            if(error === 'APPSHEET_NOT_FOUND') {
                                this._nativeBridge.UrlScheme.open(appStoreUrl);
                            }
                        });
                    } else {
                        this._nativeBridge.UrlScheme.open(appStoreUrl);
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
                return 'migamecenter://details?pkgname=' + parameters.appStoreId + '&channel=unityAds&from=' + packageName + '&trace=' + this._configuration.getToken();
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
