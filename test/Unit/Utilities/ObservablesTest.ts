import { Observables } from 'Core/Utilities/Observables';
import { Observable0, Observable1, Observable2 } from 'Core/Utilities/Observable';

import { assert } from 'chai';
import 'mocha';

describe('Observables', () => {
    context('once', () => {
        it('should emit only once', () => {
            let count = 0;
            const source = new Observable0();
            Observables.once(source, () => count++);
            source.trigger();
            source.trigger();

            assert.equal(count, 1, 'Observer was notified more than once.');
        });
    });
    context('once1', () => {
        it('should emit only once', () => {
            let current = 0;
            const source = new Observable1<number>();
            Observables.once1(source, (n) => current = n);
            source.trigger(1);
            source.trigger(0);

            assert.equal(current, 1, 'Observer was notified more than once.');
        });
    });
    context('once2', () => {
        it('should emit only once', () => {
            let current = [0, 0];
            const source = new Observable2<number, number>();
            Observables.once2(source, (n, m) => current = [n, m]);
            source.trigger(1, 1);
            source.trigger(0, 0);

            assert.equal(current[0], 1, 'Observer was notified more than once.');
            assert.equal(current[1], 1, 'Observer was notified more than once.');
        });
    });
});
