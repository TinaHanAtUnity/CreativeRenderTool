import 'mocha';
import { assert } from 'chai';
import { MixedPlacementUtility } from 'Utilities/MixedPlacementUtility';

xdescribe('MixedPlacementUtilities', () => {

    xdescribe('getPlacementTypeList', () => {
        it('should return an array of mixed placement strings', () => {
            const mixedList = MixedPlacementUtility.getMixedPlacmentTypeList();
            assert.equal(mixedList, ['', '-promo', '-rewarded', '-rewardedpromo']);
        });
    });

    xdescribe('isRewardedMixedPlacement', () => {
        it('should return true if placement is', () => {
            //
        });
        it('should return false if', () => {
            //
        });
        it('should return false if', () => {
            //
        });
        it('should return false if', () => {
            //
        });
    });

    xdescribe('isRewardedPromo', () => {
        it('should return true if', () => {
            //
        });
        it('should return false if', () => {
            //
        });
    });

    xdescribe('extractMixedPlacementSuffix', () => {
        //
    });
});
