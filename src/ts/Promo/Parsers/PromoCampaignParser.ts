import { HTML } from 'Ads/Models/Assets/HTML';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Request } from 'Core/Managers/Request';
import { IPromoCampaign, PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { Platform } from '../../Core/Constants/Platform';
import { ICoreApi } from '../../Core/Core';

export class PromoCampaignParser extends CampaignParser {
    public static ContentType = 'purchasing/iap';
    public parse(platform: Platform, core: ICoreApi, request: Request, response: AuctionResponse, session: Session): Promise<Campaign> {
        const promoJson = JsonParser.parse(response.getContent());

        const baseCampaignParams: ICampaign = {
            id: promoJson.id,
            willExpireAt: promoJson.expiry ? parseInt(promoJson.expiry, 10) * 1000 : undefined,
            adType: promoJson.contentType || response.getContentType(),
            correlationId: undefined,
            creativeId: undefined,
            seatId: undefined,
            meta: promoJson.meta,
            session: session,
            mediaId: response.getMediaId()
        };

        const promoCampaignParams: IPromoCampaign = {
            ... baseCampaignParams,
            iapProductId: promoJson.iapProductId,
            additionalTrackingEvents: response.getTrackingUrls() ? response.getTrackingUrls() : undefined,
            dynamicMarkup: promoJson.dynamicMarkup,
            creativeAsset: new HTML(promoJson.creativeUrl, session),
            rewardedPromo: promoJson.rewardedPromo ? promoJson.rewardedPromo : false
        };

        const promoCampaign = new PromoCampaign(promoCampaignParams);

        let promise = Promise.resolve();

        if (PurchasingUtilities.isInitialized() && !PurchasingUtilities.isCatalogValid()) {
            promise = PurchasingUtilities.refreshCatalog();
        }

        return promise.then(() => Promise.resolve(promoCampaign));

    }
}
