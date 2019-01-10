import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { RequestError } from 'Core/Errors/RequestError';
import { Video } from 'Ads/Models/Assets/Video';
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

export interface IStoreHandler {
    onDownload(parameters: IStoreHandlerDownloadParameters): void;
}

export interface IStoreHandlerParameters {
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

export interface IStoreHandlerDownloadParameters {
    clickAttributionUrl: string | undefined;
    clickAttributionUrlFollowsRedirects: boolean | undefined;
    bypassAppSheet: boolean | undefined;
    appStoreId: string | undefined;
    store: StoreName | undefined;
    appDownloadUrl?: string | undefined;
    adUnitStyle?: AdUnitStyle;
}

export abstract class StoreHandler implements IStoreHandler {

    protected _platform: Platform;
    protected _core: ICoreApi;
    protected _ads: IAdsApi;
    protected _clientInfo: ClientInfo;
    protected _deviceInfo: DeviceInfo;
    protected _placement: Placement;
    protected _campaign: Campaign;
    protected _operativeEventManager: OperativeEventManager;
    protected _adUnit: VideoAdUnit;
    protected _coreConfig: CoreConfiguration;
    protected _currentDownloadUrl: string;

    protected _thirdPartyEventManager: ThirdPartyEventManager;

    constructor(parameters: IStoreHandlerParameters) {
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

    public onDownload(parameters: IStoreHandlerDownloadParameters): void {
        this._ads.Listener.sendClickEvent(this._placement.getId());
        const operativeEventParameters = this.getOperativeEventParams(parameters);
        this._operativeEventManager.sendClick(operativeEventParameters);
        if (this._campaign instanceof XPromoCampaign) {
            const clickTrackingUrls = this._campaign.getTrackingUrlsForEvent('click');
            for (const url of clickTrackingUrls) {
                this._thirdPartyEventManager.sendWithGet('xpromo click', this._campaign.getSession().getId(), url);
            }
        }
        //
    }

    protected handleClickAttribution(parameters: IStoreHandlerDownloadParameters) {
        if (parameters.clickAttributionUrlFollowsRedirects && parameters.clickAttributionUrl) {
            this.handleClickAttributionWithRedirects(parameters.clickAttributionUrl);
            return;
        }

        if (parameters.clickAttributionUrl) {
            this.handleClickAttributionWithoutRedirect(parameters.clickAttributionUrl);
        }
    }

    protected handleClickAttributionWithoutRedirect(clickAttributionUrl: string) {
        this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false).catch(error => {
            this.triggerDiagnosticsError(error, clickAttributionUrl);
        });
    }

    protected handleClickAttributionWithRedirects(clickAttributionUrl: string) {
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

    protected triggerDiagnosticsError(error: unknown, clickAttributionUrl: string) {
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

    protected getVideo(): Video | undefined {
        if (this._adUnit instanceof PerformanceAdUnit) {
            return this._adUnit.getVideo();
        }

        return undefined;
    }

    protected getVideoOrientation(): string | undefined {
        return this._adUnit.getVideoOrientation();
    }

    protected getOperativeEventParams(parameters: IStoreHandlerDownloadParameters): IOperativeEventParams {
        return {
            placement: this._placement,
            videoOrientation: this.getVideoOrientation(),
            adUnitStyle: parameters.adUnitStyle,
            asset: this.getVideo()
        };
    }
}
