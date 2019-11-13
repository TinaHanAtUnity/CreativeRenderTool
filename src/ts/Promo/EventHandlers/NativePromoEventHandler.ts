import { IAdsApi } from 'Ads/IAds';
import { ThirdPartyEventManager, ThirdPartyEventMacro, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { IThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManagerFactory';
import { ICoreApi } from 'Core/ICore';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { Observable0 } from 'Core/Utilities/Observable';
import { Url } from 'Core/Utilities/Url';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';

export class NativePromoEventHandler {

    public readonly onClose = new Observable0();

    private _thirdPartyEventManager: Promise<ThirdPartyEventManager>;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _purchasing: IPurchasingApi;
    private _metadataManager: MetaDataManager;
    private _clientInfo: ClientInfo;
    private _thirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;

    constructor(core: ICoreApi, ads: IAdsApi, purchasing: IPurchasingApi, clientInfo: ClientInfo, thirdPartyEventManagerFactory: IThirdPartyEventManagerFactory, metadataManager: MetaDataManager) {
        this._core = core;
        this._ads = ads;
        this._purchasing = purchasing;
        this._clientInfo = clientInfo;
        this._thirdPartyEventManagerFactory = thirdPartyEventManagerFactory;
        this._metadataManager = metadataManager;
    }

    public onPlacementContentIgnored(campaign: PromoCampaign) {
        // TODO: Ignore event
    }

    public onImpression(campaign: PromoCampaign, placementId: string): Promise<void> {
        // reset thirdParteEventManager on each impression
        this._thirdPartyEventManager = this._metadataManager.fetch(PlayerMetaData, false).then((playerMetadata) => {
            let playerMetadataServerId: string | undefined;
            if (playerMetadata) {
                playerMetadataServerId = playerMetadata.getServerId();
            }
            return this._thirdPartyEventManagerFactory.create({
                [ThirdPartyEventMacro.ZONE]: placementId,
                [ThirdPartyEventMacro.SDK_VERSION]: this._clientInfo.getSdkVersion().toString(),
                [ThirdPartyEventMacro.GAMER_SID]: playerMetadataServerId || ''
            });
        });
        return this.sendTrackingEvent(TrackingEvent.IMPRESSION, campaign);
    }

    public onPromoClosed(campaign: PromoCampaign) {
        this._core.Sdk.logInfo('Closing Unity Native Promo ad unit');
        this.onClose.trigger();
        return this.sendTrackingEvent(TrackingEvent.COMPLETE, campaign);
    }

    public onClick(productId: string, campaign: PromoCampaign, placementId: string): Promise<void> {
        return this.sendClick(productId, placementId, campaign);
    }

    private sendClick(productId: string, placementId: string, campaign: PromoCampaign) {
        this._ads.Listener.sendClickEvent(placementId);
        this._thirdPartyEventManager.then((thirdPartyEventManager) => {
            PurchasingUtilities.onPurchase(thirdPartyEventManager, productId, campaign, true);
        });
        return this.sendTrackingEvent(TrackingEvent.CLICK, campaign);
    }

    private sendTrackingEvent(event: TrackingEvent, campaign: PromoCampaign): Promise<void> {
        return this._purchasing.CustomPurchasing.available().then((isAvailable) => {
            const sessionId = campaign.getSession().getId();
            let trackingEventUrls = campaign.getTrackingUrlsForEvent(event);

            trackingEventUrls = trackingEventUrls.map((value: string): string => {
                // add native flag true to designate native promo
                if (PromoEvents.purchaseHostnameRegex.test(value)) {
                    return Url.addParameters(value, { 'native': true, 'iap_service': !isAvailable });
                }
                return value;
            });
            for (const url of trackingEventUrls) {
                this._thirdPartyEventManager.then((thirdPartyEventManager) => {
                    thirdPartyEventManager.sendWithGet(event, sessionId, url);
                });
            }
        });
    }

}
