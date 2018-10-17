import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { IPlacementContentType } from 'Monetization/Native/PlacementContents';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement } from 'Ads/Models/Placement';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { FinishState } from 'Core/Constants/FinishState';
import { ProductInfo } from 'Models/Promo/ProductInfo';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';

export interface IPlacementContent {
    state: PlacementContentState;
    type: IPlacementContentType;
}

export interface IPlacementContentMap {
    [id: string]: IPlacementContent;
}

export class PlacementContentManager {
    private _nativeBridge: NativeBridge;
    private _configuration: AdsConfiguration;
    private _placementContentMap: IPlacementContentMap = {};
    private _placementManager: PlacementManager;

    constructor(nativeBridge: NativeBridge, configuration: AdsConfiguration, campaignManager: CampaignManager, placementManager: PlacementManager) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._placementManager = placementManager;
        campaignManager.onCampaign.subscribe((placementId, campaign) => this.createPlacementContent(placementId, campaign));
        campaignManager.onNoFill.subscribe((placementId) => this.onPlacementNoFill(placementId));
        nativeBridge.Purchasing.onIAPSendEvent.subscribe((eventJSON) => this.handleSendIAPEvent(eventJSON));
    }

    public createPlacementContent(placementId: string, campaign: Campaign) {
        const params = this.createPlacementContentParams(this._configuration.getPlacement(placementId), campaign);
        return this._nativeBridge.Monetization.PlacementContents.createPlacementContent(placementId, params).then(() => {
            if (!(placementId in this._placementContentMap)) {
                this._placementContentMap[placementId] = {
                    type: params.type,
                    state: PlacementContentState.WAITING
                };
            }
            const isPromoWithoutProduct = campaign instanceof PromoCampaign && !PurchasingUtilities.isProductAvailable(campaign.getIapProductId());
            if (isPromoWithoutProduct) {
                this.setPlacementContentState(placementId, PlacementContentState.WAITING);
                return this._nativeBridge.Monetization.Listener.sendPlacementContentStateChanged(placementId, PlacementContentState.NOT_AVAILABLE, PlacementContentState.WAITING);
            } else {
                this.setPlacementContentState(placementId, PlacementContentState.READY);
                return this._nativeBridge.Monetization.Listener.sendPlacementContentReady(placementId);
            }
        });
    }

    public setPlacementContentState(placementId: string, state: PlacementContentState) {
        const placementContent = this._placementContentMap[placementId];
        if (!placementContent) {
            return Promise.resolve();
        }
        const previousState = placementContent.state;
        let promise = this._nativeBridge.Monetization.PlacementContents.setPlacementContentState(placementId, state);
        placementContent.state = state;
        if (previousState !== state) {
            promise = promise.then(() => this._nativeBridge.Monetization.Listener.sendPlacementContentStateChanged(placementId, previousState, state));
        }
        return promise;
    }

    public setCurrentAdUnit(placementId: string, adUnit: AbstractAdUnit) {
        adUnit.onStart.subscribe(() => this.onAdUnitStart(placementId));
        adUnit.onClose.subscribe(() => this.onAdUnitFinish(placementId, adUnit.getFinishState()));
    }

    private createPlacementContentParams(placement: Placement, campaign: Campaign) {
        if (!(campaign instanceof PromoCampaign)) {
            return {
                type: IPlacementContentType.SHOW_AD,
                rewarded: !placement.allowSkip()
            };
        }
        const productId = campaign.getIapProductId();
        const result: any = {
            type: IPlacementContentType.PROMO_AD,
            product: {
                productId: productId
            }
        };
        const payouts = this.transformProductInfosToJSON(campaign.getPayouts());
        if (payouts.length > 0) {
            result.payouts = payouts;
        }
        const localizedPrice = PurchasingUtilities.getProductLocalizedPrice(productId);
        if (localizedPrice) {
            result.product.localizedPrice = localizedPrice;
        }

        const isoCurrencyCode = PurchasingUtilities.getProductIsoCurrencyCode(productId);
        if (isoCurrencyCode) {
            result.product.isoCurrencyCode = isoCurrencyCode;
        }
        const localizedPriceString = PurchasingUtilities.getProductPrice(productId);
        if (localizedPriceString) {
            result.product.localizedPriceString = localizedPriceString;
        }
        const localizedTitle = PurchasingUtilities.getProductName(productId);
        if (localizedTitle) {
            result.product.localizedTitle = localizedTitle;
        }
        const costs = this.transformProductInfosToJSON(campaign.getCosts());
        if (costs.length > 0) {
            result.costs = costs;
        }
        const limitedTimeOffer = campaign.getLimitedTimeOffer();
        if (limitedTimeOffer) {
            result.offerDuration = limitedTimeOffer.getDuration();
            const firstImpression = limitedTimeOffer.getFirstImpression();
            if (firstImpression) {
                result.impressionDate = firstImpression;
            }
        }
        return result;
    }

    private transformProductInfosToJSON(productInfoList: ProductInfo[]) {
        const result: any = [];
        if (productInfoList.length > 0) {
            for (const productInfo of productInfoList) {
                result.push(productInfo.getDTO());
            }
        }
        return result;
    }

    private setAdPlacementContentStates(state: PlacementContentState) {
        for (const placementId of Object.keys(this._placementContentMap)) {
            const placementContent = this._placementContentMap[placementId];
            if (placementContent.type === IPlacementContentType.SHOW_AD || placementContent.type === IPlacementContentType.PROMO_AD) {
                this.setPlacementContentState(placementId, state);
            }
        }
    }

    private onAdUnitFinish(placementId: string, finishState: FinishState) {
        return this._nativeBridge.Monetization.PlacementContents.sendAdFinished(placementId, finishState);
    }
    private onAdUnitStart(placementId: string) {
        this._nativeBridge.Monetization.PlacementContents.sendAdStarted(placementId);
        this.setAdPlacementContentStates(PlacementContentState.WAITING);
    }

    private onPlacementNoFill(placementId: string) {
        const params = this.createNoFillParams();
        return this._nativeBridge.Monetization.PlacementContents.createPlacementContent(placementId, params).then(() => {
            if (!(placementId in this._placementContentMap)) {
                this._placementContentMap[placementId] = {
                    type: params.type,
                    state: PlacementContentState.WAITING
                };
            }
            this.setPlacementContentState(placementId, PlacementContentState.NO_FILL);
        });
    }

    private createNoFillParams() {
        return {
            type: IPlacementContentType.NO_FILL
        };
    }

    private handleSendIAPEvent(iapPayload: string) {
        const jsonPayload = JSON.parse(iapPayload);

        if (jsonPayload.type === 'CatalogUpdated') {
            return PurchasingUtilities.refreshCatalog()
            .then((catalog) => this.setAllPlacementContentStates());
        } else {
            return Promise.reject();
        }
    }

    private setAllPlacementContentStates(): Promise<void> {
        const placementCampaignMap = this._placementManager.getPlacementCampaignMap('purchasing/iap');
        for (const placementId of Object.keys(placementCampaignMap)) {
            const campaign = placementCampaignMap[placementId];

            const isPromoWithoutProduct = campaign instanceof PromoCampaign && !PurchasingUtilities.isProductAvailable(campaign.getIapProductId());
            if (isPromoWithoutProduct) {
                this.setPlacementContentState(placementId, PlacementContentState.WAITING);
                this._nativeBridge.Monetization.Listener.sendPlacementContentStateChanged(placementId, PlacementContentState.NOT_AVAILABLE, PlacementContentState.WAITING);
            } else {
                this.setPlacementContentState(placementId, PlacementContentState.READY);
                this._nativeBridge.Monetization.Listener.sendPlacementContentReady(placementId);
            }
        }

        return Promise.resolve();
    }
}
