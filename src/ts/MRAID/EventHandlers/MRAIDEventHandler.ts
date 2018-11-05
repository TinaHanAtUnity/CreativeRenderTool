import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { EventType } from 'Ads/Models/Session';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Request } from 'Core/Utilities/Request';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler, IOrientationProperties, MRAIDView } from 'MRAID/Views/MRAIDView';

export class MRAIDEventHandler extends GDPREventHandler implements IMRAIDViewHandler {

    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _adUnit: MRAIDAdUnit;
    private _mraidView: MRAIDView<IMRAIDViewHandler>;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _request: Request;
    private _placement: Placement;
    protected _campaign: MRAIDCampaign;

    constructor(nativeBridge: NativeBridge, adUnit: MRAIDAdUnit, parameters: IMRAIDAdUnitParameters) {
        super(parameters.gdprManager, parameters.coreConfig, parameters.adsConfig);
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._mraidView = adUnit.getMRAIDView();
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._request = parameters.request;
    }

    public onMraidClick(url: string): Promise<void> {
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());

        if (this._campaign.getClickAttributionUrl()) {  // Playable MRAID from Comet
            this.sendTrackingEvents();
            this.handleClickAttribution();
            if(!this._campaign.getClickAttributionUrlFollowsRedirects()) {
                return this._request.followRedirectChain(url).then((storeUrl) => {
                    this.openUrl(storeUrl);
                });
            }
        } else {    // DSP MRAID
            this.setCallButtonEnabled(false);
            return this._request.followRedirectChain(url).then((storeUrl) => {
                return this.openUrl(storeUrl).then(() => {
                    this.setCallButtonEnabled(true);
                    this.sendTrackingEvents();
                }).catch((e) => {
                    this.setCallButtonEnabled(true);
                    this.sendTrackingEvents();
                });
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
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                this._adUnit.getContainer().reorient(true, orientationProperties.forceOrientation);
            } else {
                this._adUnit.getContainer().reorient(orientationProperties.allowOrientationChange, orientationProperties.forceOrientation);
            }
        } else {
            this._adUnit.setOrientationProperties(orientationProperties);
        }
    }

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: any): void {
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

    private handleClickAttribution() {
        const clickAttributionUrl = this._campaign.getClickAttributionUrl();
        const useWebViewUA = this._campaign.getUseWebViewUserAgentForTracking();
        if(this._campaign.getClickAttributionUrlFollowsRedirects() && clickAttributionUrl) {
            this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, true, useWebViewUA).then(response => {
                const location = Request.getHeader(response.headers, 'location');
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
                let modifiedError = error;
                if(modifiedError instanceof RequestError) {
                    modifiedError = new DiagnosticError(new Error(modifiedError.message), {
                        request: error.nativeRequest,
                        auctionId: this._campaign.getSession().getId(),
                        url: this._campaign.getClickAttributionUrl(),
                        response: error.nativeResponse
                    });
                }
                Diagnostics.trigger('mraid_click_attribution_failed', modifiedError);
            });
        } else {
            if (clickAttributionUrl) {
                this._thirdPartyEventManager.clickAttributionEvent(clickAttributionUrl, false, useWebViewUA);
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

    private openUrl(url: string): Promise<void> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.UrlScheme.open(url);
        } else {
            return this._nativeBridge.Intent.launch({
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
}
