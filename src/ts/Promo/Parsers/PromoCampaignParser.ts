import { HTML } from 'Ads/Models/Assets/HTML';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { ILimitedTimeOfferData, LimitedTimeOffer } from 'Promo/Models/LimitedTimeOffer';
import { IProductInfo, ProductInfo, ProductInfoType } from 'Promo/Models/ProductInfo';
import { IPromoCampaign, PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';

export class PromoCampaignParser extends CampaignParser {

    public static ContentType = 'purchasing/iap';

    public getContentTypes() {
        return [PromoCampaignParser.ContentType];
    }

    public parse(platform: Platform, core: ICoreApi, request: RequestManager, response: AuctionResponse, session: Session): Promise<Campaign> {
        const promoJson = JsonParser.parse(response.getContent());

        let willExpireAt: number | undefined;
        if (promoJson.expiry) {
            willExpireAt = parseInt(promoJson.expiry, 10);
        } else {
            willExpireAt = response.getCacheTTL();
        }

        const premiumProduct: ProductInfo = this.getProductInfo(promoJson);
        const baseCampaignParams: ICampaign = {
            contentType: PromoCampaignParser.ContentType,
            id: premiumProduct.getId(),
            willExpireAt: willExpireAt ? Date.now() + (willExpireAt * 1000) : undefined,
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
            additionalTrackingEvents: response.getTrackingUrls() ? response.getTrackingUrls() : undefined,
            dynamicMarkup: promoJson.dynamicMarkup,
            creativeAsset: promoJson.creativeUrl ? new HTML(promoJson.creativeUrl, session) : undefined,
            rewardedPromo: promoJson.rewardedPromo || false,
            limitedTimeOffer: this.getLimitedTimeOffer(promoJson),
            costs: this.getProductInfoList(promoJson.costs),
            payouts: this.getProductInfoList(promoJson.payouts),
            premiumProduct: premiumProduct
        };
        const promoCampaign = new PromoCampaign(promoCampaignParams);
        let promise = Promise.resolve();
        if (PurchasingUtilities.isInitialized() && !PurchasingUtilities.isCatalogValid()) {
            promise = PurchasingUtilities.refreshCatalog();
        }
        return promise.then(() => Promise.resolve(promoCampaign));

    }

    private getLimitedTimeOffer(promoJson: any): LimitedTimeOffer | undefined {
        let limitedTimeOffer: LimitedTimeOffer | undefined;
        if (promoJson.limitedTimeOffer) {
            const firstImpressionEpoch = promoJson.limitedTimeOffer.firstImpression;
            let firstImpressionDate: Date | undefined;
            if (firstImpressionEpoch) {
                firstImpressionDate = new Date(0); // 0 sets the date to epoch
                firstImpressionDate.setUTCSeconds(firstImpressionEpoch);
            }
            const limitedTimeOfferData: ILimitedTimeOfferData = {
                duration: promoJson.limitedTimeOffer.duration,
                firstImpression: firstImpressionDate
            };
            limitedTimeOffer = new LimitedTimeOffer(limitedTimeOfferData);
        }
        return limitedTimeOffer;
    }

    private getProductInfoList(promoProductInfoJson: [any]): ProductInfo[] {
        const productInfoList = new Array<ProductInfo>();
        if (promoProductInfoJson === undefined) {
            return productInfoList;
        }
        for (const promoJsonCost of promoProductInfoJson) {
            productInfoList.push(this.getProductInfo(promoJsonCost));
        }
        return productInfoList;
    }

    private getProductInfo(promoJson: any) {
        let productInfo: IProductInfo;
        if (promoJson.premiumProduct) {
            const promoProductJson = promoJson.premiumProduct;
            productInfo = {
                productId: promoProductJson.productId,
                type: promoProductJson.type === 'PREMIUM' ? ProductInfoType.PREMIUM : ProductInfoType.VIRTUAL,
                quantity: promoProductJson.quantity
            };
        } else {
            productInfo = {
                productId: promoJson.iapProductId,
                quantity: 1,
                type: ProductInfoType.PREMIUM
            };
        }
        return new ProductInfo(productInfo);
    }
}
