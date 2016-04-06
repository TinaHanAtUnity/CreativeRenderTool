/// <reference path="../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';

import { Observable1 } from '../../src/ts/Utilities/Observable';

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
        let observer = (abc) => {
            assert.equal(abc, 'abc');
            triggered++;
        };
        let observable = new Observable1();
        let boundObserver = observable.subscribe(observer.bind(undefined, 'abc'));
        assert.equal(triggered, 0);
        observable.trigger('abc');
        assert.equal(triggered, 1);
        observable.unsubscribe(boundObserver);
        observable.trigger('abc');
        assert.equal(triggered, 1);
    });
});
