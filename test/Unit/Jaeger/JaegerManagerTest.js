System.register(["mocha", "sinon", "chai", "Jaeger/JaegerManager", "Utilities/Request"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, JaegerManager_1, Request_1;
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
            function (JaegerManager_1_1) {
                JaegerManager_1 = JaegerManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            }
        ],
        execute: function () {
            describe('JaegerManager', function () {
                var jaegerManager;
                var request;
                var requestPostStub;
                beforeEach(function () {
                    var _request = sinon.createStubInstance(Request_1.Request);
                    request = _request;
                    jaegerManager = new JaegerManager_1.JaegerManager(_request);
                });
                describe('on construction', function () {
                    it('it should have tracing disabled', function () {
                        chai_1.assert.isFalse(jaegerManager.isJaegerTracingEnabled());
                    });
                });
                describe('on setJaegerTracingEnabled', function () {
                    it('should set tracing enabled flag', function () {
                        jaegerManager.setJaegerTracingEnabled(true);
                        chai_1.assert.isTrue(jaegerManager.isJaegerTracingEnabled());
                        jaegerManager.setJaegerTracingEnabled(false);
                        chai_1.assert.isFalse(jaegerManager.isJaegerTracingEnabled());
                    });
                });
                describe('on getTraceId', function () {
                    var jaegerSpan;
                    beforeEach(function () {
                        jaegerSpan = {
                            traceId: '4f2ae4f20b6c4539',
                            name: 'test',
                            id: '45bcdf4512c14331',
                            kind: 'CLIENT',
                            timestamp: 0,
                            duration: 100,
                            debug: true,
                            shared: true,
                            localEndpoint: { serviceName: 'blah' },
                            annotations: [],
                            tags: {},
                            stop: sinon.stub()
                        };
                    });
                    it('should return \"4f2ae4f20b6c4539:45bcdf4512c14331:0:00\" when disabled', function () {
                        var traceId = jaegerManager.getTraceId(jaegerSpan);
                        chai_1.assert.equal(traceId[0], 'uber-trace-id');
                        chai_1.assert.equal(traceId[1], '4f2ae4f20b6c4539:45bcdf4512c14331:0:00');
                    });
                    it('should return \"4f2ae4f20b6c4539:45bcdf4512c14331:0:01\" when enabled', function () {
                        jaegerManager.setJaegerTracingEnabled(true);
                        var traceId = jaegerManager.getTraceId(jaegerSpan);
                        chai_1.assert.equal(traceId[0], 'uber-trace-id');
                        chai_1.assert.equal(traceId[1], '4f2ae4f20b6c4539:45bcdf4512c14331:0:01');
                    });
                    it('should return \"4f2ae4f20b6c4539:45bcdf4512c14331:45bcdf4512c14332:00\" when parentId is set', function () {
                        jaegerSpan = {
                            traceId: '4f2ae4f20b6c4539',
                            name: 'test',
                            id: '45bcdf4512c14331',
                            kind: 'CLIENT',
                            timestamp: 0,
                            duration: 100,
                            debug: true,
                            shared: true,
                            localEndpoint: { serviceName: 'blah' },
                            annotations: [],
                            tags: {},
                            parentId: '45bcdf4512c14332',
                            stop: sinon.stub()
                        };
                        var traceId = jaegerManager.getTraceId(jaegerSpan);
                        chai_1.assert.equal(traceId[0], 'uber-trace-id');
                        chai_1.assert.equal(traceId[1], '4f2ae4f20b6c4539:45bcdf4512c14331:45bcdf4512c14332:00');
                    });
                    it('should return \"4f2ae4f20b6c4539:45bcdf4512c14331:45bcdf4512c14332:01\" when parentId is set and tracing enabled', function () {
                        jaegerSpan = {
                            traceId: '4f2ae4f20b6c4539',
                            name: 'test',
                            id: '45bcdf4512c14331',
                            kind: 'CLIENT',
                            timestamp: 0,
                            duration: 100,
                            debug: true,
                            shared: true,
                            localEndpoint: { serviceName: 'blah' },
                            annotations: [],
                            tags: {},
                            parentId: '45bcdf4512c14332',
                            stop: sinon.stub()
                        };
                        jaegerManager.setJaegerTracingEnabled(true);
                        var traceId = jaegerManager.getTraceId(jaegerSpan);
                        chai_1.assert.equal(traceId[0], 'uber-trace-id');
                        chai_1.assert.equal(traceId[1], '4f2ae4f20b6c4539:45bcdf4512c14331:45bcdf4512c14332:01');
                    });
                });
                describe('on startSpan', function () {
                    var span;
                    afterEach(function () {
                        jaegerManager.stop(span);
                    });
                    it('should return span with the name set correctly', function () {
                        span = jaegerManager.startSpan('test operation');
                        chai_1.assert.equal(span.name, 'test operation');
                    });
                    it('should return annotations with correct values', function () {
                        sinon.stub(Date, 'now').returns(1000);
                        span = jaegerManager.startSpan('test operation');
                        span.addAnnotation('annotation1 value');
                        span.addAnnotation('annotation2 value');
                        chai_1.assert.lengthOf(span.annotations, 2);
                        chai_1.assert.equal(span.annotations[0].timestamp, 1000000);
                        chai_1.assert.equal(span.annotations[1].timestamp, 1000000);
                        chai_1.assert.equal(span.annotations[0].value, 'annotation1 value');
                        chai_1.assert.equal(span.annotations[1].value, 'annotation2 value');
                        Date.now.restore();
                    });
                });
                describe('on stop', function () {
                    var span;
                    beforeEach(function () {
                        requestPostStub = sinon.stub();
                        request.post = requestPostStub;
                        jaegerManager = new JaegerManager_1.JaegerManager(request);
                        jaegerManager.setJaegerTracingEnabled(true); // needs to be enabled to try to send requests
                        span = jaegerManager.startSpan('test stopNetworkSpan');
                    });
                    it('should call span.stop', function () {
                        var stopStub = sinon.stub(span, 'stop');
                        jaegerManager.stop(span);
                        chai_1.assert.equal(stopStub.callCount, 1);
                        stopStub.restore();
                    });
                    it('should call request.post', function () {
                        jaegerManager.stop(span);
                        chai_1.assert.equal(requestPostStub.callCount, 1);
                        chai_1.assert.equal(requestPostStub.firstCall.args[0], 'https://tracing-collector-stg.internal.unity3d.com/api/v2/spans');
                        chai_1.assert.equal(requestPostStub.firstCall.args[1], JSON.stringify([span]));
                        chai_1.assert.equal(JSON.stringify(requestPostStub.firstCall.args[2]), JSON.stringify([['Content-Type', 'application/json']]));
                        chai_1.assert.equal(requestPostStub.firstCall.args.length, 3);
                        // second call should not have the first span
                        var secondSpan = jaegerManager.startSpan('second test stopNetworkSpan');
                        jaegerManager.stop(secondSpan);
                        chai_1.assert.equal(requestPostStub.callCount, 2);
                        chai_1.assert.equal(requestPostStub.secondCall.args[1], JSON.stringify([secondSpan]));
                    });
                    it('should call request.post once when multiple spans are created', function () {
                        var secondSpan = jaegerManager.startSpan('second test stopNetworkSpan');
                        jaegerManager.stop(secondSpan);
                        jaegerManager.stop(span);
                        chai_1.assert.equal(requestPostStub.callCount, 1);
                        chai_1.assert.equal(requestPostStub.firstCall.args[0], 'https://tracing-collector-stg.internal.unity3d.com/api/v2/spans');
                        var postedSpans = JSON.parse(requestPostStub.firstCall.args[1]);
                        chai_1.assert.equal(postedSpans.length, 2);
                        chai_1.assert.equal(JSON.stringify(requestPostStub.firstCall.args[2]), JSON.stringify([['Content-Type', 'application/json']]));
                        chai_1.assert.equal(requestPostStub.firstCall.args.length, 3);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJKYWVnZXJNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBWUEsUUFBUSxDQUFDLGVBQWUsRUFBRTtnQkFFdEIsSUFBSSxhQUE0QixDQUFDO2dCQUNqQyxJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksZUFBZ0MsQ0FBQztnQkFFckMsVUFBVSxDQUFDO29CQUNQLElBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBTyxDQUFDLENBQUM7b0JBQ25ELE9BQU8sR0FBRyxRQUFRLENBQUM7b0JBQ25CLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ2hELENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtvQkFDeEIsRUFBRSxDQUFDLGlDQUFpQyxFQUFFO3dCQUNsQyxhQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7b0JBQzNELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyw0QkFBNEIsRUFBRTtvQkFDbkMsRUFBRSxDQUFDLGlDQUFpQyxFQUFFO3dCQUNsQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzVDLGFBQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQzt3QkFDdEQsYUFBYSxDQUFDLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUM3QyxhQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7b0JBQzNELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyxlQUFlLEVBQUU7b0JB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