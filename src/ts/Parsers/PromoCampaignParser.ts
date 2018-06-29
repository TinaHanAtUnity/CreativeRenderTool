import { CampaignParser } from 'Parsers/CampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign, ICampaign } from 'Models/Campaign';
import { Request } from 'Utilities/Request';
import { JsonParser } from 'Utilities/JsonParser';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';
import { IPromoCampaign, PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { HTML } from 'Models/Assets/HTML';
import { ABGroup } from 'Models/ABGroup';

export class PromoCampaignParser extends CampaignParser {
    public static ContentType = 'purchasing/iap';
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: ABGroup): Promise<Campaign> {
        const promoJson = JsonParser.parse(response.getContent());
        if (promoJson && promoJson.iapProductId) {
            return PurchasingUtilities.refreshCatalog().then(() => {
                if (PurchasingUtilities.isProductAvailable(promoJson.iapProductId)) {

                    const baseCampaignParams: ICampaign = {
                        id: promoJson.id,
                        gamerId: gamerId,
                        abGroup: abGroup,
                        willExpireAt: promoJson.expiry ? parseInt(promoJson.expiry, 10) * 1000 : undefined,
                        adType: promoJson.contentType || response.getContentType() || undefined,
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
                    return promoCampaign;
                } else {
                    throw new Error(`Promo product id ${promoJson.iapProductId} is unavailable`);
                }
            });
        }
        throw new Error('No JSON payload for Promo Campaign');
    }
}
