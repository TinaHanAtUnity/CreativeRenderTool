import { HTML } from 'Ads/Models/Assets/HTML';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { IRawLimitedTimeOfferData, LimitedTimeOffer } from 'Promo/Models/LimitedTimeOffer';
import { IRawPromoOrientationAsset, PromoOrientationAsset } from 'Promo/Models/PromoOrientationAsset';
import { ProductInfo, IRawProductInfo } from 'Promo/Models/ProductInfo';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { Asset } from 'Ads/Models/Assets/Asset';

export interface IRawPromoCampaign {
    expiry?: string;
    creativeUrl?: string;
    dynamicMarkup: string | undefined;
    limitedTimeOffer: IRawLimitedTimeOfferData | undefined;
    costs: IRawProductInfo[];
    payouts: IRawProductInfo[];
    premiumProduct: IRawProductInfo;
    iapProductId?: string;
    portrait: IRawPromoOrientationAsset;
    landscape: IRawPromoOrientationAsset;
}

export interface IPromoCampaign extends ICampaign {
    dynamicMarkup: string | undefined;
    creativeAsset: HTML | undefined;
    limitedTimeOffer: LimitedTimeOffer | undefined;
    costs: ProductInfo[];
    payouts: ProductInfo[];
    premiumProduct: ProductInfo;
    portraitAssets: PromoOrientationAsset | undefined;
    landscapeAssets: PromoOrientationAsset | undefined;
}

export class PromoCampaign extends Campaign<IPromoCampaign> {
    constructor(campaign: IPromoCampaign) {
        super('PromoCampaign', {
            ... Campaign.Schema,
            dynamicMarkup: ['string', 'undefined'],
            creativeAsset: ['object', 'undefined'],
            portraitAssets: ['object', 'undefined'],
            landscapeAssets: ['object', 'undefined'],
            limitedTimeOffer: ['object', 'undefined'],
            payouts: ['array'],
            costs: ['array'],
            premiumProduct: ['object', 'undefined']
        }, campaign);
    }

    public isConnectionNeeded(): boolean {
        const resource = this.getCreativeResource();
        // If the static resource is not cached we will need to download it, therefore
        // a connection is necessary.
        if (resource) {
            return !resource.getFileId();
        }
        return false;
    }

    private createTrackingEventUrlsWithProductType(productType: string): { [url: string]: string[] } {
        const trackingUrls = this.get('trackingUrls');
        const result: { [url: string]: string[] } = { };
        if (trackingUrls !== undefined) {
            for (const key in trackingUrls) {
                if(trackingUrls.hasOwnProperty(key)) {
                    result[key] = [];
                    const trackingURLs = trackingUrls[key];
                    for(const trackingURL of trackingURLs) {
                        if(trackingURL) {
                            const isStagingURL = trackingURL.indexOf('events-iap.staging.unityads.unity3d.com') !== -1;
                            const isProductionURL = trackingURL.indexOf('events.iap.unity3d.com') !== -1;
                            if(isStagingURL || isProductionURL) {
                                result[key].push(trackingURL + '&productType=' + productType);
                            } else {
                                result[key].push(trackingURL);
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    public getTrackingEventUrls(): { [eventName: string]: string[] } | undefined {
        const productId = this.getIapProductId();
        const productType = PurchasingUtilities.getProductType(productId);
        if (productType === undefined) {
            return this.get('trackingUrls');
        }
        return this.createTrackingEventUrlsWithProductType(productType);
    }

    public getTrackingUrlsForEvent(event: string): string[] {
        const urls = this.getTrackingEventUrls();
        if (urls) {
            return urls[event] || [];
        }
        return [];
    }

    public getCreativeResource(): HTML | undefined {
        return this.get('creativeAsset');
    }

    public getPortraitAssets(): PromoOrientationAsset | undefined {
        return this.get('portraitAssets');
    }

    public getLandscapeAssets(): PromoOrientationAsset | undefined {
        return this.get('landscapeAssets');
    }

    public getDynamicMarkup(): string | undefined {
        return this.get('dynamicMarkup');
    }

    public getIapProductId(): string {
        return this.get('premiumProduct').getId();
    }

    public getRequiredAssets() : Asset[] {
        const assetList: Asset[] = [];
        const creativeResource = this.getCreativeResource();
        if (this.isUsingServerTemplate() && creativeResource) {
            assetList.push(creativeResource);
        } else {
            const orientationResources = this.getOrientationResources();
            for(const orientationResource of orientationResources) {
                assetList.push(orientationResource.getButtonAsset().getImage());
                assetList.push(orientationResource.getBackgroundAsset().getImage());
            }
        }
        return assetList;
    }

    public getOrientationResources(): PromoOrientationAsset[] {
        const resources = [];
        const landscape = this.getLandscapeAssets();
        if (landscape) {
           resources.push(landscape);
        }
        const portrait = this.getPortraitAssets();
        if (portrait) {
          resources.push(portrait);
        }
        return resources;
      }

    public getPayouts() : ProductInfo[] {
        return this.get('payouts');
    }

    public getCosts() : ProductInfo[] {
        return this.get('costs');
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }

    public getLimitedTimeOffer(): LimitedTimeOffer | undefined {
        return this.get('limitedTimeOffer');
    }

    public isUsingServerTemplate(): boolean {
        const orientationResources = [this.getPortraitAssets(), this.getLandscapeAssets()];
        for(const orientationResource of orientationResources) {
            if (orientationResource) {
                return false;
            }
        }
        return true;
    }
}
