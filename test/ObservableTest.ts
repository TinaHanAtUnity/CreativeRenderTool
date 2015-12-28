/// <reference path="../typings/tsd.d.ts" />

import 'mocha';
import { assert } from 'chai';

import { Observable } from '../src/ts/Utilities/Observable';

describe('ObservableTest', () => {
    it('should unsubscribe', () => {
        let triggered = 0;
        let observableClass = class TestObservable extends Observable {

            public testTrigger() {
                this.trigger('test');
            }

            public observer() {
                triggered++;
            }

        };
        let observable = new observableClass();
        observable.subscribe('test', observable, 'observer');
        assert.equal(triggered, 0);
        observable.testTrigger();
        assert.equal(triggered, 1);
        observable.unsubscribe('test', observable, 'observer');
        observable.testTrigger();
        assert.equal(triggered, 1);
    });

    it('should unsubscribe from bound observer', () => {
        let triggered = 0;
        let observableClass = class TestObservable extends Observable {

            public testTrigger() {
                this.trigger('test');
            }

            public observer(abc) {
                assert.equal(abc, 'abc');
                triggered++;
            }

        };
        let observable = new observableClass();
        observable.subscribe('test', observable, 'observer', 'abc');
        assert.equal(triggered, 0);
        observable.testTrigger();
        assert.equal(triggered, 1);
        observable.unsubscribe('test', observable, 'observer');
        observable.testTrigger();
        assert.equal(triggered, 1);
        assert.equal(triggered, 1);
    });
});
