import 'mocha';
import { assert } from 'chai';
import { DiagnosticError } from 'Errors/DiagnosticError';

describe('DiagnosticErrorTest', () => {
    describe('with existing error', () => {
        let originalError: Error;

        before(() => {
            originalError = new SyntaxError('foo message');
        });

        it('should contain original fields', () => {
            let diagnosticError = new DiagnosticError(originalError, {});

            assert.equal(diagnosticError.name, 'SyntaxError');
            assert.equal(diagnosticError.message, 'foo message');
            assert.equal(diagnosticError.stack, originalError.stack);
        });

        it('should contain the diagnostic data', () => {
            let diagnosticError = new DiagnosticError(originalError, {foo: 'foo1', bar: 'bar2'});

            /* tslint:disable:no-string-literal */
            assert.equal(diagnosticError.diagnostic['foo'], 'foo1');
            assert.equal(diagnosticError.diagnostic['bar'], 'bar2');
        });

        it('should serialize correctly', () => {
            let diagnosticError = new DiagnosticError(originalError, {foo: 'foo1', bar: 'bar2'});
            let result = JSON.stringify(diagnosticError);

            assert.notEqual(result.indexOf('"name":"SyntaxError"'), -1);
            assert.notEqual(result.indexOf('"message":"foo message"'), -1);
            assert.notEqual(result.indexOf('"diagnostic":{"foo":"foo1","bar":"bar2"}'), -1);
        });
    });
});
