import { IAdsApi } from 'Ads/IAds';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Observable0 } from 'Core/Utilities/Observable';
import { Url } from 'Core/Utilities/Url';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { IPurchasingApi } from 'Purchasing/IPurchasing';

export class NativePromoEventHandler {

    public readonly onClose = new Observable0();

    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _purchasing: IPurchasingApi;

    constructor(core: ICoreApi, ads: IAdsApi, purchasing: IPurchasingApi, clientInfo: ClientInfo, request: RequestManager) {
        this._core = core;
        this._ads = ads;
        this._purchasing = purchasing;
        this._thirdPartyEventManager = new ThirdPartyEventManager(core, request, {
            '%SDK_VERSION%': clientInfo.getSdkVersion().toString()
        });
    }

    public onPlacementContentIgnored(campaign: PromoCampaign) {
        // TODO: Ignore event
    }

    public onImpression(campaign: PromoCampaign, placementId: string): Promise<void> {
        this._thirdPartyEventManager.setTemplateValue('%ZONE%', placementId);
        return this.sendTrackingEvent('impression', campaign);
    }

    public onPromoClosed(campaign: PromoCampaign) {
        this._core.Sdk.logInfo('Closing Unity Native Promo ad unit');
        this.onClose.trigger();
        return this.sendTrackingEvent('complete', campaign);
    }

    public onClick(productId: string, campaign: PromoCampaign, placementId: string): Promise<void> {
        return this.sendClick(productId, placementId, campaign);
    }

    private sendClick(productId: string, placementId: string, campaign: PromoCampaign) {
        this._ads.Listener.sendClickEvent(placementId);
        this._thirdPartyEventManager.setTemplateValue('%ZONE%', placementId);
        PurchasingUtilities.onPurchase(productId, campaign, placementId, true);
        return this.sendTrackingEvent('click', campaign);
    }

    private sendTrackingEvent(eventName: string, campaign: PromoCampaign): Promise<void> {
        return this._purchasing.CustomPurchasing.available().then((isAvailable) => {
            const sessionId = campaign.getSession().getId();
            let trackingEvents;
            if (campaign instanceof PromoCampaign) {
                trackingEvents = campaign.getTrackingEventUrls();
            }
            if (trackingEvents) {
                const trackingEventUrls = trackingEvents[eventName].map((value: string): string => {
                    // add native flag true to designate native promo
                    if (PromoEvents.purchaseHostnameRegex.test(value)) {
                        return Url.addParameters(value, {'native': true, 'iap_service': !isAvailable});
                    }
                    return value;
                });
                if (trackingEventUrls) {
                    for (const url of trackingEventUrls) {
                        this._thirdPartyEventManager.sendWithGet(eventName, sessionId, url);
                    }
                }
            }
        });
    }
}
