import 'mocha';
import { assert } from 'chai';

import { Observable1 } from 'Utilities/Observable';

describe('ObservableTest', () => {
    it('should unsubscribe', () => {
        let triggered = 0;
        let observer = () => {
            triggered++;
        };
        let observable = new Observable1();
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
        let observer = (abc: string) => {
            assert.equal(abc, 'abc');
            triggered++;
        };
        let observable = new Observable1();
        let boundObserver = observable.subscribe(() => observer('abc'));
        assert.equal(triggered, 0);
        observable.trigger('abc');
        assert.equal(triggered, 1);
        observable.unsubscribe(boundObserver);
        observable.trigger('abc');
        assert.equal(triggered, 1);
    });
});
