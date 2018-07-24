import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { JaegerUtilities } from 'Jaeger/JaegerUtilities';

describe('JaegerUtilitiesTest', () => {
    const stubbedDateTimestamp: number = 3333;

    describe('generate timestamp', () => {
        beforeEach(() => {
            sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
        });

        afterEach(() => {
            (<sinon.SinonStub>Date.now).restore();
        });

        it('should return stubbedDateTimestamp * 1000', () => {
            assert.equal(JaegerUtilities.genTimestamp(), 3333000);
            assert.equal(JaegerUtilities.genTimestamp(), stubbedDateTimestamp * 1000);
        });

    });

    describe('on stripQueryAndFragment', () => {
        const tests: Array<{
            input: string;
            output: string;
        }> = [{
            input: 'http://google.com/test?key=value&hello=world',
            output: 'http://google.com/test'
        }, {
            input: 'http://google.com/test#key=value&hello=world',
            output: 'http://google.com/test'
        }, {
            input: 'http://google.com/test?key=value&hello=world#more=things,4&to=test',
            output: 'http://google.com/test'
        }, {
            input: 'http://google.com/test#more=things,4&to=test?key=value&hello=world',
            output: 'http://google.com/test'
        }];
        tests.forEach((t) => {
            it('stripQueryAndFragment should ouput url without query or fragment', () => {
                const urlString = JaegerUtilities.stripQueryAndFragment(t.input);
                assert.equal(urlString, t.output);
            });
        });
    });
});
