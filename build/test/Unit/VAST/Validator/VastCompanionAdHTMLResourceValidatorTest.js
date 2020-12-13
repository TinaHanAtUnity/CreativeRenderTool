import 'mocha';
import { assert } from 'chai';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { VastCompanionAdHTMLResource } from 'VAST/Models/VastCompanionAdHTMLResource';
import { VastCompanionAdHTMLResourceValidator } from 'VAST/Validators/VastCompanionAdHTMLResourceValidator';
describe('VastCompanionAdHTMLResourceValidatorTest', () => {
    describe('getErrors', () => {
        it('Should not give any errors when valid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCompanionAdHTMLResource('testId', 480, 320, '<html><a href="https://search.spotxchange.com/click?_a=235398" border="0" target="_blank" title="MOBILE Segment Bundle"><img style="border:0; width:300px; height:250px;" src="https://search.spotxchange.com/banner" alt="MOBILE Segment Bundle" /></a></html>');
            const errors = new VastCompanionAdHTMLResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });
        it('Should give errors when no url is given', () => {
            const companionAd = new VastCompanionAdHTMLResource('testId', 320, 480);
            const errors = new VastCompanionAdHTMLResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 1, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(testId) is missing required HTMLResource Element');
        });
        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCompanionAdHTMLResource(null, 0, 0);
            const errors = new VastCompanionAdHTMLResourceValidator(companionAd).getErrors();
            assert.lengthOf(errors, 2, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST Companion ad(null) is missing required HTMLResource Element\n    VAST Companion ad(null) "HTMLResource" is not meeting minimum size 480 x 320 for Landscape display');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkSFRNTFJlc291cmNlVmFsaWRhdG9yVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9WQVNUL1ZhbGlkYXRvci9WYXN0Q29tcGFuaW9uQWRIVE1MUmVzb3VyY2VWYWxpZGF0b3JUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNsRixPQUFPLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUN0RixPQUFPLEVBQUUsb0NBQW9DLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUU1RyxRQUFRLENBQUMsMENBQTBDLEVBQUUsR0FBRyxFQUFFO0lBQ3RELFFBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO1FBRXZCLEVBQUUsQ0FBQyx3RUFBd0UsRUFBRSxHQUFHLEVBQUU7WUFDOUUsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxpUUFBaVEsQ0FBQyxDQUFDO1lBQzNVLE1BQU0sTUFBTSxHQUFHLElBQUksb0NBQW9DLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx5Q0FBeUMsRUFBRSxHQUFHLEVBQUU7WUFDL0MsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sTUFBTSxHQUFHLElBQUksb0NBQW9DLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNuRCxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRSxvRUFBb0UsQ0FBQyxDQUFDO1FBQ3JJLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGtFQUFrRSxFQUFFLEdBQUcsRUFBRTtZQUN4RSxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUEyQixDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxvQ0FBb0MsQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNqRixNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLDBLQUEwSyxDQUFDLENBQUM7UUFDM08sQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=