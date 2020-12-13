import 'mocha';
import { assert } from 'chai';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { VastCompanionAdIframeResource } from 'VAST/Models/VastCompanionAdIframeResource';
import { VastCompanionAdIframeResourceValidator } from 'VAST/Validators/VastCompanionAdIframeResourceValidator';
describe('VastCompanionAdIframeResourceValidatorTest', () => {
    describe('getErrors', () => {
        it('Should not give any errors when valid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCompanionAdIframeResource('testId', 480, 320, 'http://google.com?someQuery=test&other=no');
            const errors = new VastCompanionAdIframeResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });
        it('Should give errors when no url is given', () => {
            const companionAd = new VastCompanionAdIframeResource('testId', 320, 480);
            const errors = new VastCompanionAdIframeResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 1, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(testId) is missing required IframeResource Element');
        });
        it('Should give errors when invalid url is given', () => {
            const companionAd = new VastCompanionAdIframeResource('testId', 320, 480, 'wrongurl');
            const errors = new VastCompanionAdIframeResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 1, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST companion ad(testId) IframeResourceUrl contains invalid url("wrongurl")');
        });
        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCompanionAdIframeResource(null, 0, 0);
            const errors = new VastCompanionAdIframeResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 2, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(null) is missing required IframeResource Element\n    VAST Companion ad(null) "IframeResource" is not meeting minimum size 480 x 320 for Landscape display');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkSWZyYW1lUmVzb3VyY2VWYWxpZGF0b3JUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZBU1QvVmFsaWRhdG9yL1Zhc3RDb21wYW5pb25BZElmcmFtZVJlc291cmNlVmFsaWRhdG9yVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDbEYsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDMUYsT0FBTyxFQUFFLHNDQUFzQyxFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFFaEgsUUFBUSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtJQUN4RCxRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtRQUV2QixFQUFFLENBQUMsd0VBQXdFLEVBQUUsR0FBRyxFQUFFO1lBQzlFLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQTZCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztZQUN2SCxNQUFNLE1BQU0sR0FBRyxJQUFJLHNDQUFzQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO1lBQy9DLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQTZCLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMxRSxNQUFNLE1BQU0sR0FBRyxJQUFJLHNDQUFzQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsc0VBQXNFLENBQUMsQ0FBQztRQUN2SSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw4Q0FBOEMsRUFBRSxHQUFHLEVBQUU7WUFDcEQsTUFBTSxXQUFXLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN0RixNQUFNLE1BQU0sR0FBRyxJQUFJLHNDQUFzQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25GLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsOEVBQThFLENBQUMsQ0FBQztRQUMvSSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxrRUFBa0UsRUFBRSxHQUFHLEVBQUU7WUFDeEUsTUFBTSxXQUFXLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sTUFBTSxHQUFHLElBQUksc0NBQXNDLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSw4S0FBOEssQ0FBQyxDQUFDO1FBQy9PLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9