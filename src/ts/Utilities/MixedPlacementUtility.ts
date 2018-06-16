import { Configuration } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { NativeBridge } from 'Native/NativeBridge';

export const enum MixedPlacementTypes {
    PROMO = '-promo',
    REWARDED = '-rewarded',
    REWARDED_PROMO = '-rewardedpromo',
    NON_REWARDED = ''
}

export class MixedPlacementUtility {

    public static nativeBridge: NativeBridge;

    public static getMixedPlacmentTypeList(): string[] {
        return [MixedPlacementTypes.NON_REWARDED, MixedPlacementTypes.PROMO, MixedPlacementTypes.REWARDED, MixedPlacementTypes.REWARDED_PROMO];
    }

    public static isRewardedMixedPlacement(placementId: string, configuration: Configuration): boolean {
        const notAllowsSkip: boolean = !configuration.getPlacement(placementId).allowSkip();

        return this.isMixedIAP(placementId, configuration) && notAllowsSkip;
    }

    public static isRewardedPromo(placementId: string, configuration: Configuration, campaign: Campaign): boolean {
        const allowsSkip = campaign instanceof PromoCampaign && campaign.getAllowSkip();
        return this.isMixedIAP(placementId, configuration) && allowsSkip;
    }

    public static extractMixedPlacementSuffix(placementId: string, campaign: Campaign, configuration: Configuration): MixedPlacementTypes {
        let str = MixedPlacementTypes.NON_REWARDED;

        if (!this.isMixedIAP(placementId, configuration)) {
            str = MixedPlacementTypes.NON_REWARDED;
        } else if (campaign instanceof PromoCampaign) {
            if (campaign.getAllowSkip()) {
                str = MixedPlacementTypes.REWARDED_PROMO;
            } else {
                str = MixedPlacementTypes.PROMO;
            }
        } else {
            if (configuration.getPlacement(placementId).allowSkip()) {
                str = MixedPlacementTypes.NON_REWARDED;
            } else {
                str = MixedPlacementTypes.REWARDED;
            }
        }

        return str;
    }

    public static ifSuffixedPlacementsExist(placementId: string, configuration: Configuration): boolean {
        const mixedList = MixedPlacementUtility.getMixedPlacmentTypeList();

        let fixedPlacementId;

        for (const mixedType of mixedList.slice(1)) {
            if (this.doesEndWithMixedPlacementSuffix(placementId, mixedType)) {
                fixedPlacementId = this.removeEndingSuffix(placementId);
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

    public static isMixedIAP2(adTypes: any): boolean {
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

    public static doesEndWithMixedPlacementSuffix(placementId: string, mixedType: string): boolean {
        return placementId.split('-').length > 1 && `-${placementId.split('-').pop()}` === mixedType;
    }

    public static doesCampaignAndConfigMatchMixedPlacement(placementId: string, configuration: Configuration, campaign: Campaign): boolean {
        const correctSuffix = this.extractMixedPlacementSuffix(placementId, campaign, configuration);

        if (correctSuffix === MixedPlacementTypes.NON_REWARDED) {
            return !this.ifSuffixedPlacementsExist(placementId, configuration);
        }

        return this.doesEndWithMixedPlacementSuffix(placementId, correctSuffix);
    }

    private static removeEndingSuffix(placementId: string): string {
        return placementId.split('-').slice(0, -1).join('-');
    }
}
