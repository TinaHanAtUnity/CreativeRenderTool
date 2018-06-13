import { Configuration } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';

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

    public static isRewardedPromo(placementId: string, configuration: Configuration): boolean {
        const allowsSkip: boolean = configuration.getPlacement(placementId).allowSkip();

        return this.isMixedIAP(placementId, configuration) && allowsSkip;
    }

    public static extractMixedPlacementSuffix(placementId: string, campaign: Campaign, configuration: Configuration): string {
        let str = '';
        if (this.isRewardedMixedPlacement(placementId, configuration)) {
            str = (campaign.getAdType() === 'purchasing/iap') ? MixedPlacementTypes.PROMO : MixedPlacementTypes.REWARDED;
            configuration.getPlacements()[placementId + str] = configuration.getPlacements()[placementId];
        } else if (this.isRewardedPromo(placementId, configuration)) {
            str = (campaign.getAdType() === 'purchasing/iap') ? MixedPlacementTypes.REWARDED_PROMO : MixedPlacementTypes.REWARDED;
            configuration.getPlacements()[placementId + str] = configuration.getPlacements()[placementId];
        }

        return str;
    }

    public static checkIfPlacementsExist(placementId: string, configuration: Configuration): boolean {
        const mixedList = MixedPlacementUtility.getMixedPlacmentTypeList();
        for (const mixedType of mixedList.slice(1)) {
            if (!!configuration.getPlacements()[placementId + mixedType]) {
                return true;
            }
        }
        return false;
    }

    private static isMixedIAP(placementId: string, configuration: Configuration): boolean {
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
