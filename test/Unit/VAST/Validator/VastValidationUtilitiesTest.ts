import 'mocha';
import { assert } from 'chai';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';

describe('VastValidatorTest', () => {
    describe('invalidUrlError', () => {
        it('should fill in description and url', () => {
            const error = VastValidationUtilities.invalidUrlError('test description', 'http://google.com');
            assert.equal(error.message, 'VAST test description contains invalid url("http://google.com")');
        });
    });

    describe('formatErrors', () => {
        it('should format empty error array correctly', () => {
            const message = VastValidationUtilities.formatErrors([]);
            assert.equal(message, '');
        });

        it('should format error array with one element correctly', () => {
            const message = VastValidationUtilities.formatErrors([
                new Error('first')
            ]);
            assert.equal(message, 'first');
        });

        it('should format error array with two elements correctly', () => {
            const message = VastValidationUtilities.formatErrors([
                new Error('first'),
                new Error('second')
            ]);
            assert.equal(message, 'first\n    second');
        });
    });
});
