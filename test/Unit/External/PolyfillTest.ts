import 'mocha';
import { assert } from 'chai';

describe('Google Closure Compiler Polyfill Tests', () => {

    /**
     * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/js/polyfills.txt
     */

    const supportedPolyfills: unknown[] = [
        Array.from,
        Array.of,
        Array.prototype.copyWithin,
        Array.prototype.entries,
        Array.prototype.fill,
        Array.prototype.find,
        Array.prototype.findIndex,
        Array.prototype.includes,
        Array.prototype.keys,
        Array.prototype.values,
        Map,
        Math.acosh,
        Math.asinh,
        Math.atanh,
        Math.cbrt,
        Math.clz32,
        Math.cosh,
        Math.expm1,
        Math.fround,
        Math.hypot,
        Math.imul,
        Math.log10,
        Math.log1p,
        Math.log2,
        Math.sign,
        Math.sinh,
        Math.tanh,
        Math.trunc,
        Number.EPSILON,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Number.isFinite,
        Number.isInteger,
        Number.isNaN,
        Number.isSafeInteger,
        Number.parseFloat,
        Number.parseInt,
        Object.assign,
        Object.entries,
        Object.getOwnPropertyDescriptors,
        Object.getOwnPropertySymbols,
        Object.is,
        Object.setPrototypeOf,
        Object.values,
        Promise,
        Promise.prototype.finally,
        Proxy,
        Reflect.apply,
        Reflect.construct,
        Reflect.defineProperty,
        Reflect.deleteProperty,
        Reflect.get,
        Reflect.getOwnPropertyDescriptor,
        Reflect.getPrototypeOf,
        Reflect.has,
        Reflect.isExtensible,
        Reflect.ownKeys,
        Reflect.preventExtensions,
        Reflect.set,
        Reflect.setPrototypeOf,
        Set,
        String.fromCodePoint,
        String.prototype.codePointAt,
        String.prototype.endsWith,
        String.prototype.includes,
        String.prototype.normalize,
        String.prototype.padEnd,
        String.prototype.padStart,
        String.prototype.repeat,
        String.prototype.startsWith,
        String.prototype.trimLeft,
        String.prototype.trimRight,
        String.raw,
        WeakMap,
        WeakSet
    ];

    const unsupportedButPolyfilledFunctions: unknown[] = [
        (<any>Array.prototype).flat,
        (<any>Array.prototype).flatMap,
        (<any>Object).fromEntries,
        (<any>String.prototype).trimEnd,
        (<any>String.prototype).trimStart
    ];

    describe('Testing Google Closure Compiler', () => {
        describe('For supported ES6 functions', () => {
            supportedPolyfills.forEach((t) => {
                it(`${t} should be defined`, () => {
                    assert.isDefined(t);
                    assert.isNotNull(t);
                });
            });
        });

        describe('For unsupported ES6 functions', () => {
            unsupportedButPolyfilledFunctions.forEach((t) => {
                it(`${t} should be defined`, () => {
                    assert.isDefined(t);
                    assert.isNotNull(t);
                });
            });
        });

        describe('Sanity Check', () => {
            it('should not be polyfilled', () => {
                const garbageFunction = (<any>Array.prototype).fakefunctionThatNeverPolyfills;
                assert.isUndefined(garbageFunction);
            });
        });

    });
});
