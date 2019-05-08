import 'mocha';
import { assert } from 'chai';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastCompanionAdStaticResourceValidator } from 'VAST/Validators/VastCompanionAdStaticResourceValidator';

describe('VastCompanionAdStaticResourceValidatorTest', () => {
    describe('getErrors', () => {

        it('Should not give any errors when valid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCompanionAdStaticResource('testId', 480, 320, 'image/jpg', 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', ['https://google.com?companionAd=yes&clickTracking=true'], {
                'click': ['http://google.com', 'https://reddit.com'],
                'impression': ['http://google.com/impression?someQuery=test&other=no']
            });
            const errors = new VastCompanionAdStaticResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });

        it('Should not give any errors when creativeType is supported', () => {
            const test = (type: string) => {
                const companionAd = new VastCompanionAdStaticResource('testId', 320, 480, type, 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', [], {
                    'click': ['http://google.com', 'https://reddit.com'],
                    'impression': ['http://google.com/impression?someQuery=test&other=no']
                });
                const errors = new VastCompanionAdStaticResourceValidator(companionAd).getErrors();
                assert.lengthOf(errors, 0, JSON.stringify(errors));
            };
            const creativeTypes: string[] = (<any>VastCompanionAdStaticResourceValidator)._supportedCreativeTypes;
            // creativeType should work regardless of case
            creativeTypes.concat(creativeTypes.map((type) => {
                return type.toUpperCase();
            })).map((type) => {
                test(type);
            });
        });

        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCompanionAdStaticResource('testId', 320, 480, 'invalid', 'http://google.com?someQuery=test&other=no', 'invalidClick', ['invalidClickTracking'], {
                'click': ['', 'abc'],
                'impression': ['abc?no=hello']
            });
            const errors = new VastCompanionAdStaticResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 6, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad(testId) companionClickTrackingURLTemplates contains invalid url("invalidClickTracking")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")');
        });

        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCompanionAdStaticResource(null, null, null);
            const errors = new VastCompanionAdStaticResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 4, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(null) is missing required StaticResource Element\n    VAST Companion ad(null) "StaticResource" is missing required "creativeType" attribute\n    VAST Companion ad(null) "StaticResource" is not meeting minimum size 480 x 320\n    VAST Companion ad(null) is missing required CompanionClickThrough Element');
        });
    });
});
