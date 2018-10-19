import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { Observable0 } from 'Core/Utilities/Observable';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { Url } from 'Core/Utilities/Url';

export class NativePromoEventHandler {

    public readonly onClose = new Observable0();

    private _thirdPartyEventManager: ThirdPartyEventManager;
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, request: Request) {
        this._nativeBridge = nativeBridge;
        this._thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request, {
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

    public onPromoClosed(campaign: PromoCampaign): Promise<void> {
        this._nativeBridge.Sdk.logInfo('Closing Unity Native Promo ad unit');
        this.onClose.trigger();
        return this.sendTrackingEvent('complete', campaign);
    }

    public onClick(productId: string, campaign: PromoCampaign, placementId: string): Promise<void> {
        return this.sendClick(productId, placementId, campaign);
    }

    private sendClick(productId: string, placementId: string, campaign: PromoCampaign): Promise<void> {
        this._nativeBridge.Listener.sendClickEvent(placementId);
        this._thirdPartyEventManager.setTemplateValue('%ZONE%', placementId);
        PurchasingUtilities.onPurchase(productId, campaign, placementId, true);
        return this.sendTrackingEvent('click', campaign);
    }

    private sendTrackingEvent(eventName: string, campaign: PromoCampaign): Promise<void> {
        return this._nativeBridge.Monetization.CustomPurchasing.available().then((isAvailable) => {
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
