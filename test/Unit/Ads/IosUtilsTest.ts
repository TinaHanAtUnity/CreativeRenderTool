import { IosUtils } from 'Ads/Utilities/IosUtils';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import 'mocha';
import { assert } from 'chai';

const version8 = ['8.0', '8.1', '8.2', '8.3', '8.0.3', '8.0.scott', '8.2ok', '8.01', '8.0scott'];
const version7 = ['7.0', '7.0.5', '7.1', '7.2', '7.6', '7.9', '7.9.10', '7.01', '7.2ok', '7.1scott'];
const version11 = ['11.0', '11.1.1', '11.2', '11.2.5', '11.3', '11.4', '11.0', '11.1.1', '11.2.5', '11.3', '11.4'];
const version12 = ['12.0', '12.1.1', '12.2', '12.5.5', '12.0', '12.1.1', '12.2', '12.5.5'];
const unknownVersion = ['8', '8..1', '8!1', '8.!1', '8.', '8.5', 'scott'];

const unsupportedVersions = [version7, version8];
const supportedVersions = [version11, version12, unknownVersion];

const iPhone = 'iPhone8,1';
const iPad = 'iPad6,7';

describe('IosUtilsTest', () => {
    it('isAppSheetBroken should only return true for invalid iOS versions or iPhone + PORTRAIT mode', () => {
        supportedVersions.forEach(version => {
            version.forEach(vString => {
                assert.isFalse(IosUtils.isAppSheetBroken(vString, iPhone, Orientation.PORTRAIT), 'Should return false for valid versions on iphone in PORTRAIT');
                assert.isFalse(IosUtils.isAppSheetBroken(vString, iPad, Orientation.PORTRAIT), 'Should return false for valid versions on iPad in PORTRAIT');
                assert.isFalse(IosUtils.isAppSheetBroken(vString, iPad, Orientation.LANDSCAPE), 'Should return false for valid versions on iPad in LANDSCAPE');

                //iphone in LANDSCAPE not supported
                assert.isTrue(IosUtils.isAppSheetBroken(vString, iPhone, Orientation.LANDSCAPE), 'Should return true for valid versions on iphone in LANDSCAPE');
            });
        });
    });

    it('isAppSheetBroken should return true for all invalid iOS versions', () => {
        unsupportedVersions.forEach(version => {
            version.forEach(vString => {
                assert.isTrue(IosUtils.isAppSheetBroken(vString, iPhone, Orientation.PORTRAIT), 'Should return true for invalid versions on iphone in PORTRAIT');
                assert.isTrue(IosUtils.isAppSheetBroken(vString, iPad, Orientation.PORTRAIT), 'Should return true for invalid versions on iPad in PORTRAIT');
                assert.isTrue(IosUtils.isAppSheetBroken(vString, iPhone, Orientation.LANDSCAPE), 'Should return true for invalid versions on iphone in LANDSCAPE');
                assert.isTrue(IosUtils.isAppSheetBroken(vString, iPad, Orientation.LANDSCAPE), 'Should return true for invalid versions on iPad in LANDSCAPE');
            });
        });
    });

    describe('isStoreApiBroken', () => {
        const storeApiTests: {
            osVersion: string;
            expectedResult: boolean;
        }[] = [{
            osVersion: '12.4',
            expectedResult: false
        }, {
            osVersion: '11.4',
            expectedResult: false
        }, {
            osVersion: '12.4.4.4.4.4', // Don't care about additional splits
            expectedResult: false
        }, {
            osVersion: '12', // No minor version
            expectedResult: true
        }, {
            osVersion: '11.1',
            expectedResult: true // First broken version
        }, {
            osVersion: '8.4',
            expectedResult: true
        }, {
            osVersion: '1a.4',
            expectedResult: true // NaN
        }];

        storeApiTests.forEach(t => {
            it(`should return ${t.expectedResult} for osVersion ${t.osVersion}`, () => {
                assert.equal(t.expectedResult, IosUtils.isStoreApiBroken(t.osVersion));
            });
        });
    });
});
