import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { JaegerSpan, JaegerTags } from 'Core/Jaeger/JaegerSpan';
import 'mocha';
import * as sinon from 'sinon';
describe('JaegerSpan', () => {
    const stubbedDateTimestamp = 3333;
    describe('on construction', () => {
        let span;
        beforeEach(() => {
            sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
        });
        afterEach(() => {
            Date.now.restore();
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
        let span;
        beforeEach(() => {
            const dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
        });
        afterEach(() => {
            Date.now.restore();
        });
        it('span should have tag in map', () => {
            span.addTag(JaegerTags.DeviceType, Platform[Platform.IOS]);
            assert.equal(span.tags[JaegerTags.DeviceType], 'IOS');
            const addTagFunc = (tmpSpan) => {
                tmpSpan.addTag(JaegerTags.StatusCode, '200');
            };
            addTagFunc(span);
            assert.equal(span.tags[JaegerTags.StatusCode], '200');
        });
    });
    describe('on add annotation', () => {
        let span;
        beforeEach(() => {
            const dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
        });
        afterEach(() => {
            Date.now.restore();
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
        let span;
        beforeEach(() => {
            const dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
            span = new JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
            dateStub.returns(stubbedDateTimestamp + 100); // stop network time should be 100 ms more
            span.stop();
        });
        afterEach(() => {
            Date.now.restore();
        });
        it('span should have duration equal to 100000 micro seconds', () => {
            assert.equal(span.duration, 100000);
        });
    });
    describe('on to json', () => {
        let span;
        let jsonSpan;
        let dateStub;
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
            Date.now.restore();
            String.prototype.substring.restore();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyU3BhblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9KYWVnZXIvSmFlZ2VyU3BhblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRS9CLFFBQVEsQ0FBQyxZQUFZLEVBQUUsR0FBRyxFQUFFO0lBRXhCLE1BQU0sb0JBQW9CLEdBQVcsSUFBSSxDQUFDO0lBRTFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFFN0IsSUFBSSxJQUFnQixDQUFDO1FBQ3JCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUN0RCxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsbURBQW1ELENBQUMsQ0FBQztRQUMvRSxDQUFDLENBQUMsQ0FBQztRQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDTyxJQUFJLENBQUMsR0FBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHlEQUF5RCxFQUFFLEdBQUcsRUFBRTtZQUMvRCxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUMsbURBQW1ELEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUMvRixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUNwRCxDQUFDLENB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