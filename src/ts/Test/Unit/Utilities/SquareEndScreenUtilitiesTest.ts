import 'mocha';
import { assert } from 'chai';

import { IosUtils } from 'Utilities/IosUtils';
import { Platform } from 'Constants/Platform';
import { SquareEndScreenUtilities, SQUARE_CAMPAIGNS, SQUARE_END_SCREEN_AB_GROUPS } from 'Utilities/SquareEndScreenUtilities';
import { ABGroupBuilder } from 'Models/ABGroup';

const CAMPAIGN_IDS = SQUARE_CAMPAIGNS[0].campaignIds;

describe('SquareEndScreenUtilitiesTest', () => {

    describe('hasCustomImage()', () => {
        it('returns true for a campaign that is included in SQUARE_CAMPAIGNS', () => {
            assert.isTrue(SquareEndScreenUtilities.hasCustomImage(CAMPAIGN_IDS[0]));
        });

        it('returns false for a campaign that is not included in SQUARE_CAMPAIGNS', () => {
            assert.isFalse(SquareEndScreenUtilities.hasCustomImage('abc'));
        });
    });

    describe('isDeviceSupported()', () => {
        it('should always return true for iOS', () => {
            assert.isTrue(SquareEndScreenUtilities.isDeviceSupported('4.0', Platform.IOS), 'Should return true with osVersion 4.0');
            assert.isTrue(SquareEndScreenUtilities.isDeviceSupported('8.0', Platform.IOS), 'Should return true with osVersion 8.0');
            assert.isTrue(SquareEndScreenUtilities.isDeviceSupported('abc', Platform.IOS), 'Should return true with osVersion abc');
        });

        it('should return true for Android that does not have 4.x osVersion', () => {
            assert.isTrue(SquareEndScreenUtilities.isDeviceSupported('5.0', Platform.ANDROID), 'Should return true with osVersion 5.0');
            assert.isTrue(SquareEndScreenUtilities.isDeviceSupported('8', Platform.ANDROID), 'Should return true with osVersion 8');
            assert.isTrue(SquareEndScreenUtilities.isDeviceSupported('8.4.1', Platform.ANDROID), 'Should return true with osVersion 8.4.1');
            assert.isTrue(SquareEndScreenUtilities.isDeviceSupported('8.4.4', Platform.ANDROID), 'Should return true with osVersion 8.4.4');
            assert.isTrue(SquareEndScreenUtilities.isDeviceSupported('abc', Platform.ANDROID), 'Should return true with osVersion abc');
        });

        it('should return false for Android that has 4.x osVersion', () => {
            assert.isFalse(SquareEndScreenUtilities.isDeviceSupported('4', Platform.ANDROID), 'Should return false with osVersion 4');
            assert.isFalse(SquareEndScreenUtilities.isDeviceSupported('4.1', Platform.ANDROID), 'Should return false with osVersion 4.1');
            assert.isFalse(SquareEndScreenUtilities.isDeviceSupported('4.4', Platform.ANDROID), 'Should return false with osVersion 4.4');
            assert.isFalse(SquareEndScreenUtilities.isDeviceSupported('4.8.8', Platform.ANDROID), 'Should return false with osVersion 4.8.8');
            assert.isFalse(SquareEndScreenUtilities.isDeviceSupported('4ok', Platform.ANDROID), 'Should return false with osVersion 4ok');
        });
    });

    describe('useSquareEndScreenAlt()', () => {
        it('should return true when abGroup, campaignId match and the device is supported', () => {
            assert.isTrue(SquareEndScreenUtilities.useSquareEndScreenAlt(SQUARE_END_SCREEN_AB_GROUPS[0], Platform.IOS, CAMPAIGN_IDS[0], '4.0'), `Should return true for campaign ${CAMPAIGN_IDS[0]} and iOS device`);
            assert.isTrue(SquareEndScreenUtilities.useSquareEndScreenAlt(SQUARE_END_SCREEN_AB_GROUPS[0], Platform.ANDROID, CAMPAIGN_IDS[2], '5.0'), `Should return true for campaign ${CAMPAIGN_IDS[2]} and supported Android device`);
        });

        it('should return false when abGroup does not match', () => {
            assert.isFalse(SquareEndScreenUtilities.useSquareEndScreenAlt(ABGroupBuilder.getAbGroup(1), Platform.IOS, CAMPAIGN_IDS[0], '4.0'), 'Should return false with abGroup 6 and iOS device');
            assert.isFalse(SquareEndScreenUtilities.useSquareEndScreenAlt(ABGroupBuilder.getAbGroup(3), Platform.ANDROID, CAMPAIGN_IDS[1], '5.0'), 'Should return false with abGroup 3 and supported Android device');
            assert.isFalse(SquareEndScreenUtilities.useSquareEndScreenAlt(ABGroupBuilder.getAbGroup(3), Platform.ANDROID, CAMPAIGN_IDS[1], '4.0'), 'Should return false with abGroup 3 and non-supported Android device');
        });

        it('should return false when campaignId does not match', () => {
            assert.isFalse(SquareEndScreenUtilities.useSquareEndScreenAlt(SQUARE_END_SCREEN_AB_GROUPS[0], Platform.IOS, 'abc', '4.0'), 'Should return false with campaignId abc and iOS device');
            assert.isFalse(SquareEndScreenUtilities.useSquareEndScreenAlt(SQUARE_END_SCREEN_AB_GROUPS[0], Platform.ANDROID, 'lmn', '5.0'), 'Should return false with campaignId lmn and Android device');
        });

        it('should return false when osVersion is missing', () => {
            assert.isFalse(SquareEndScreenUtilities.useSquareEndScreenAlt(SQUARE_END_SCREEN_AB_GROUPS[0], Platform.IOS, CAMPAIGN_IDS[0]), 'Should return false when osVersion is missing');
        });

        it('should return false when campaignId is missing', () => {
            assert.isFalse(SquareEndScreenUtilities.useSquareEndScreenAlt(SQUARE_END_SCREEN_AB_GROUPS[0], Platform.IOS, undefined, '8.0'), 'Should return false when campaignId is missing');
        });

        it('should return false when device is not supported', () => {
            assert.isFalse(SquareEndScreenUtilities.useSquareEndScreenAlt(SQUARE_END_SCREEN_AB_GROUPS[0], Platform.ANDROID, CAMPAIGN_IDS[0], '4.4'), 'Should return false for non-supported android');
        });
    });
});
