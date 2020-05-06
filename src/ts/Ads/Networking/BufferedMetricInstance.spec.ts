
import { IMetricInstance } from 'Ads/Networking/MetricInstance';
import { InitializationMetric } from 'Ads/Utilities/SDKMetrics';
import { BufferedMetricInstance } from 'Ads/Networking/BufferedMetricInstance';

describe('BufferedMetricInstance', () => {
    let metricInstance: BufferedMetricInstance;
    let mockMetricInstance: IMetricInstance;

    const metrics: {
        metric: InitializationMetric;
        tags: { [key: string]: string };
    }[] = [
        { metric: InitializationMetric.NativeInitialization, tags: {} },
        { metric: InitializationMetric.WebviewLoad, tags: { 'test': 'm1' } },
        { metric: InitializationMetric.WebviewInitialization, tags: { 'test': 'm1', 'm1': 'test' } },
        { metric: InitializationMetric.WebviewLoad, tags: {} }
    ];

    const times: {
        metric: InitializationMetric;
        time: number;
        tags: { [key: string]: string };
    }[] = [
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
            metrics.forEach(x =>
                metricInstance.reportMetricEvent(x.metric)
            );

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
            metrics.forEach((x, i) =>
                expect(mockMetricInstance.reportMetricEventWithTags).toHaveBeenNthCalledWith(i + 1, x.metric, {})
            );
        });
    });

    describe('reportMetricEventWithTags', () => {
        beforeEach(() => {
            metrics.forEach(x =>
                metricInstance.reportMetricEventWithTags(x.metric, x.tags)
            );

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
            metrics.forEach((x, i) =>
                expect(mockMetricInstance.reportMetricEventWithTags).toHaveBeenNthCalledWith(i + 1, x.metric, x.tags)
            );
        });
    });

    describe('reportTimingEvent', () => {
        beforeEach(() => {
            times.forEach(x =>
                metricInstance.reportTimingEvent(x.metric, x.time)
            );

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
            times.forEach((x, i) =>
                expect(mockMetricInstance.reportTimingEventWithTags).toHaveBeenNthCalledWith(i + 1, x.metric, x.time, {})
            );
        });
    });

    describe('reportTimingEventWithTags', () => {
        beforeEach(() => {
            times.forEach(x =>
                metricInstance.reportTimingEventWithTags(x.metric, x.time, x.tags)
            );

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
            times.forEach((x, i) =>
                expect(mockMetricInstance.reportTimingEventWithTags).toHaveBeenNthCalledWith(i + 1, x.metric, x.time, x.tags)
            );
        });
    });

});
