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
