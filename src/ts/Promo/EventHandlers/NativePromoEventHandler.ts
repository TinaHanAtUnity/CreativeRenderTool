import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { RequestManager } from 'Core/Managers/RequestManager';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { Observable0 } from 'Core/Utilities/Observable';
import { IAdsApi } from '../../Ads/IAds';
import { ICoreApi } from '../../Core/ICore';

export class NativePromoEventHandler {

    public readonly onClose = new Observable0();

    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _core: ICoreApi;
    private _ads: IAdsApi;

    constructor(core: ICoreApi, ads: IAdsApi, clientInfo: ClientInfo, request: RequestManager) {
        this._core = core;
        this._ads = ads;
        this._thirdPartyEventManager = new ThirdPartyEventManager(core, request, {
            '%SDK_VERSION%': clientInfo.getSdkVersion().toString()
        });
    }

    public onPlacementContentIgnored(campaign: PromoCampaign) {
        // TODO: Ignore event
    }

    public onImpression(campaign: PromoCampaign, placementId: string) {
        this._thirdPartyEventManager.setTemplateValue('%ZONE%', placementId);
        return this.sendTrackingEvent('impression', campaign);
    }

    public onPromoClosed(campaign: PromoCampaign) {
        this._core.Sdk.logInfo('Closing Unity Native Promo ad unit');
        this.onClose.trigger();
        this.sendTrackingEvent('complete', campaign);
    }

    public onClick(productId: string, campaign: PromoCampaign, placementId: string) {
        return this.sendClick(productId, placementId, campaign);
    }

    private sendClick(productId: string, placementId: string, campaign: PromoCampaign) {
        this._ads.Listener.sendClickEvent(placementId);
        this._thirdPartyEventManager.setTemplateValue('%ZONE%', placementId);
        this.sendTrackingEvent('click', campaign);

        PurchasingUtilities.onPurchase(productId, campaign, placementId);
    }

    private sendTrackingEvent(eventName: string, campaign: PromoCampaign) {
        const sessionId = campaign.getSession().getId();
        let trackingEvents;
        if (campaign instanceof PromoCampaign) {
            trackingEvents = campaign.getTrackingEventUrls();
        }
        if (trackingEvents) {
            const trackingEventUrls = trackingEvents[eventName];
            if (trackingEventUrls) {
                for (const url of trackingEventUrls) {
                    this._thirdPartyEventManager.sendWithGet(eventName, sessionId, url);
                }
            }
        }
    }
}
