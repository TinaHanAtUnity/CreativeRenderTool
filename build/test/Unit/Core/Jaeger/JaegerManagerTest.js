import { assert } from 'chai';
import { JaegerManager } from 'Core/Managers/JaegerManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import * as sinon from 'sinon';
describe('JaegerManager', () => {
    let jaegerManager;
    let request;
    let requestPostStub;
    beforeEach(() => {
        const _request = sinon.createStubInstance(RequestManager);
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
        let jaegerSpan;
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
        let span;
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
            Date.now.restore();
        });
    });
    describe('on stop', () => {
        let span;
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
            assert.equal(requestPostStub.firstCall.args[0], 'https://traces.unityads.unity3d.com/api/v2/spans');
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
            assert.equal(requestPostStub.firstCall.args[0], 'https://traces.unityads.unity3d.com/api/v2/spans');
            const postedSpans = JSON.parse(requestPostStub.firstCall.args[1]);
            assert.equal(postedSpans.length, 2);
            assert.equal(JSON.stringify(requestPostStub.firstCall.args[2]), JSON.stringify([['Content-Type', 'application/json']]));
            assert.equal(requestPostStub.firstCall.args.length, 3);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9KYWVnZXIvSmFlZ2VyTWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFL0IsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7SUFFM0IsSUFBSSxhQUE0QixDQUFDO0lBQ2pDLElBQUksT0FBdUIsQ0FBQztJQUM1QixJQUFJLGVBQWdDLENBQUM7SUFFckMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUMxRCxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQ25CLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7UUFDN0IsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtZQUN2QyxNQUFNLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7UUFDeEMsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtZQUN2QyxhQUFhLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFD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