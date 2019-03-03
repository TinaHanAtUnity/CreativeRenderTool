import { Observables } from 'Core/Utilities/Observables';
import { Observable0, Observable1, Observable2 } from 'Core/Utilities/Observable';

import { assert } from 'chai';
import 'mocha';

describe('Observables', () => {
    context('once', () => {
        it('should only trigger the observable once', () => {
            let count = 0;
            const myObserver = new Observable0();
            Observables.once(myObserver, () => count++);
            myObserver.trigger();
            myObserver.trigger();

            assert.equal(count, 1, 'Observable was called more than once.');
        });
    });
    context('once1', () => {
        it('should only trigger the observable once', () => {
            let count = 0;
            const myObserver = new Observable1<number>();
            Observables.once1(myObserver, (n) => count++);
            myObserver.trigger(0);
            myObserver.trigger(1);

            assert.equal(count, 1, 'Observable was called more than once.');
        });
    });
    context('once2', () => {
        it('should only trigger the observable once', () => {
            let count = 0;
            const myObserver = new Observable2<number, number>();
            Observables.once2(myObserver, (n, m) => count++);
            myObserver.trigger(0, 0);
            myObserver.trigger(1, 1);

            assert.equal(count, 1, 'Observable was called more than once.');
        });
    });
});
