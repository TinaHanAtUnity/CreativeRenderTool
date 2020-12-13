import { IosUtils } from 'Ads/Utilities/IosUtils';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import 'mocha';
import { assert } from 'chai';
const version8 = ['8.0', '8.1', '8.2', '8.3', '8.0.3', '8.0.scott', '8.2ok', '8.01', '8.0scott'];
const version7 = ['7.0', '7.0.5', '7.1', '7.2', '7.6', '7.9', '7.9.10', '7.01', '7.2ok', '7.1scott'];
const version11 = ['11.0', '11.1.1', '11.2', '11.2.5', '11.3', '11.4', '11.0', '11.1.1', '11.2.5', '11.3', '11.4'];
const version12 = ['12.0', '12.1.1', '12.2', '12.5.5', '12.0', '12.1.1', '12.2', '12.5.5'];
const version13 = ['13.0', '13.1.1', '13.2', '13.5.5', '13.0', '13.1.1', '13.2', '13.0.0.0.0'];
const unknownVersion = ['8', '8..1', '8!1', '8.!1', '8.', '8.5', 'scott'];
const unsupportedVersions = [version7, version8, version13];
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
        const storeApiTests = [{
                osVersion: '12.4',
                expectedResult: false
            }, {
                osVersion: '11.4',
                expectedResult: false
            }, {
                osVersion: '12.4.4.4.4.4',
                expectedResult: false
            }, {
                osVersion: '12',
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
            }, {
                osVersion: undefined,
                expectedResult: true // NaN
            }];
        storeApiTests.forEach(t => {
            it(`should return ${t.expectedResult} for osVersion ${t.osVersion}`, () => {
                assert.equal(t.expectedResult, IosUtils.isStoreApiBroken(t.osVersion));
            });
        });
    });
    describe('isAdUnitTransparencyBroken', () => {
        const transparencyTests = [{
                osVersion: '12.4',
                expectedResult: false
            }, {
                osVersion: '11.4',
                expectedResult: false
            }, {
                osVersion: '12.4.4.4.4.4',
                expectedResult: false
            }, {
                osVersion: '13.0',
                expectedResult: true // First broken version
            }, {
                osVersion: '13.1.1',
                expectedResult: true
            }, {
                osVersion: '1a.4',
                expectedResult: false
            }];
        transparencyTests.forEach(t => {
            it(`should return ${t.expectedResult} for osVersion ${t.osVersion}`, () => {
                assert.equal(t.expectedResult, IosUtils.isAdUnitTransparencyBroken(t.osVersion));
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zVXRpbHNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Fkcy9Jb3NVdGlsc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ2xELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFOUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2pHLE1BQU0sUUFBUSxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDckcsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbkgsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDM0YsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDL0Ys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