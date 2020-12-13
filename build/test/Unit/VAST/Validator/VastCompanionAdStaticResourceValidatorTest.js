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
            const test = (type) => {
                const companionAd = new VastCompanionAdStaticResource('testId', 320, 480, type, 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', [], {
                    'click': ['http://google.com', 'https://reddit.com'],
                    'impression': ['http://google.com/impression?someQuery=test&other=no']
                });
                const errors = new VastCompanionAdStaticResourceValidator(companionAd).getErrors();
                assert.lengthOf(errors, 0, JSON.stringify(errors));
            };
            const creativeTypes = VastCompanionAdStaticResourceValidator._supportedCreativeTypes;
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
            const companionAd = new VastCompanionAdStaticResource(null, 0, 0);
            const errors = new VastCompanionAdStaticResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 4, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(null) is missing required StaticResource Element\n    VAST Companion ad(null) "StaticResource" is missing required "creativeType" attribute\n    VAST Companion ad(null) "StaticResource" is not meeting minimum size 480 x 320 for Landscape display\n    VAST Companion ad(null) is missing required CompanionClickThrough Element');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkU3RhdGljUmVzb3VyY2VWYWxpZGF0b3JUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZBU1QvVmFsaWRhdG9yL1Zhc3RDb21wYW5pb25BZFN0YXRpY1Jlc291cmNlVmFsaWRhdG9yVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDbEYsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDMUYsT0FBTyxFQUFFLHNDQUFzQyxFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFFaEgsUUFBUSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtJQUN4RCxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtRQUV2QixFQUFFLENBQUMsd0VBQXdFLEVBQUUsR0FBRyxFQUFFO1lBQzlFLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQTZCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLDJDQUEyQyxFQUFFLDJDQUEyQyxFQUFFLENBQUMsdURBQXVELENBQUMsRUFBRTtnQkFDeE8sT0FBTyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUM7Z0JBQ3BELFlBQVksRUFBRSxDQUFDLHNEQUFzRCxDQUFDO2FBQ3pFLENBQUMsQ0FBQztZQUNILE1BQU0sTUFBTSxHQUFHLElBQUksc0NBQXNDLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDLENB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