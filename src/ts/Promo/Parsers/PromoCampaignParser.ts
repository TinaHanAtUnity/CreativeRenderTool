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
import { IProductInfo, ProductInfo, ProductInfoType, IRawProductInfo } from 'Promo/Models/ProductInfo';
import { IPromoCampaign, IRawPromoCampaign, PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';

export class PromoCampaignParser extends CampaignParser {

    public static ContentType = 'purchasing/iap';

    public parse(platform: Platform, core: ICoreApi, request: RequestManager, response: AuctionResponse, session: Session): Promise<Campaign> {
        const promoJson = JsonParser.parse<IRawPromoCampaign>(response.getContent());

        let willExpireAt: number | undefined;
        if (promoJson.expiry) {
            willExpireAt = parseInt(promoJson.expiry, 10);
        } else {
            willExpireAt = response.getCacheTTL();
        }

        const premiumProduct = this.getRootProductInfo(promoJson);

        if (premiumProduct) {
            const baseCampaignParams: ICampaign = {
                contentType: PromoCampaignParser.ContentType,
                id: premiumProduct.getId(),
                willExpireAt: willExpireAt ? Date.now() + (willExpireAt * 1000) : undefined,
                adType: response.getContentType(),
                correlationId: undefined,
                creativeId: response.getCreativeId() || undefined,
                seatId: response.getSeatId() || undefined,
                meta: undefined,
                session: session,
                mediaId: response.getMediaId(),
                trackingUrls: response.getTrackingUrls() || {}
            };
            const promoCampaignParams: IPromoCampaign = {
                ... baseCampaignParams,
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
        } else {
            core.Sdk.logError('Product is undefined');
            return Promise.reject();
        }

    }

    private getLimitedTimeOffer(promoJson: IRawPromoCampaign): LimitedTimeOffer | undefined {
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

    private getProductInfoList(promoProductInfoJson?: IRawProductInfo[]): ProductInfo[] {
        const productInfoList: ProductInfo[] = [];
        if (promoProductInfoJson === undefined) {
            return productInfoList;
        }
        for (const promoJsonCost of promoProductInfoJson) {
            const productInfo = this.getProductInfo(promoJsonCost);
            if (productInfo) {
                productInfoList.push(productInfo);
            }
        }
        return productInfoList;
    }

    private getRootProductInfo(promoJson: IRawPromoCampaign): ProductInfo | undefined {
        let productInfo: IProductInfo | undefined;
        if (promoJson.premiumProduct) {
            const promoProductJson = promoJson.premiumProduct;
            return this.getProductInfo(promoProductJson);
        } else if (promoJson.iapProductId) {
            productInfo = {
                productId: promoJson.iapProductId,
                quantity: 1,
                type: ProductInfoType.PREMIUM
            };
            return new ProductInfo(productInfo);
        }
        return undefined;
    }

    private getProductInfo(promoJson: IRawProductInfo): ProductInfo {
        let productInfo: IProductInfo;
        productInfo = {
            productId: promoJson.productId,
            type: promoJson.type === 'PREMIUM' ? ProductInfoType.PREMIUM : ProductInfoType.VIRTUAL,
            quantity: promoJson.quantity
        };
        return new ProductInfo(productInfo);
    }
}
