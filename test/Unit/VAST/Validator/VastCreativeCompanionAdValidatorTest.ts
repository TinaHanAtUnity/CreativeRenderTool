import 'mocha';
import { assert } from 'chai';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { VastCreativeStaticResourceCompanionAd } from 'VAST/Models/VastCreativeStaticResourceCompanionAd';
import { VastCreativeStaticResourceCompanionAdValidator } from 'VAST/Validators/VastCreativeStaticResourceCompanionAdValidator';

describe('VastCreativeCompanionAdValidatorTest', () => {
    describe('getErrors', () => {

        it('Should not give any errors when valid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeStaticResourceCompanionAd('testId', 200, 200, 'image/jpg', 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', ['https://google.com?companionAd=yes&clickTracking=true'], {
                'click': ['http://google.com', 'https://reddit.com'],
                'impression': ['http://google.com/impression?someQuery=test&other=no']
            });
            const errors = new VastCreativeStaticResourceCompanionAdValidator(companionAd).getErrors();
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });

        it('Should not give any errors when creativeType is supported', () => {
            const test = (type: string) => {
                const companionAd = new VastCreativeStaticResourceCompanionAd('testId', 200, 200, type, 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', [], {
                    'click': ['http://google.com', 'https://reddit.com'],
                    'impression': ['http://google.com/impression?someQuery=test&other=no']
                });
                const errors = new VastCreativeStaticResourceCompanionAdValidator(companionAd).getErrors();
                assert.lengthOf(errors, 0, JSON.stringify(errors));
            };
            const creativeTypes: string[] = (<any>VastCreativeStaticResourceCompanionAdValidator)._supportedCreativeTypes;
            creativeTypes.map((type) => {
                test(type);
            });
        });

        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeStaticResourceCompanionAd('testId', 200, 200, 'invalid', 'http://google.com?someQuery=test&other=no', 'invalidClick', ['invalidClickTracking'], {
                'click': ['', 'abc'],
                'impression': ['abc?no=hello']
            });
            const errors = new VastCreativeStaticResourceCompanionAdValidator(companionAd).getErrors();
            assert.lengthOf(errors, 6, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad(testId) companionClickTrackingURLTemplates contains invalid url("invalidClickTracking")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")');
        });

        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeStaticResourceCompanionAd(null, null, null);
            const errors = new VastCreativeStaticResourceCompanionAdValidator(companionAd).getErrors();
            assert.lengthOf(errors, 3, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(null) is missing required StaticResource Element\n    VAST Companion ad(null) "StaticResource" is missing required "creativeType" attribute\n    VAST Companion ad(null) is missing required CompanionClickThrough Element');
        });
    });
});
