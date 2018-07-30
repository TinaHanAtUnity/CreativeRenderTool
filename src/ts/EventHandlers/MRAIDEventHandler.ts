import { IMRAIDViewHandler, IOrientationProperties } from 'Views/MRAIDView';
import { HttpKafka, KafkaCommonObjectType } from 'Utilities/HttpKafka';
import { NativeBridge } from 'Native/NativeBridge';
import { OperativeEventManager, IOperativeEventParams } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { EventType } from 'Models/Session';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { Request } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { Diagnostics } from 'Utilities/Diagnostics';
import { RequestError } from 'Errors/RequestError';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { FinishState } from 'Constants/FinishState';
import { Placement } from 'Models/Placement';
import { ABGroup, CTAOpenUrlAbTest } from 'Models/ABGroup';
import { GDPREventHandler } from 'EventHandlers/GDPREventHandler';

export class MRAIDEventHandler extends GDPREventHandler implements IMRAIDViewHandler {

    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _adUnit: MRAIDAdUnit;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _campaign: MRAIDCampaign;
    private _request: Request;
    private _placement: Placement;
    private _abGroup: ABGroup;

    constructor(nativeBridge: NativeBridge, adUnit: MRAIDAdUnit, parameters: IMRAIDAdUnitParameters) {
        super(parameters.gdprManager, parameters.configuration);
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._adUnit = adUnit;
        this._clientInfo = parameters.clientInfo;
        this._deviceInfo = parameters.deviceInfo;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._request = parameters.request;
        this._abGroup = parameters.configuration.getAbGroup();
    }

    public onMraidClick(url: string): Promise<void> {
        this._nativeBridge.Listener.sendClickEvent(this._placement.getId());

        if(this._campaign.getClickAttributionUrl()) {
            this.handleClickAttribution();
            if(!this._campaign.getClickAttributionUrlFollowsRedirects()) {
                this.openClickUrl(url);
            }
        } else {
            this.openClickUrl(url);
        }
        this.sendTrackingEvents();

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

    public onMraidAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: any): void {
        const kafkaObject: any = {};
        kafkaObject.type = event;
        kafkaObject.eventData = eventData;
        kafkaObject.timeFromShow = timeFromShow;
        kafkaObject.timeFromPlayableStart = timeFromPlayableStart;
        kafkaObject.backgroundTime = backgroundTime;

        const resourceUrl = this._campaign.getResourceUrl();
        if(resourceUrl) {
            kafkaObject.url = resourceUrl.getOriginalUrl();
        }
        HttpKafka.sendEvent('ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
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

    private openClickUrl(url: string): Promise<void> {
        if (CTAOpenUrlAbTest.isValid(this._abGroup)) {
            return this.openUrl(url);
        }
        return this.followUrl(url).then((storeUrl) => {
            return this.openUrl(storeUrl);
        });
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

    // Follows the redirects of a URL, returning the final location.
    private followUrl(link: string): Promise<string> {
        return this._request.followRedirectChain(link);
    }

    private getOperativeEventParams(): IOperativeEventParams {
        return {
            placement: this._placement,
            asset: this._campaign.getResourceUrl()
        };
    }
}
