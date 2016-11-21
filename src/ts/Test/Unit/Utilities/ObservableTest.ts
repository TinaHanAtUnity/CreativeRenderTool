import 'mocha';
import { assert } from 'chai';

import { Observable1 } from 'Utilities/Observable';

describe('ObservableTest', () => {
    it('should unsubscribe', () => {
        let triggered = 0;
        const observer = () => {
            triggered++;
        };
        const observable = new Observable1();
        observable.subscribe(observer);
        assert.equal(triggered, 0);
        observable.trigger(true);
        assert.equal(triggered, 1);
        observable.unsubscribe(observer);
        observable.trigger(true);
        assert.equal(triggered, 1);
    });

    it('should unsubscribe from bound observer', () => {
        let triggered = 0;
        const observer = (abc: string) => {
            assert.equal(abc, 'abc');
            triggered++;
        };
        const observable = new Observable1();
        const boundObserver = observable.subscribe(() => observer('abc'));
        assert.equal(triggered, 0);
        observable.trigger('abc');
        assert.equal(triggered, 1);
        observable.unsubscribe(boundObserver);
        observable.trigger('abc');
        assert.equal(triggered, 1);
    });
});
