import 'mocha';
import { assert } from 'chai';
import { MixedPlacementUtility } from 'Utilities/MixedPlacementUtility';
import { Configuration } from 'Models/Configuration';
import { ConfigurationParser } from 'Parsers/ConfigurationParser';

import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';

describe('MixedPlacementUtilities', () => {

    let configuration: Configuration;
    let campaign: PromoCampaign;

    beforeEach(() => {
        configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
        campaign = TestFixtures.getPromoCampaign('purchasing/iap')
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

    describe('isRewardedPromo', () => {
        it('should return true if placement has multiple adtypes, contains iap, and does not allow skip', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('rewardedPromoPlacement').getId(), configuration, campaign);
            assert.isTrue(placementBool);
        });
        it('should return false if no adtype is specified', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('video').getId(), configuration, campaign);
            assert.isFalse(placementBool);
        });
        it('should return false if adtype length is equal to 1', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('promoPlacement').getId(), configuration, campaign);
            assert.isFalse(placementBool);
        });
        it('should return false if adtype is not iap', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('mraid').getId(), configuration, campaign);
            assert.isFalse(placementBool);
        });
        it('should return true if placement has multiple adtypes, contains iap, and does allowskip', () => {
            const placementBool = MixedPlacementUtility.isRewardedPromo(configuration.getPlacement('mixedPlacement').getId(), configuration, campaign);
            assert.isFalse(placementBool);
        });
    });

    describe('extractMixedPlacementSuffix', () => {
        it('should return an empty string when placement is not mixed or rewarded', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('video').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '');
        });
        it('should return -promo when placement is mixed rewarded and campaign is promo ', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('mixedPlacement').getId(), TestFixtures.getPromoCampaign('purchasing/iap'), configuration);
            assert.equal(result, '-promo');
        });
        it('should return -rewarded when placement is mixed rewarded but campaign is not a promo', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('mixedPlacement').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '-rewarded');
        });
        it('should return -rewardedpromo when placement is mixed, allows skip, and is a promo campaign', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('rewardedPromoPlacement').getId(), TestFixtures.getPromoCampaign('purchasing/iap'), configuration);
            assert.equal(result, '-rewardedpromo');
        });
        it('should return -rewarded when placement is mixed, allows skip, and is not a promo campaign', () => {
            const result = MixedPlacementUtility.extractMixedPlacementSuffix(configuration.getPlacement('rewardedPromoPlacement').getId(), TestFixtures.getCampaign(), configuration);
            assert.equal(result, '-rewarded');
        });
    });
});
