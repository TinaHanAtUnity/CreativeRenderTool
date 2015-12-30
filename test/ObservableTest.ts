/// <reference path="../typings/tsd.d.ts" />

import 'mocha';
import { assert } from 'chai';

import { Observable } from '../src/ts/Utilities/Observable';

describe('ObservableTest', () => {
    it('should unsubscribe', () => {
        let triggered = 0;
        let observer = () => {
            triggered++;
        };
        let observableClass = class TestObservable extends Observable {

            public testTrigger() {
                this.trigger('test');
            }

        };
        let observable = new observableClass();
        observable.subscribe('test', observer);
        assert.equal(triggered, 0);
        observable.testTrigger();
        assert.equal(triggered, 1);
        observable.unsubscribe('test', observer);
        observable.testTrigger();
        assert.equal(triggered, 1);
    });

    it('should unsubscribe from bound observer', () => {
        let triggered = 0;
        let observer = (abc) => {
            assert.equal(abc, 'abc');
            triggered++;
        };
        let observableClass = class TestObservable extends Observable {

            public testTrigger() {
                this.trigger('test');
            }

        };
        let observable = new observableClass();
        let boundObserver = observable.subscribe('test', observer.bind(undefined, 'abc'));
        assert.equal(triggered, 0);
        observable.testTrigger();
        assert.equal(triggered, 1);
        observable.unsubscribe('test', boundObserver);
        observable.testTrigger();
        assert.equal(triggered, 1);
    });
});
