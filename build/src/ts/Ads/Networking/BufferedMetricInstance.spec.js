import { InitializationMetric } from 'Ads/Utilities/SDKMetrics';
import { BufferedMetricInstance } from 'Ads/Networking/BufferedMetricInstance';
describe('BufferedMetricInstance', () => {
    let metricInstance;
    let mockMetricInstance;
    const metrics = [
        { metric: InitializationMetric.NativeInitialization, tags: {} },
        { metric: InitializationMetric.WebviewLoad, tags: { 'test': 'm1' } },
        { metric: InitializationMetric.WebviewInitialization, tags: { 'test': 'm1', 'm1': 'test' } },
        { metric: InitializationMetric.WebviewLoad, tags: {} }
    ];
    const times = [
        { metric: InitializationMetric.WebviewInitialization, time: 0, tags: {} },
        { metric: InitializationMetric.NativeInitialization, time: 100, tags: { 'test': 'm1' } },
        { metric: InitializationMetric.NativeInitialization, time: 120, tags: {} },
        { metric: InitializationMetric.WebviewLoad, time: 5000, tags: { 'test': 'm1', 'm1': 'test' } }
    ];
    beforeEach(() => {
        metricInstance = new BufferedMetricInstance();
        mockMetricInstance = {
            reportMetricEvent: jest.fn(),
            reportMetricEventWithTags: jest.fn(),
            reportTimingEvent: jest.fn(),
            reportTimingEventWithTags: jest.fn(),
            sendBatchedEvents: jest.fn()
        };
    });
    describe('reportMetricEvent', () => {
        beforeEach(() => {
            metrics.forEach(x => metricInstance.reportMetricEvent(x.metric));
            metricInstance.forwardTo(mockMetricInstance);
        });
        it('should forward all metrics', () => {
            expect(mockMetricInstance.reportMetricEventWithTags).toBeCalledTimes(metrics.length);
        });
        it('should not call reportMetricEvent', () => {
            expect(mockMetricInstance.reportMetricEvent).toBeCalledTimes(0);
        });
        it('should not call reportTimingEvent', () => {
            expect(mockMetricInstance.reportTimingEvent).toBeCalledTimes(0);
        });
        it('should not call reportTimingEventWithTags', () => {
            expect(mockMetricInstance.reportTimingEventWithTags).toBeCalledTimes(0);
        });
        it('should not call sendBatchedEvents', () => {
            expect(mockMetricInstance.sendBatchedEvents).toBeCalledTimes(0);
        });
        it('should forward in the same order', () => {
            metrics.forEach((x, i) => expect(mockMetricInstance.reportMetricEventWithTags).toHaveBeenNthCalledWith(i + 1, x.metric, {}));
        });
    });
    describe('reportMetricEventWithTags', () => {
        beforeEach(() => {
            metrics.forEach(x => metricInstance.reportMetricEventWithTags(x.metric, x.tags));
            metricInstance.forwardTo(mockMetricInstance);
        });
        it('should forward all metrics', () => {
            expect(mockMetricInstance.reportMetricEventWithTags).toBeCalledTimes(metrics.length);
        });
        it('should not call reportMetricEvent', () => {
            expect(mockMetricInstance.reportMetricEvent).toBeCalledTimes(0);
        });
        it('should not call reportTimingEvent', () => {
            expect(mockMetricInstance.reportTimingEvent).toBeCalledTimes(0);
        });
        it('should not call reportTimingEventWithTags', () => {
            expect(mockMetricInstance.reportTimingEventWithTags).toBeCalledTimes(0);
        });
        it('should not call sendBatchedEvents', () => {
            expect(mockMetricInstance.sendBatchedEvents).toBeCalledTimes(0);
        });
        it('should forward in the same order', () => {
            metrics.forEach((x, i) => expect(mockMetricInstance.reportMetricEventWithTags).toHaveBeenNthCalledWith(i + 1, x.metric, x.tags));
        });
    });
    describe('reportTimingEvent', () => {
        beforeEach(() => {
            times.forEach(x => metricInstance.reportTimingEvent(x.metric, x.time));
            metricInstance.forwardTo(mockMetricInstance);
        });
        it('should forward all metrics', () => {
            expect(mockMetricInstance.reportTimingEventWithTags).toBeCalledTimes(times.length);
        });
        it('should not call reportMetricEvent', () => {
            expect(mockMetricInstance.reportTimingEvent).toBeCalledTimes(0);
        });
        it('should not call reportTimingEvent', () => {
            expect(mockMetricInstance.reportMetricEvent).toBeCalledTimes(0);
        });
        it('should not call reportTimingEventWithTags', () => {
            expect(mockMetricInstance.reportMetricEventWithTags).toBeCalledTimes(0);
        });
        it('should not call sendBatchedEvents', () => {
            expect(mockMetricInstance.sendBatchedEvents).toBeCalledTimes(0);
        });
        it('should forward in the same order', () => {
            times.forEach((x, i) => expect(mockMetricInstance.reportTimingEventWithTags).toHaveBeenNthCalledWith(i + 1, x.metric, x.time, {}));
        });
    });
    describe('reportTimingEventWithTags', () => {
        beforeEach(() => {
            times.forEach(x => metricInstance.reportTimingEventWithTags(x.metric, x.time, x.tags));
            metricInstance.forwardTo(mockMetricInstance);
        });
        it('should forward all metrics', () => {
            expect(mockMetricInstance.reportTimingEventWithTags).toBeCalledTimes(times.length);
        });
        it('should not call reportMetricEvent', () => {
            expect(mockMetricInstance.reportTimingEvent).toBeCalledTimes(0);
        });
        it('should not call reportTimingEvent', () => {
            expect(mockMetricInstance.reportMetricEvent).toBeCalledTimes(0);
        });
        it('should not call reportTimingEventWithTags', () => {
            expect(mockMetricInstance.reportMetricEventWithTags).toBeCalledTimes(0);
        });
        it('should not call sendBatchedEvents', () => {
            expect(mockMetricInstance.sendBatchedEvents).toBeCalledTimes(0);
        });
        it('should forward in the same order', () => {
            times.forEach((x, i) => expect(mockMetricInstance.reportTimingEventWithTags).toHaveBeenNthCalledWith(i + 1, x.metric, x.time, x.tags));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVmZmVyZWRNZXRyaWNJbnN0YW5jZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9OZXR3b3JraW5nL0J1ZmZlcmVkTWV0cmljSW5zdGFuY2Uuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUUvRSxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO0lBQ3BDLElBQUksY0FBc0MsQ0FBQztJQUMzQyxJQUFJLGtCQUFtQyxDQUFDO0lBRXhDLE1BQU0sT0FBTyxHQUdQO1FBQ0YsRUFBRSxNQUFNLEVBQUUsb0JBQW9CLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtRQUMvRCxFQUFFLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFO1FBQ3BFLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixDQUFDLHFCQUFxQixFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzVGLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFO0tBQ3pELENBQUM7SUFFRixNQUFNLEtBQUssR0FJTDtRQUNGLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixDQUFDLHFCQUFxQixFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTtRQUN6RSxFQUFFLE1BQU0sRUFBRSxvQkFBb0IsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFB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