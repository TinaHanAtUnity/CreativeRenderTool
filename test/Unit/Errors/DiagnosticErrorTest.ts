import 'mocha';
import { assert } from 'chai';
import { DiagnosticError } from 'Common/Errors/DiagnosticError';

describe('DiagnosticErrorTest', () => {
    describe('with existing error', () => {
        let originalError: Error;

        before(() => {
            originalError = new SyntaxError('foo message');
        });

        it('should contain original fields', () => {
            const diagnosticError = new DiagnosticError(originalError, {});

            assert.equal(diagnosticError.name, 'SyntaxError');
            assert.equal(diagnosticError.message, 'foo message');
            assert.equal(diagnosticError.stack, originalError.stack);
        });

        it('should contain the diagnostic data', () => {
            const diagnosticError = new DiagnosticError(originalError, {foo: 'foo1', bar: 'bar2'});

            // tslint:disable:no-string-literal
            assert.equal(diagnosticError.diagnostic['foo'], 'foo1');
            assert.equal(diagnosticError.diagnostic['bar'], 'bar2');
            // tslint:enable:no-string-literal
        });

        it('should serialize correctly', () => {
            const diagnosticError = new DiagnosticError(originalError, {foo: 'foo1', bar: 'bar2'});
            const result = JSON.stringify(diagnosticError);

            assert.notEqual(result.indexOf('"name":"SyntaxError"'), -1);
            assert.notEqual(result.indexOf('"message":"foo message"'), -1);
            assert.notEqual(result.indexOf('"diagnostic":{"foo":"foo1","bar":"bar2"}'), -1);
        });
    });
});
