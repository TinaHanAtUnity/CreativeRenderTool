System.register(["mocha", "sinon", "chai", "Jaeger/JaegerSpan", "Constants/Platform"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, JaegerSpan_1, Platform_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (JaegerSpan_1_1) {
                JaegerSpan_1 = JaegerSpan_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            }
        ],
        execute: function () {
            describe('JaegerSpan', function () {
                var stubbedDateTimestamp = 3333;
                describe('on construction', function () {
                    var span;
                    beforeEach(function () {
                        sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
                        span = new JaegerSpan_1.JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
                    });
                    afterEach(function () {
                        Date.now.restore();
                    });
                    it('span should have a parentId if given one in constructor', function () {
                        span = new JaegerSpan_1.JaegerSpan('initialization?test=blah&hello=world#fragment=lol', '1234567890123456');
                        chai_1.assert.equal(span.parentId, '1234567890123456');
                    });
                    it('span should have traceId of length 16 with only 0-9 and a-z', function () {
                        chai_1.assert.lengthOf(span.traceId, 16);
                        chai_1.assert.isTrue(/^[a-z0-9]*$/.test(span.traceId));
                    });
                    it('span should have name initialization with query and fragments removed', function () {
                        chai_1.assert.equal(span.name, 'initialization');
                    });
                    it('span should have id of length 16 with only 0-9 and a-z', function () {
                        chai_1.assert.lengthOf(span.id, 16);
                        chai_1.assert.isTrue(/^[a-z0-9]*$/.test(span.traceId));
                    });
                    it('span should have kind of CLIENT', function () {
                        chai_1.assert.equal(span.kind, 'CLIENT');
                    });
                    it('span should have a timestamp equal to stubbedDateTimestamp * 1000 = 3333000', function () {
                        chai_1.assert.equal(span.timestamp, stubbedDateTimestamp * 1000);
                        chai_1.assert.equal(span.timestamp, 3333000);
                    });
                    it('span should have a duraton equal to 0', function () {
                        chai_1.assert.equal(span.duration, 0);
                    });
                    it('span should have debug set to true', function () {
                        chai_1.assert.isTrue(span.debug);
                    });
                    it('span should have shared set to true', function () {
                        chai_1.assert.isTrue(span.shared);
                    });
                    it('span should have a localEndpoint with serviceName \"ads-sdk\"', function () {
                        chai_1.assert.equal(span.localEndpoint.serviceName, 'ads-sdk');
                    });
                });
                describe('on add tag', function () {
                    var span;
                    beforeEach(function () {
                        var dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
                        span = new JaegerSpan_1.JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
                    });
                    afterEach(function () {
                        Date.now.restore();
                    });
                    it('span should have tag in map', function () {
                        span.addTag(JaegerSpan_1.JaegerTags.DeviceType, Platform_1.Platform[Platform_1.Platform.IOS]);
                        chai_1.assert.equal(span.tags[JaegerSpan_1.JaegerTags.DeviceType], 'IOS');
                        var addTagFunc = function (tmpSpan) {
                            tmpSpan.addTag(JaegerSpan_1.JaegerTags.StatusCode, '200');
                        };
                        addTagFunc(span);
                        chai_1.assert.equal(span.tags[JaegerSpan_1.JaegerTags.StatusCode], '200');
                    });
                });
                describe('on add annotation', function () {
                    var span;
                    beforeEach(function () {
                        var dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
                        span = new JaegerSpan_1.JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
                    });
                    afterEach(function () {
                        Date.now.restore();
                    });
                    it('span should have an annotation', function () {
                        span.addAnnotation('first');
                        chai_1.assert.equal(span.annotations.length, 1);
                        chai_1.assert.equal(span.annotations[0].value, 'first');
                        chai_1.assert.equal(span.annotations[0].timestamp, stubbedDateTimestamp * 1000);
                        span.addAnnotation('second');
                        chai_1.assert.equal(span.annotations.length, 2);
                        chai_1.assert.equal(span.annotations[1].value, 'second');
                        chai_1.assert.equal(span.annotations[1].timestamp, stubbedDateTimestamp * 1000);
                    });
                });
                describe('on stop', function () {
                    var span;
                    beforeEach(function () {
                        var dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
                        span = new JaegerSpan_1.JaegerSpan('initialization?test=blah&hello=world#fragment=lol');
                        dateStub.returns(stubbedDateTimestamp + 100); // stop network time should be 100 ms more
                        span.stop();
                    });
                    afterEach(function () {
                        Date.now.restore();
                    });
                    it('span should have duration equal to 100000 micro seconds', function () {
                        chai_1.assert.equal(span.duration, 100000);
                    });
                });
                describe('on to json', function () {
                    var span;
                    var jsonSpan;
                    var dateStub;
                    beforeEach(function () {
                        dateStub = sinon.stub(Date, 'now').returns(stubbedDateTimestamp);
                        var stringStub = sinon.stub(String.prototype, 'substring').returns('1234567890123456');
                        span = new JaegerSpan_1.JaegerSpan('Initialize');
                        dateStub.returns(stubbedDateTimestamp + 100);
                        span.addAnnotation('click event');
                        span.addTag(JaegerSpan_1.JaegerTags.DeviceType, 'IOS');
                        span.stop();
                        jsonSpan = JSON.stringify(span);
                    });
                    afterEach(function () {
                        Date.now.restore();
                        String.prototype.substring.restore();
                    });
                    it('json should match', function () {
                        var expectedJson = '{"traceId":"1234567890123456","id":"1234567890123456","kind":"CLIENT","timestamp":3333000,"duration":100000,"debug":true,"shared":true,"localEndpoint":{"serviceName":"ads-sdk"},"annotations":[{"timestamp":3433000,"value":"click event"}],"tags":{"device.type":"IOS"},"name":"Initialize"}';
                        chai_1.assert.equal(expectedJson, jsonSpan);
                    });
                    it('json should match when parentId supplied', function () {
                        dateStub.returns(stubbedDateTimestamp);
                        span = new JaegerSpan_1.JaegerSpan('Initialize', '234');
                        dateStub.returns(stubbedDateTimestamp + 100);
                        span.addAnnotation('click event');
                        span.addTag(JaegerSpan_1.JaegerTags.DeviceType, 'IOS');
                        span.stop();
                        jsonSpan = JSON.stringify(span);
                        var expectedJson = '{"traceId":"1234567890123456","id":"1234567890123456","kind":"CLIENT","timestamp":3333000,"duration":100000,"debug":true,"shared":true,"localEndpoint":{"serviceName":"ads-sdk"},"annotations":[{"timestamp":3433000,"value":"click event"}],"tags":{"device.type":"IOS"},"parentId":"234","name":"Initialize"}';
                        chai_1.assert.equal(expectedJson, jsonSpan);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyU3BhblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWVnZXJTcGFuVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBTUEsUUFBUSxDQUFDLFlBQVksRUFBRTtnQkFFbkIsSUFBTSxvQkFBb0IsR0FBVyxJQUFJLENBQUM7Z0JBRTFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtvQkFFeEIsSUFBSSxJQUFnQixDQUFDO29CQUNyQixVQUFVLENBQUM7d0JBQ1AsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7d0JBQ3RELElBQUksR0FBRyxJQUFJLHVCQUFVLENBQUMsbURBQW1ELENBQUMsQ0FBQztvQkFDL0UsQ0FBQyxDQUFDLENBQUM7b0JBRUgsU0FBUyxDQUFDO3dCQUNZLElBQUksQ0FBQyxHQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQzFDLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyx5REFBeUQsRUFBRTt3QkFDMUQsSUFBSSxHQUFHLElBQUksdUJBQVUsQ0FBQyxtREFBbUQsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO3dCQUMvRixhQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztvQkFDcEQsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLDZEQUE2RCxFQUFFO3dCQUM5RCxhQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQ2xDLGFBQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQkFDcEQsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHVFQUF1RSxFQUFFO3dCQUN4RSxhQUFNLENBQUMs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