import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { IMonetizationApi } from 'Monetization/IMonetization';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';

export class NativePromoPlacementContentEventManager {
    private _configuration: AdsConfiguration;

    constructor(monetization: IMonetizationApi, configuration: AdsConfiguration, nativePromoEventHandler: NativePromoEventHandler)  {
        this._configuration = configuration;

        monetization.PlacementContents.onPlacementContentCustomEvent.subscribe((placementId, data) => {
            const campaign = this.getCampaign(placementId);
            if (campaign === null) {
                return;
            }
            if (campaign instanceof PromoCampaign) {
                switch(data.type) {
                    case 'shown':
                        nativePromoEventHandler.onImpression(campaign, placementId);
                        break;
                    case 'clicked':
                        nativePromoEventHandler.onClick(campaign.getIapProductId(), campaign, placementId);
                        break;
                    case 'closed':
                        nativePromoEventHandler.onPromoClosed(campaign);
                        break;
                    default:
                }
            }
        });
    }

    private getCampaign(placementId: string): Campaign | undefined {
        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            return placement.getCurrentCampaign();
        }
        return undefined;
    }
}
