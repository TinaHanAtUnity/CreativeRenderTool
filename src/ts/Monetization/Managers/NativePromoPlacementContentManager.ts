import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { Campaign } from 'Ads/Models/Campaign';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';

 export class NativePromoPlacementContentEventManager {
    private _configuration: AdsConfiguration;

    constructor(nativeBridge: NativeBridge, configuration: AdsConfiguration, nativePromoEventHandler: NativePromoEventHandler)  {
        this._configuration = configuration;

        nativeBridge.Monetization.PlacementContents.onPlacementContentCustomEvent.subscribe((placementId, data) => {
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
