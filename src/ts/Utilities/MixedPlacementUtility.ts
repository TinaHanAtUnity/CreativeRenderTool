import { Configuration } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { NativeBridge } from 'Native/NativeBridge';

export const enum MixedPlacementTypes {
    PROMO = '-promo',
    REWARDED = '-rewarded',
    REWARDED_PROMO = '-rewardedpromo'
}

export class MixedPlacementUtility {

    public static nativeBridge: NativeBridge;

    public static getMixedPlacmentTypeList(): string[] {
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

        if (this.isMixedIAP(placementId, configuration)) {
            if (campaign instanceof PromoCampaign) {
                if (!campaign.getAllowSkip()) {
                    str = MixedPlacementTypes.PROMO;
                } else {
                    str = MixedPlacementTypes.REWARDED_PROMO;
                }
            } else {
                if (!configuration.getPlacement(placementId).allowSkip()) {
                    str = MixedPlacementTypes.REWARDED;
                } else if (this.doesEndWithMixedPlacementSuffix(placementId, MixedPlacementTypes.REWARDED) ) {
                    return 'BAD';
                }
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
        this.nativeBridge.Sdk.logInfo('tinder: correctSuffix: ' + correctSuffix + ' for placementID: ' + placementId);
        if (correctSuffix === '') {
            return true;
        }
        if (correctSuffix === 'BAD') {
            return false;
        }

        // return true;
        return this.doesEndWithMixedPlacementSuffix(placementId, correctSuffix);
    }

    private static removeEndingSuffix(placementId: string): string {
        return placementId.split('-').slice(0, -1).join('-');
    }
}
