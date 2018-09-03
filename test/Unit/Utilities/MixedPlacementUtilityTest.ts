import { Placement } from 'Ads/Models/Placement';
import { MixedPlacementUtility } from 'Ads/Utilities/MixedPlacementUtility';
import { assert } from 'chai';
import { Platform } from 'Common/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Configuration } from 'Core/Models/Configuration';
import { ConfigurationParser } from 'Core/Parsers/ConfigurationParser';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import MixedPlacementAuctionResponse from 'json/MixedPlacementAuctionResponse.json';
import 'mocha';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('MixedPlacementUtilities', () => {

    let configuration: Configuration;
    let promoSkippableCampaign: PromoCampaign;
    let promoNonSkippableCampaign: PromoCampaign;
    let interstitialCampaign: DisplayInterstitialCampaign;
    let clientInfo: ClientInfo;
    let configurationPromoPlacementsJson: any;
    let campaignRawPlacements: { [placementName: string]: string };

    beforeEach(() => {
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID, '1543512');
        configurationPromoPlacementsJson = JSON.parse(ConfigurationPromoPlacements);
        configuration = ConfigurationParser.parse(configurationPromoPlacementsJson, clientInfo);
        interstitialCampaign = TestFixtures.getDisplayInterstitialCampaign();
        promoSkippableCampaign = TestFixtures.getPromoCampaign('purchasing/iap', true);
        promoNonSkippableCampaign = TestFixtures.getPromoCampaign('purchasing/iap', false);
        campaignRawPlacements = JSON.parse(MixedPlacementAuctionResponse).placements;
    });

    describe('isMixedPlacement', () => {
        it('should return true for a mixed placement', () => {
            const placement = configuration.getPlacement('mixedPlacement');
            assert.isTrue(MixedPlacementUtility.isMixedPlacement(placement));
        });
        it('should return false for a non-mixed placement', () => {
            const placement = configuration.getPlacement('premium');
            assert.isFalse(MixedPlacementUtility.isMixedPlacement(placement));
        });
    });

    describe('insertMediaIdsIntoJSON', () => {
        it('should create additional placements within raw campaign json response associated with the correct media ids', () => {
            const jsonMixedPlacements = MixedPlacementUtility.insertMediaIdsIntoJSON(configuration, campaignRawPlacements);
            const getMixedPlacementTypeList = 'getMixedPlacementTypeList';
            const suffixList = MixedPlacementUtility[getMixedPlacementTypeList]();
            for (const suffix of suffixList) {
                assert.equal(jsonMixedPlacements['mixedPlacement' + suffix], '1111111111111111111111');
            }
            assert.equal(jsonMixedPlacements['video' + ''], '000000000000000000000000');
            assert.lengthOf(Object.keys(jsonMixedPlacements), 5);
        });
    });

    describe('extractMixedPlacementSuffix', () => {
        const extractMixedPlacementSuffix = 'extractMixedPlacementSuffix';

        it('should return an empty string when placement is not mixed', () => {
            const result = MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('video').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '');
        });
        it('should return empty string when placement is mixed, allows skip in configuration, and is not a promo campaign', () => {
            const result = MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('rewardedPromoPlacement-rewardedpromo').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '');
        });
        it('should return -rewarded when placement is mixed, nonskippable in config, and campaign is not a promo', () => {
            const result = MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('mixedPlacement').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '-rewarded');
        });
        it('should return -promo when placement is mixed, does not allow skip in campaign, and campaign is promo ', () => {
            const result = MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('mixedPlacement').getId(), promoNonSkippableCampaign, configuration);
            assert.equal(result, '-promo');
        });
        it('should return -rewardedpromo when placement is mixed, allows skip in campaign, and is a promo campaign', () => {
            const result = MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('rewardedPromoPlacement-rewardedpromo').getId(), promoSkippableCampaign, configuration);
            assert.equal(result, '-rewardedpromo');
        });
        it('should return -promo when placement is mixed, does not allow skip in campaign, and campaign is promo even if allows skip in config is true', () => {
            const result = MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('skippableMixedPlacement').getId(), promoNonSkippableCampaign, configuration);
            assert.equal(result, '-promo');
        });
        it('should return -rewardedpromo when placement is mixed, allows skip in campaign, and is a promo campaign, even if allows skip in config is false', () => {
            const result = MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('mixedPlacement-promo').getId(), promoSkippableCampaign, configuration);
            assert.equal(result, '-rewardedpromo');
        });
    });

    describe('hasMixedPlacementSuffix', () => {
        const hasMixedPlacementSuffix = 'hasMixedPlacementSuffix';

        it('should return false if there is no mixedType suffix at the end of the placementid', () => {
            const result = MixedPlacementUtility[hasMixedPlacementSuffix]('mixedPlacement', configuration);
            assert.isFalse(result);
        });

        it('should return false if there is a dash suffix but is not mixedType', () => {
            const result = MixedPlacementUtility[hasMixedPlacementSuffix]('mixedPlacement-withdashes', configuration);
            assert.isFalse(result);
        });

        it('should return false if there is multiple dash suffixes but is not mixedType', () => {
            const result = MixedPlacementUtility[hasMixedPlacementSuffix]('promoPlacement-withdashes-booyah', configuration);
            assert.isFalse(result);
        });

        it('should return false if there is a dash separated mixed type that is not at the end of the placementid', () => {
            const result = MixedPlacementUtility[hasMixedPlacementSuffix]('testDashPlacement-promo-boo', configuration);
            assert.isFalse(result);
        });

        it('should return false if placement has dash separated mixed type but base id does not exist in configuration placement map', () => {
            const result = MixedPlacementUtility[hasMixedPlacementSuffix]('scooterPlacement-promo-promo', configuration);
            assert.isFalse(result);
        });

        it('should return true if placement includes at least one of the mixed placement suffixes at the end', () => {
            const result = MixedPlacementUtility[hasMixedPlacementSuffix]('testDashPlacement-rewarded', configuration);
            assert.isTrue(result);
        });

        it('should return true if a placementid already includes a dash and at least one of the mixed placement suffixes at the end', () => {

            const result = MixedPlacementUtility[hasMixedPlacementSuffix]('testDashPlacement-promo-promo', configuration);
            assert.isTrue(result);
        });
    });

    describe('shouldFillMixedPlacement', () => {
        context('handle non promo campaign', () => {
            context('where the configuration is skippable', () => {
                it('should return true for a non-rewarded placement', () => {
                    const result = MixedPlacementUtility.shouldFillMixedPlacement('skippableMixedPlacement', configuration, interstitialCampaign);
                    assert.isTrue(result);
                });
                it('should return false for a placement with a promo suffix', () => {
                    const result = MixedPlacementUtility.shouldFillMixedPlacement('skippableMixedPlacement-promo', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
                it('should return false for a placement with a rewarded promo suffix', () => {
                    const result = MixedPlacementUtility.shouldFillMixedPlacement('skippableMixedPlacement-rewardedpromo', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
                it('should return false for a placement with a rewarded suffix', () => {
                    const result = MixedPlacementUtility.shouldFillMixedPlacement('skippableMixedPlacement-rewarded', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
            });
            context('where the configuration is non skippable', () => {
                it('should return true for a placement with the rewarded suffix', () => {
                    const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, interstitialCampaign);
                    assert.isTrue(result);
                });
                it('should return false for a non rewarded placement', () => {
                    const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
                it('should return false for a placement with a rewarded promo suffix', () => {
                    const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewardedpromo', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
                it('should return false for a placement with a promo suffix', () => {
                    const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, interstitialCampaign);
                    assert.isFalse(result);
                });
            });
        });
        context('handle promo campaign', () => {
            context('where the auction is skippable', () => {
                context('where the configuration is skippable', () => {
                    it('should return true for a placement with the rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoSkippableCampaign);
                        assert.isTrue(result);
                    });
                    it('should return false for a placement with a promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a rewarded suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                });
                context('where the configuration is non-skippable', () => {
                    it('should return true for a placement with the rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoSkippableCampaign);
                        assert.isTrue(result);
                    });
                    it('should return false for a placement with a promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, promoSkippableCampaign);
                        assert.isFalse(result);
                    });
                });
            });
            context('where the auction is non skippable', () => {
                context('where the configuration is skippable', () => {
                    it('should return true for a placement with the promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, promoNonSkippableCampaign);
                        assert.isTrue(result);
                    });
                    it('should return false for a placement with a rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                });
                context('where the configuration is non-skippable', () => {
                    it('should return true for a placement with the promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, promoNonSkippableCampaign);
                        assert.isTrue(result);
                    });
                    it('should return false for a placement with a rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a rewarded suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                    it('should return false for a placement with a non rewarded promo suffix', () => {
                        const result = MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, promoNonSkippableCampaign);
                        assert.isFalse(result);
                    });
                });
            });
        });
    });

    describe('createMixedPlacements', () => {
        it('should update the placements map by adding in additional mixed placement', () => {
            const placements: { [id: string]: Placement } = {};
            const rawPlacement = configurationPromoPlacementsJson.placements[3];
            MixedPlacementUtility.createMixedPlacements(rawPlacement, placements);

            rawPlacement.id = 'promoPlacement';
            const expectedPlacementNonRewarded: Placement = new Placement(rawPlacement);
            rawPlacement.id = 'promoPlacement-rewarded';
            const expectedPlacementRewarded: Placement = new Placement(rawPlacement);
            rawPlacement.id = 'promoPlacement-promo';
            const expectedPlacementPromo: Placement = new Placement(rawPlacement);
            rawPlacement.id = 'promoPlacement-rewardedpromo';
            const expectedPlacementRewardedPromo: Placement = new Placement(rawPlacement);

            const expectedPlacements: { [id: string]: Placement } = {
                'promoPlacement'               : expectedPlacementNonRewarded,
                'promoPlacement-promo'         : expectedPlacementPromo,
                'promoPlacement-rewarded'      : expectedPlacementRewarded,
                'promoPlacement-rewardedpromo' : expectedPlacementRewardedPromo
            };
            assert.deepEqual(placements, expectedPlacements);
        });
    });
});
