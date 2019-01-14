import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IAdsApi } from 'Ads/IAds';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { EventType } from 'Ads/Models/Session';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, IOrientationProperties, MRAIDView } from 'MRAID/Views/MRAIDView';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClickDiagnostics } from 'Ads/Utilities/ClickDiagnostics';
import { MRAIDWebViewTopCalculator } from 'MRAID/Views/MRAIDWebViewResizeUtil';

export class MRAIDEventHandler extends GDPREventHandler implements IMRAIDViewHandler {

    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _adUnit: MRAIDAdUnit;
    private _mraidView: MRAIDView<IMRAIDViewHandler>;
    private _request: RequestManager;
    private _placement: Placement;
    private _platform: Platform;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _customImpressionFired: boolean;
    private _gameSessionId?: number;
    protected _campaign: MRAIDCampaign;
    private _deviceInfo: DeviceInfo;

    constructor(adUnit: MRAIDAdUnit, parameters: IMRAIDAdUnitParameters) {
        super(parameters.privacyManager, parameters.coreConfig, parameters.adsConfig);
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._mraidView = adUnit.getMRAIDView();
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._request = parameters.request;
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._ads = parameters.ads;
        this._deviceInfo = parameters.deviceInfo;
        this._customImpressionFired = false;
        this._gameSessionId = parameters.gameSessionId;
    }

    public onMraidClick(url: string): Promise<void> {
        this._ads.Listener.sendClickEvent(this._placement.getId());

        const ctaClickedTime = Date.now();
        if (this._campaign.getClickAttributionUrl()) {  // Playable MRAID from Comet
            this.sendTrackingEvents();
            this.handleClickAttribution();
            if(!this._campaign.getClickAttributionUrlFollowsRedirects()) {
                return this._request.followRedirectChain(url).then((storeUrl) => {
                    this.openUrl(storeUrl).then(() => {
                        ClickDiagnostics.sendClickDiagnosticsEvent(Date.now() - ctaClickedTime, url, 'performance_mraid', this._campaign, this._gameSessionId);
                    });
                });
            }
        } else {    // DSP MRAID
            this.setCallButtonEnabled(false);
            return this._request.followRedirectChain(url, this._campaign.getUseWebViewUserAgentForTracking()).then((storeUrl) => {
                return this.openUrlOnCallButton(storeUrl, Date.now() - ctaClickedTime, url);
            }).catch(() => {
                return this.openUrlOnCallButton(url, Date.now() - ctaClickedTime, url);
            });
        }
        return Promise.resolve();
    }

    public onMraidReward(): void {
        this._operativeEventManager.sendThirdQuartile(this.getOperativeEventParams());
    }

    public onMraidSkip(): void {
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.hide();
    }

    public onMraidClose(): void {
        this._adUnit.setFinishState(FinishState.COMPLETED);
        this._adUnit.hide();
    }

    public onMraidOrientationProperties(orientationProperties: IOrientationProperties): void {
        if(this._adUnit.isShowing()) {
            if(this._platform === Platform.IOS) {
                this._adUnit.getContainer().reorient(true, orientationProperties.forceOrientation);
            } else {
                this._adUnit.getContainer().reorient(orientationProperties.allowOrientationChange, orientationProperties.forceOrientation);
            }
        } else {
            this._adUnit.setOrientationProperties(orientationProperties);
        }
    }

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: unknown): void {
        // no-op
    }

    public onMraidShowEndScreen(): void {
        const endScreen = this._adUnit.getEndScreen();
        if(endScreen) {
            this._adUnit.setShowingMRAID(false);
            this._adUnit.getMRAIDView().hide();
            endScreen.show();
        }
    }

    // Handles webview resizing when webview is overlaying webplayer - for privacy modal
    public onWebViewFullScreen(): Promise<void> {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()])
        .then(([width, height]) => {
            return this._adUnit.getContainer().setViewFrame('webview', 0, 0, width, height);
        });
    }

    // Handles webview resizing when webview is overlaying webplayer - for privacy modal
    public onWebViewReduceSize(): Promise<void> {
        return Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()])
        .then(([width, height]) => {
            return this._adUnit.getContainer().setViewFrame('webview', 0, 0, width, this.getTopViewHeight(width, height));
        });
    }

    public onCustomImpressionEvent(): void {
        if (!this._customImpressionFired) {
            this._adUnit.sendImpression();
            this._customImpressionFired = true;
        }
    }

    private handleClickAttribution() {
        const clickAttributionUrl = this._campaign.getClickAttributionUrl();
        if(this._campaign.getClickAttributionUrlFollowsRedirects() && clickAttributionUrl) {
            this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true, this._campaign.getUseWebViewUserAgentForTracking()).then(response => {
                const location = RequestManager.getHeader(response.headers, 'location');
                if(location) {
                    this.openUrl(location);
                } else {
                    Diagnostics.trigger('mraid_click_attribution_misconfigured', {
                        url: this._campaign.getClickAttributionUrl(),
                        followsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
                        response: response
                    });
                }
            }).catch(error => {
                if(error instanceof RequestError) {
                    error = new DiagnosticError(new Error(error.message), {
                        request: error.nativeRequest,
                        auctionId: this._campaign.getSession().getId(),
                        url: this._campaign.getClickAttributionUrl(),
                        response: error.nativeResponse
                    });
                }
                Diagnostics.trigger('mraid_click_attribution_failed', error);
            });
        } else {
            if (clickAttributionUrl) {
                this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false, this._campaign.getUseWebViewUserAgentForTracking());
            }
        }
    }

    private sendTrackingEvents() {
        const operativeEventParams: IOperativeEventParams = this.getOperativeEventParams();
        if (!this._campaign.getSession().getEventSent(EventType.THIRD_QUARTILE)) {
            this._operativeEventManager.sendThirdQuartile(operativeEventParams);
        }
        if (!this._campaign.getSession().getEventSent(EventType.VIEW)) {
            this._operativeEventManager.sendView(operativeEventParams);
        }
        if (!this._campaign.getSession().getEventSent(EventType.CLICK)) {
            this._operativeEventManager.sendClick(operativeEventParams);
        }

        this._adUnit.sendClick();
    }

    private openUrlOnCallButton(url: string, clickDuration: number, clickUrl: string): Promise<void> {
        return this.openUrl(url).then(() => {
            this.setCallButtonEnabled(true);
            this.sendTrackingEvents();

            ClickDiagnostics.sendClickDiagnosticsEvent(clickDuration, clickUrl, 'programmatic_mraid', this._campaign, this._gameSessionId);
        }).catch(() => {
            this.setCallButtonEnabled(true);
            this.sendTrackingEvents();
        });
    }

    private openUrl(url: string): Promise<void> {
        if(this._platform === Platform.IOS) {
            return this._core.iOS!.UrlScheme.open(url);
        } else {
            return this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url // todo: these come from 3rd party sources, should be validated before general MRAID support
            });
        }
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement,
            asset: this._campaign.getResourceUrl()
        };
    }

    private setCallButtonEnabled(enabled: boolean) {
        this._mraidView.setCallButtonEnabled(enabled);
    }

    private getTopViewHeight(width: number, height: number): number {
        const webViewResizer = new MRAIDWebViewTopCalculator(this._deviceInfo, this._platform);
        return webViewResizer.getTopPosition(width, height);
    }
}
