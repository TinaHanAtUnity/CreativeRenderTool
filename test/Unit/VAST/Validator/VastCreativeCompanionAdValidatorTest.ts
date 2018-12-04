import 'mocha';
import { assert } from 'chai';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { VastCreativeCompanionAd } from 'VAST/Models/VastCreativeCompanionAd';
import { VastCreativeCompanionAdValidator } from 'VAST/Validators/VastCreativeCompanionAdValidator';

describe('VastCreativeCompanionAdValidatorTest', () => {
    describe('getErrors', () => {

        it('Should not give any errors when valid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeCompanionAd('testId', 200, 200, 'image/jpg', 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', {
                'click': ['http://google.com', 'https://reddit.com'],
                'impression': ['http://google.com/impression?someQuery=test&other=no']
            });
            const errors = new VastCreativeCompanionAdValidator(companionAd).getErrors();
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });

        it('Should not give any errors when creativeType is supported', () => {
            const test = (type: string) => {
                const companionAd = new VastCreativeCompanionAd('testId', 200, 200, type, 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', {
                    'click': ['http://google.com', 'https://reddit.com'],
                    'impression': ['http://google.com/impression?someQuery=test&other=no']
                });
                const errors = new VastCreativeCompanionAdValidator(companionAd).getErrors();
                assert.lengthOf(errors, 0, JSON.stringify(errors));
            };
            const creativeTypes: string[] = (<any>VastCreativeCompanionAdValidator)._supportedCreativeTypes;
            creativeTypes.map((type) => {
                test(type);
            });
        });

        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeCompanionAd('testId', 200, 200, 'invalid', 'http://google.com?someQuery=test&other=no', 'invalidClick', {
                'click': ['', 'abc'],
                'impression': ['abc?no=hello']
            });
            const errors = new VastCreativeCompanionAdValidator(companionAd).getErrors();
            assert.lengthOf(errors, 5, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")');
        });

        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeCompanionAd(null, null, null);
            const errors = new VastCreativeCompanionAdValidator(companionAd).getErrors();
            assert.lengthOf(errors, 3, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(null) is missing required StaticResource Element\n    VAST Companion ad(null) "StaticResource" is missing required "creativeType" attribute\n    VAST Companion ad(null) is missing required CompanionClickThrough Element');
        });
    });
});
