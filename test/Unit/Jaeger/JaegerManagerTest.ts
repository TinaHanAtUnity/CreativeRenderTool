import { assert } from 'chai';
import { JaegerManager } from 'Core/Jaeger/JaegerManager';
import { IJaegerSpan, JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';

describe('JaegerManager', () => {

    let jaegerManager: JaegerManager;
    let request: Request;
    let requestPostStub: sinon.SinonStub;

    beforeEach(() => {
        const _request = sinon.createStubInstance(Request);
        request = _request;
        jaegerManager = new JaegerManager(_request);
    });

    describe('on construction', () => {
        it('it should have tracing disabled', () => {
            assert.isFalse(jaegerManager.isJaegerTracingEnabled());
        });
    });

    describe('on setJaegerTracingEnabled', () => {
        it('should set tracing enabled flag', () => {
            jaegerManager.setJaegerTracingEnabled(true);
            assert.isTrue(jaegerManager.isJaegerTracingEnabled());
            jaegerManager.setJaegerTracingEnabled(false);
            assert.isFalse(jaegerManager.isJaegerTracingEnabled());
        });
    });

    describe('on getTraceId', () => {

        let jaegerSpan: IJaegerSpan;
        beforeEach(() => {
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

        it('should return \"4f2ae4f20b6c4539:45bcdf4512c14331:0:00\" when disabled', () => {
            const traceId = jaegerManager.getTraceId(jaegerSpan);
            assert.equal(traceId[0], 'uber-trace-id');
            assert.equal(traceId[1], '4f2ae4f20b6c4539:45bcdf4512c14331:0:00');
        });

        it('should return \"4f2ae4f20b6c4539:45bcdf4512c14331:0:01\" when enabled', () => {
            jaegerManager.setJaegerTracingEnabled(true);
            const traceId = jaegerManager.getTraceId(jaegerSpan);
            assert.equal(traceId[0], 'uber-trace-id');
            assert.equal(traceId[1], '4f2ae4f20b6c4539:45bcdf4512c14331:0:01');
        });

        it('should return \"4f2ae4f20b6c4539:45bcdf4512c14331:45bcdf4512c14332:00\" when parentId is set', () => {
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
            const traceId = jaegerManager.getTraceId(jaegerSpan);
            assert.equal(traceId[0], 'uber-trace-id');
            assert.equal(traceId[1], '4f2ae4f20b6c4539:45bcdf4512c14331:45bcdf4512c14332:00');
        });

        it('should return \"4f2ae4f20b6c4539:45bcdf4512c14331:45bcdf4512c14332:01\" when parentId is set and tracing enabled', () => {
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
            const traceId = jaegerManager.getTraceId(jaegerSpan);
            assert.equal(traceId[0], 'uber-trace-id');
            assert.equal(traceId[1], '4f2ae4f20b6c4539:45bcdf4512c14331:45bcdf4512c14332:01');
        });
    });

    describe('on startSpan', () => {
        let span: JaegerSpan;

        afterEach(() => {
            jaegerManager.stop(span);
        });

        it('should return span with the name set correctly', () => {
            span = jaegerManager.startSpan('test operation');
            assert.equal(span.name, 'test operation');
        });

        it('should return annotations with correct values', () => {
            sinon.stub(Date, 'now').returns(1000);
            span = jaegerManager.startSpan('test operation');
            span.addAnnotation('annotation1 value');
            span.addAnnotation('annotation2 value');
            assert.lengthOf(span.annotations, 2);
            assert.equal(span.annotations[0].timestamp, 1000000);
            assert.equal(span.annotations[1].timestamp, 1000000);
            assert.equal(span.annotations[0].value, 'annotation1 value');
            assert.equal(span.annotations[1].value, 'annotation2 value');
            (<sinon.SinonStub>Date.now).restore();
        });
    });

    describe('on stop', () => {

        let span: JaegerSpan;

        beforeEach(() => {
            requestPostStub = sinon.stub();
            request.post = requestPostStub;
            jaegerManager = new JaegerManager(request);
            jaegerManager.setJaegerTracingEnabled(true); // needs to be enabled to try to send requests
            span = jaegerManager.startSpan('test stopNetworkSpan');
        });

        it('should call span.stop', () => {
            const stopStub = sinon.stub(span, 'stop');
            jaegerManager.stop(span);
            assert.equal(stopStub.callCount, 1);
            stopStub.restore();
        });

        it('should call request.post', () => {
            jaegerManager.stop(span);
            assert.equal(requestPostStub.callCount, 1);
            assert.equal(requestPostStub.firstCall.args[0], 'https://tracing-collector-stg.internal.unity3d.com/api/v2/spans');
            assert.equal(requestPostStub.firstCall.args[1], JSON.stringify([span]));
            assert.equal(JSON.stringify(requestPostStub.firstCall.args[2]), JSON.stringify([['Content-Type', 'application/json']]));
            assert.equal(requestPostStub.firstCall.args.length, 3);
            // second call should not have the first span
            const secondSpan = jaegerManager.startSpan('second test stopNetworkSpan');
            jaegerManager.stop(secondSpan);
            assert.equal(requestPostStub.callCount, 2);
            assert.equal(requestPostStub.secondCall.args[1], JSON.stringify([secondSpan]));
        });

        it('should call request.post once when multiple spans are created', () => {
            const secondSpan = jaegerManager.startSpan('second test stopNetworkSpan');
            jaegerManager.stop(secondSpan);
            jaegerManager.stop(span);
            assert.equal(requestPostStub.callCount, 1);
            assert.equal(requestPostStub.firstCall.args[0], 'https://tracing-collector-stg.internal.unity3d.com/api/v2/spans');
            const postedSpans: IJaegerSpan[] = JSON.parse(requestPostStub.firstCall.args[1]);
            assert.equal(postedSpans.length, 2);
            assert.equal(JSON.stringify(requestPostStub.firstCall.args[2]), JSON.stringify([['Content-Type', 'application/json']]));
            assert.equal(requestPostStub.firstCall.args.length, 3);
        });

    });

});
