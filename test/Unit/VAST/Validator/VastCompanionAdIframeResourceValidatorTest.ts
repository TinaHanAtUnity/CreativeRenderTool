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
