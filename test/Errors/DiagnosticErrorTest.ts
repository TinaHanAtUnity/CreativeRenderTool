/// <reference path="../../typings/index.d.ts" />

import 'mocha';
import { assert } from 'chai';

import { DiagnosticError } from '../../src/ts/Errors/DiagnosticError';

describe('DiagnosticErrorTest', () => {
    it('with existing error', () => {
        let originalError;

        before(() => {
            originalError = new SyntaxError('foo message');
        });

        it('should contain original fields', () => {
            let diagnosticError = new DiagnosticError(originalError, {});

            assert.equal(diagnosticError.name, 'SyntaxError');
            assert.equal(diagnosticError.message, 'foo message');
        });

        it('should contain the diagnostic data', () => {
            let diagnosticError = new DiagnosticError(originalError, { foo: 'foo1', bar: 'bar2'});

            /* tslint:disable:no-string-literal */
            assert.equal(diagnosticError.diagnostic['foo'], 'foo1');
            assert.equal(diagnosticError.diagnostic['bar'], 'bar2');
        });
    });
});
