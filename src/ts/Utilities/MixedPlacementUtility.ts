import { Configuration } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';

const enum MixedPlacementTypes {
    PROMO = '-promo',
    REWARDED = '-rewarded',
    REWARDED_PROMO = '-rewardedpromo'
}

export class MixedPlacementUtility {

    public static getMixedPlacmentTypeList() {
        return ['', MixedPlacementTypes.PROMO, MixedPlacementTypes.REWARDED, MixedPlacementTypes.REWARDED_PROMO];
    }

    public static isRewardedMixedPlacement(placementId: string, configuration: Configuration): boolean {
        const notAllowsSkip: boolean = !configuration.getPlacement(placementId).allowSkip();

        return this.isMixedIAP(placementId, configuration) && notAllowsSkip;
    }

    public static isRewardedPromo(placementId: string, configuration: Configuration, campaign: Campaign): boolean {
        const allowsSkip = campaign instanceof PromoCampaign && campaign.getAllowSkip();
        return this.isMixedIAP(placementId, configuration) && allowsSkip;
    }

    public static extractMixedPlacementSuffix(placementId: string, campaign: Campaign, configuration: Configuration): string {
        let str = '';
        if (this.isRewardedMixedPlacement(placementId, configuration)) {
            str = (campaign.getAdType() === 'purchasing/iap') ? MixedPlacementTypes.PROMO : MixedPlacementTypes.REWARDED;
            configuration.getPlacements()[placementId + str] = configuration.getPlacements()[placementId];
        } else if (this.isRewardedPromo(placementId, configuration, campaign)) {
            str = (campaign.getAdType() === 'purchasing/iap') ? MixedPlacementTypes.REWARDED_PROMO : MixedPlacementTypes.REWARDED;
            configuration.getPlacements()[placementId + str] = configuration.getPlacements()[placementId];
        }

        return str;
    }

    public static checkIfPlacementsExist(placementId: string, configuration: Configuration): boolean {
        const mixedList = MixedPlacementUtility.getMixedPlacmentTypeList();

        let fixedPlacementId;

        for (const mixedType of mixedList.slice(1)) {
            if (placementId.split('-').length > 1 && `-${placementId.split('-').pop()}` === mixedType) {
                fixedPlacementId = placementId.split('-').slice(0, -1).join('-');
            }

            if (!!configuration.getPlacements()[fixedPlacementId + mixedType]) {
                return true;
            }
        }
        return false;
    }

    public static isMixedIAP(placementId: string, configuration: Configuration): boolean {
        const adTypes = configuration.getPlacement(placementId).getAdTypes();
        if (!adTypes) {
            return false;
        }
        if (adTypes.length <= 1) {
            return false;
        }
        if (adTypes.indexOf('IAP') === -1) {
            return false;
        }
        return true;
    }
}
