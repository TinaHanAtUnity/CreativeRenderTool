import { assert } from 'chai';
import 'mocha';
import { VersionMatchers } from 'Ads/Utilities/VersionMatchers';

describe('VersionMatchers', () => {
    describe('matchesMajorOSVersion', () => {
        it('Should match correctly a version with no minor version', () => {
            assert.isTrue(VersionMatchers.matchesMajorOSVersion(7, '7'));
        });

        it('Should match correctly a version with minor version', () => {
            assert.isTrue(VersionMatchers.matchesMajorOSVersion(7, '7.1'));
        });

        it('Should match correctly a version with a patch version', () => {
            assert.isTrue(VersionMatchers.matchesMajorOSVersion(7, '7.1.2'));
        });

        it('Should not match with when major version just starts with the same number', () => {
            assert.isFalse(VersionMatchers.matchesMajorOSVersion(7, '70'));
        });

        it('Should not match to a different version', () => {
            assert.isFalse(VersionMatchers.matchesMajorOSVersion(8, '7'));
        });
    });
});
