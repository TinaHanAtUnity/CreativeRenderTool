import { Configuration } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { NativeBridge } from 'Native/NativeBridge';

export const enum MixedPlacementTypes {
    NON_REWARDED = '',
    PROMO = '-promo',
    REWARDED = '-rewarded',
    REWARDED_PROMO = '-rewardedpromo'
}

export class MixedPlacementUtility {

    public static isMixedPlacement(placement: Placement): boolean {
        const adTypes = placement.getAdTypes();
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

    public static createMixedPlacements(rawPlacement: any, placements: { [id: string]: Placement }) {
        const rawPlacementId: string = rawPlacement.id;
        for (const mixedPlacementSuffix of this.getMixedPlacementTypeList()) {
            rawPlacement.id = rawPlacementId + mixedPlacementSuffix;
            placements[rawPlacement.id] = new Placement(rawPlacement);
        }
    }

    public static shouldFillMixedPlacement(placementId: string, configuration: Configuration, campaign: Campaign): boolean {
        const correctSuffix = this.extractMixedPlacementSuffix(placementId, campaign, configuration);

        if (correctSuffix === MixedPlacementTypes.NON_REWARDED) {
            return !this.hasMixedPlacementSuffix(placementId, configuration);
        }

        return this.doesEndWithMixedPlacementSuffix(placementId, correctSuffix);
    }

    // SHOULD BE PRIVATE METHOD but linter won't allow this private method to be tested via following way:
    // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-2-typescript-for-private-methods-with-ja
    public static hasMixedPlacementSuffix(placementId: string, configuration: Configuration): boolean {
        const mixedList = MixedPlacementUtility.getMixedPlacementTypeList();

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

    // SHOULD BE PRIVATE METHOD but linter won't allow this private method to be tested via following way:
    // https://stackoverflow.com/questions/35987055/how-to-write-unit-testing-for-angular-2-typescript-for-private-methods-with-ja
    public static extractMixedPlacementSuffix(placementId: string, campaign: Campaign, configuration: Configuration): MixedPlacementTypes {
        let str = MixedPlacementTypes.NON_REWARDED;
        const placement = configuration.getPlacement(placementId);

        if (!this.isMixedPlacement(placement)) {
            str = MixedPlacementTypes.NON_REWARDED;
        } else if (campaign instanceof PromoCampaign) {
            if (campaign.getAllowSkip()) {
                str = MixedPlacementTypes.REWARDED_PROMO;
            } else {
                str = MixedPlacementTypes.PROMO;
            }
        } else {
            if (placement.allowSkip()) {
                str = MixedPlacementTypes.NON_REWARDED;
            } else {
                str = MixedPlacementTypes.REWARDED;
            }
        }

        return str;
    }

    private static removeEndingSuffix(placementId: string): string {
        return placementId.split('-').slice(0, -1).join('-');
    }

    private static getMixedPlacementTypeList(): string[] {
        return [MixedPlacementTypes.NON_REWARDED, MixedPlacementTypes.PROMO, MixedPlacementTypes.REWARDED, MixedPlacementTypes.REWARDED_PROMO];
    }

    private static doesEndWithMixedPlacementSuffix(placementId: string, mixedType: string): boolean {
        return placementId.split('-').length > 1 && `-${placementId.split('-').pop()}` === mixedType;
    }
}
