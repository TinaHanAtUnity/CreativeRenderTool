import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { ICoreApi, ICore } from 'Core/ICore';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { ILimitedTimeOfferData, LimitedTimeOffer } from 'Promo/Models/LimitedTimeOffer';
import { IProductInfo, ProductInfo, ProductInfoType, IRawProductInfo } from 'Promo/Models/ProductInfo';
import { IPromoCampaign, IRawPromoCampaign, PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { PromoOrientationAsset, IPromoOrientationAsset, IRawPromoOrientationAsset } from 'Promo/Models/PromoOrientationAsset';
import { PromoAsset, IPromoAsset } from 'Promo/Models/PromoAsset';
import { Image } from 'Ads/Models/Assets/Image';
import { Font } from 'Ads/Models/Assets/Font';
import { PromoCoordinates } from 'Promo/Models/PromoCoordinatesAsset';
import { PromoSize } from 'Promo/Models/PromoSize';

export class PromoCampaignParser extends CampaignParser {

    public static ContentType = 'purchasing/iap';

    private _core: ICoreApi;

    constructor(core: ICore) {
        super(core.NativeBridge.getPlatform());
        this._core = core.Api;
    }

    public parse(response: AuctionResponse, session: Session): Promise<Campaign> {
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
                trackingUrls: response.getTrackingUrls() || {},
                backupCampaign: false
            };
            const promoCampaignParams: IPromoCampaign = {
                ... baseCampaignParams,
                limitedTimeOffer: this.getLimitedTimeOffer(promoJson),
                costs: this.getProductInfoList(promoJson.costs),
                payouts: this.getProductInfoList(promoJson.payouts),
                premiumProduct: premiumProduct,
                portraitAssets: this.getOrientationAssets(promoJson.portrait, session, this._core),
                landscapeAssets: this.getOrientationAssets(promoJson.landscape, session, this._core)
            };

            const promoCampaign = new PromoCampaign(promoCampaignParams);
            let promise = Promise.resolve();

            if (PurchasingUtilities.isInitialized() && !PurchasingUtilities.isCatalogValid()) {
                promise = PurchasingUtilities.refreshCatalog();
            }

            return promise.then(() => Promise.resolve(promoCampaign));
        } else {
            this._core.Sdk.logError('Product is undefined');
            return Promise.reject();
        }

    }

    private getOrientationAssets(orientationJSON: IRawPromoOrientationAsset, session: Session, core: ICoreApi): PromoOrientationAsset | undefined {
        if (orientationJSON === undefined) {
            return undefined;
        }
        const buttonFontJSON = orientationJSON.button.font;
        if (buttonFontJSON === undefined) {
            return undefined;
        }
        const buttonCoordinates = orientationJSON.button.coordinates;
        if (buttonCoordinates === undefined) {
            return undefined;
        }
        const buttonSize = orientationJSON.button.size;
        if (buttonSize === undefined) {
            return undefined;
        }
        const backgroundImageSize = orientationJSON.background.size;
        if (backgroundImageSize === undefined) {
            return undefined;
        }
        const buttonAssetData: IPromoAsset = {
            image: new Image(orientationJSON.button.url, session),
            font: new Font(buttonFontJSON.url, session, buttonFontJSON.family, buttonFontJSON.color, buttonFontJSON.size),
            coordinates: new PromoCoordinates(buttonCoordinates),
            size: new PromoSize(buttonSize)
        };
        const backgroundAssetData: IPromoAsset = {
            image: new Image(orientationJSON.background.url, session),
            font: undefined,
            coordinates: undefined,
            size: new PromoSize(backgroundImageSize)
        };
        const PromoOrientationAssetData: IPromoOrientationAsset = {
            buttonAsset: new PromoAsset(buttonAssetData),
            backgroundAsset: new PromoAsset(backgroundAssetData)
        };
        return new PromoOrientationAsset(PromoOrientationAssetData);
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
