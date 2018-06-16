import 'mocha';
import { assert } from 'chai';
import { MixedPlacementUtility } from 'Utilities/MixedPlacementUtility';
import { Configuration } from 'Models/Configuration';
import { ConfigurationParser } from 'Parsers/ConfigurationParser';

import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

describe('MixedPlacementUtilities', () => {

    let configuration: Configuration;
    let promoSkippableCampaign: PromoCampaign;
    let promoNonSkippableCampaign: PromoCampaign;
    let interstitialCampaign: DisplayInterstitialCampaign;

    beforeEach(() => {
        configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
        interstitialCampaign = TestFixtures.getDisplayInterstitialCampaign();
        promoSkippableCampaign = TestFixtures.getPromoCampaign('purchasing/iap', true);
        promoNonSkippableCampaign = TestFixtures.getPromoCampaign('purchasing/iap', false);
    });

    describe('getPlacementTypeList', () => {
        it('should return an array of mixed placement strings', () => {
            const mixedList = MixedPlacementUtility.getMixedPlacmentTypeList();
            assert.deepEqual(mixedList, ['', '-promo', '-rewarded', '-rewardedpromo']);
        });
    });

    describe('isRewardedMixedPlacement', () => {
        it('should return true if placement has multiple adtypes, contains iap, and does not allow skip', () => {
            const placementBool = MixedPlacementUtility.isRewardedMixedPlacement(configuration.getPlacement('mixedPlacement').getId(), configuration);
            assert.isTrue(placementBool);
        });
        it('should return false if no adtype is specified', () => {
            const placementBool = MixedPlacementUtility.isRewardedMixedPlacement(configuration.getPlacement('video').getId(), configuration);
            assert.isFalse(placementBool);
        });
        it('should return false if adtype length is equal to 1', () => {
            const placementBool = MixedPlacementUtility.isRewardedMixedPlacement(configuration.getPlacement('promoPlacement').getId(), configuration);
            assert.isFalse(placementBool);
        });
        it('should return false if adtype does not contain iap', () => {
            const placementBool = MixedPlacementUtility.isRewardedMixedPlacement(configuration.getPlacement('mraid').getId(), configuration);
            assert.isFalse(placementBool);
        });
        it('should return true if placement has multiple adtypes, contains iap, and does allowskip', () => {
            const placementBool = MixedPlacementUtility.isRewardedMixedPlacement(configuration.getPlacement('rewardedPromoPlacement').getId(), configuration);
            assert.isFalse(placementBool);
        });
    });

    xdescribe('isRewardedPromo', () => {
        it('should return true if placement has multiple adtypes, contains iap, and does not allow skip', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('rewardedPromoPlacement').getId(), configuration, promoSkippableCampaign);
            assert.isTrue(placementBool);
        });
        it('should return false if no adtype is specified', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('video').getId(), configuration, promoSkippableCampaign);
            assert.isFalse(placementBool);
        });
        it('should return false if adtype length is equal to 1', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('promoPlacement').getId(), configuration, promoSkippableCampaign);
            assert.isFalse(placementBool);
        });
        it('should return false if adtype is not iap', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('mraid').getId(), configuration, promoSkippableCampaign);
            assert.isFalse(placementBool);
        });
        it('should return true if placement has multiple adtypes, contains iap, and does allowskip', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('mixedPlacement').getId(), configuration, promoSkippableCampaign);
            assert.isFalse(placementBool);
        });
    });

    xdescribe('extractMixedPlacementSuffix', () => {
        it('should return an empty string when placement is not mixed or rewarded', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('video').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '');
        });
        it('should return -promo when placement is mixed rewarded and campaign is promo ', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('mixedPlacement').getId(), promoSkippableCampaign, configuration);
            assert.equal(result, '-promo');
        });
        it('should return -rewarded when placement is mixed rewarded but campaign is not a promo', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('mixedPlacement').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '-rewarded');
        });
        it('should return -rewardedpromo when placement is mixed, allows skip, and is a promo campaign', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('rewardedPromoPlacement').getId(), promoSkippableCampaign, configuration);
            assert.equal(result, '-rewardedpromo');
        });
        it('should return -rewarded when placement is mixed, allows skip, and is not a promo campaign', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('rewardedPromoPlacement').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '-rewarded');
        });
    });

    describe('ifSuffixedPlacementsExist', () => {

        it('should return false if there is no mixedType suffix at the end of the placementid', () => {
            const result = MixedPlacementUtility.ifSuffixedPlacementsExist('mixedPlacement', configuration);
            assert.isFalse(result);
        });

        it('should return false if there is a dash suffix but is not mixedType', () => {
            const result = MixedPlacementUtility.ifSuffixedPlacementsExist('mixedPlacement-withdashes', configuration);
            assert.isFalse(result);
        });

        it('should return false if there is multiple dash suffixes but is not mixedType', () => {
            const result = MixedPlacementUtility.ifSuffixedPlacementsExist('promoPlacement-withdashes-booyah', configuration);
            assert.isFalse(result);
        });

        it('should return false if there is a dash separated mixed type that is not at the end of the placementid', () => {
            const result = MixedPlacementUtility.ifSuffixedPlacementsExist('testDashPlacement-promo-boo', configuration);
            assert.isFalse(result);
        });

        it('should return false if placement has dash separated mixed type but base id does not exist in configuration placement map', () => {
            const result = MixedPlacementUtility.ifSuffixedPlacementsExist('scooterPlacement-promo-promo', configuration);
            assert.isFalse(result);
        });

        it('should return true if placement includes at least one of the mixed placement suffixes at the end', () => {

            const result = MixedPlacementUtility.ifSuffixedPlacementsExist('testDashPlacement-rewarded', configuration);
            assert.isTrue(result);
        });

        it('should return true if a placementid already includes a dash and at least one of the mixed placement suffixes at the end', () => {

            const result = MixedPlacementUtility.ifSuffixedPlacementsExist('testDashPlacement-promo-promo', configuration);
            assert.isTrue(result);
        });
    });

    describe('doesCampaignAndConfigMatchMixedPlacement', () => {
        context('handle non promo campaign', () => {
            context('where the configuration is skippable', () => {
                it('should return true for a non-rewarded placement', () => {
                    const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('skippableMixedPlacement', configuration, interstitialCampaign);
                    assert.isTrue(result);
                });
                it('should return false for a placement with a promo suffix', () => {
                    const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('skippableMixedPlacement-promo', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
                it('should return false for a placement with a rewarded promo suffix', () => {
                    const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('skippableMixedPlacement-rewardedpromo', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
                it('should return false for a placement with a rewarded suffix', () => {
                    const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('skippableMixedPlacement-rewarded', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
            });
            context('where the configuration is non skippable', () => {
                it('should return true for a placement with the rewarded suffix', () => {
                    const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewarded', configuration, interstitialCampaign);
                    assert.isTrue(result);
                });
                it('should return false for a non rewarded placement', () => {
                    const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
                it('should return false for a placement with a rewarded promo suffix', () => {
                    const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewardedpromo', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
                it('should return false for a placement with a promo suffix', () => {
                    const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-promo', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
            });
        });
        context('handle promo campaign', () => {
            context('where the auction is skippable', () => {
                context('where the configuration is skippable', () => {
                    it('should return true for a placement with the rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoSkippableCampaign);
                        assert.isTrue(result);
                    });
                    it('should return false for a placement with a promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-promo', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a rewarded suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewarded', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                });
                context('where the configuration is non-skippable', () => {
                    it('should return true for a placement with the rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoSkippableCampaign);
                        assert.isTrue(result);
                    });
                    it('should return false for a placement with a promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-promo', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewarded', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                });
            });
            context('where the auction is non skippable', () => {
                context('where the configuration is skippable', () => {
                    it('should return true for a placement with the promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-promo', configuration, promoNonSkippableCampaign);
                        assert.isTrue(result);
                    });
                    it('should return false for a placement with a rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                });
                context('where the configuration is non-skippable', () => {
                    it('should return true for a placement with the promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-promo', configuration, promoNonSkippableCampaign);
                        assert.isTrue(result);
                    });
                    it('should return false for a placement with a rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a rewarded suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.doesCampaignAndConfigMatchMixedPlacement('mixedPlacement', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                });
            });
        });
    });
});
