import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { JaegerSpan, JaegerTags } from 'Jaeger/JaegerSpan';
import { Platform } from 'Constants/Platform';

describe('JaegerSpan', () => {

    const stubbedDateTimestamp: number = 3333;

    describe('on construction', () => {

        let span: JaegerSpan;
        beforeEach(() => {
            sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
        });

        afterEach(() => {
            (<sinon.SinonStub>Date.now).restore();
        });

        it('span should have a parentId if given one in constructor', () => {
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol', '1234567890123456');
            assert.equal(span.parentId, '1234567890123456');
        });

        it('span should have traceId of length 16 with only 0-9 and a-z', () => {
            assert.lengthOf(span.traceId, 16);
            assert.isTrue(/^[a-z0-9]*$/.test(span.traceId));
        });

        it('span should have name initialization with query and fragments removed', () => {
            assert.equal(span.name, 'initialization');
        });

        it('span should have id of length 16 with only 0-9 and a-z', () => {
            assert.lengthOf(span.id, 16);
            assert.isTrue(/^[a-z0-9]*$/.test(span.traceId));
        });

        it('span should have kind of CLIENT', () => {
            assert.equal(span.kind, 'CLIENT');
        });

        it('span should have a timestamp equal to stubbedDateTimestamp * 1000 = 3333000', () => {
            assert.equal(span.timestamp, stubbedDateTimestamp * 1000);
            assert.equal(span.timestamp, 3333000);
        });

        it('span should have a duraton equal to 0', () => {
            assert.equal(span.duration, 0);
        });

        it('span should have debug set to true', () => {
            assert.isTrue(span.debug);
        });

        it('span should have shared set to true', () => {
            assert.isTrue(span.shared);
        });

        it('span should have a localEndpoint with serviceName \"ads-sdk\"', () => {
            assert.equal(span.localEndpoint.serviceName, 'ads-sdk');
        });

    });

    describe('on add tag', () => {
        let span: JaegerSpan;

        beforeEach(() => {
            const dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
        });

        afterEach(() => {
            (<sinon.SinonStub>Date.now).restore();
        });

        it('span should have tag in map', () => {
            span.addTag(JaegerTags.DeviceType, Platform[Platform.IOS]);
            assert.equal(span.tags[JaegerTags.DeviceType], 'IOS');
            const addTagFunc = (tmpSpan: JaegerSpan) => {
                tmpSpan.addTag(JaegerTags.StatusCode, '200');
            };
            addTagFunc(span);
            assert.equal(span.tags[JaegerTags.StatusCode], '200');
        });
    });

    describe('on add annotation', () => {
        let span: JaegerSpan;

        beforeEach(() => {
            const dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
        });

        afterEach(() => {
            (<sinon.SinonStub>Date.now).restore();
        });

        it('span should have an annotation', () => {
            span.addAnnotation('first');
            assert.equal(span.annotations.length, 1);
            assert.equal(span.annotations[0].value, 'first');
            assert.equal(span.annotations[0].timestamp, stubbedDateTimestamp * 1000);
            span.addAnnotation('second');
            assert.equal(span.annotations.length, 2);
            assert.equal(span.annotations[1].value, 'second');
            assert.equal(span.annotations[1].timestamp, stubbedDateTimestamp * 1000);
        });
    });

    describe('on stop', () => {
        let span: JaegerSpan;

        beforeEach(() => {
            const dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
            dateStub.returns(stubbedDateTimestamp + 100); // stop network time should be 100 ms more
            span.stop();
        });

        afterEach(() => {
            (<sinon.SinonStub>Date.now).restore();
        });

        it('span should have duration equal to 100000 micro seconds', () => {
            assert.equal(span.duration, 100000);
        });
    });

    describe('on to json', () => {
        let span: JaegerSpan;
        let jsonSpan: string;
        let dateStub: sinon.SinonStub;

        beforeEach(() => {
            dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            const stringStub = sinon.stub(String.prototype, 'substring').returns('1234567890123456');
            span = new JaegerSpan('Initialize');
            dateStub.returns(stubbedDateTimestamp + 100);
            span.addAnnotation('click event');
            span.addTag(JaegerTags.DeviceType, 'IOS');
            span.stop();
            jsonSpan = JSON.stringify(span);
        });

        afterEach(() => {
            (<sinon.SinonStub>Date.now).restore();
            (<sinon.SinonStub>String.prototype.substring).restore();
        });

        it('json should match', () => {
            const expectedJson = '{"traceId":"1234567890123456","id":"1234567890123456","kind":"CLIENT","timestamp":3333000,"duration":100000,"debug":true,"shared":true,"localEndpoint":{"serviceName":"ads-sdk"},"annotations":[{"timestamp":3433000,"value":"click event"}],"tags":{"device.type":"IOS"},"name":"Initialize"}';
            assert.equal(expectedJson, jsonSpan);
        });

        it('json should match when parentId supplied', () => {
            dateStub.returns(stubbedDateTimestamp);
            span = new JaegerSpan('Initialize', '234');
            dateStub.returns(stubbedDateTimestamp + 100);
            span.addAnnotation('click event');
            span.addTag(JaegerTags.DeviceType, 'IOS');
            span.stop();
            jsonSpan = JSON.stringify(span);
            const expectedJson = '{"traceId":"1234567890123456","id":"1234567890123456","kind":"CLIENT","timestamp":3333000,"duration":100000,"debug":true,"shared":true,"localEndpoint":{"serviceName":"ads-sdk"},"annotations":[{"timestamp":3433000,"value":"click event"}],"tags":{"device.type":"IOS"},"parentId":"234","name":"Initialize"}';
            assert.equal(expectedJson, jsonSpan);
        });

    });

});
