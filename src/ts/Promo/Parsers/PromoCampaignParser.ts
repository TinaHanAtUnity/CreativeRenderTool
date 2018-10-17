import { HTML } from 'Ads/Models/Assets/HTML';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { IPromoCampaign, PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { LimitedTimeOffer, ILimitedTimeOfferData } from 'Promo/Models/LimitedTimeOffer';
import { ProductInfo, ProductInfoType, IProductInfo } from 'Promo/Models/ProductInfo';

export class PromoCampaignParser extends CampaignParser {
    public static ContentType = 'purchasing/iap';
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session): Promise<Campaign> {
        const promoJson = response.getJsonContent();

        let willExpireAt: number | undefined;
        if (promoJson.expiry) {
            willExpireAt = parseInt(promoJson.expiry, 10);
        } else {
            willExpireAt = response.getCacheTTL();
        }

        const premiumProduct: ProductInfo = this.getProductInfo(promoJson);
        const baseCampaignParams: ICampaign = {
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
