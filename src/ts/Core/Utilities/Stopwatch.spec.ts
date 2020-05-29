import { IStopwatch, createStopwatch } from 'Core/Utilities/Stopwatch';
import { InitializationMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

describe('TimeMeasurements', () => {
    let performanceNowSpy: jest.SpyInstance;
    let stopwatch: IStopwatch;

    beforeEach(() => {
        performanceNowSpy = jest.spyOn(performance, 'now');
        performanceNowSpy.mockReturnValue(0);
        stopwatch = createStopwatch();
    });

    afterEach(() => {
        performanceNowSpy.mockRestore();
    });

    describe('measure', () => {
        describe('normal use case', () => {
            beforeEach(() => {
                performanceNowSpy
                    .mockReturnValueOnce(100)
                    .mockReturnValueOnce(300)
                    .mockReturnValueOnce(700);

                stopwatch.start();
                stopwatch.stop();
                stopwatch.send(InitializationMetric.WebviewInitialization, { 'simple': 'tag' });
            });

            it('should send metric', () => {
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(1);
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(InitializationMetric.WebviewInitialization, 200, { 'simple': 'tag' });
            });
        });

        describe('start stop start stop', () => {
            beforeEach(() => {
                performanceNowSpy
                    .mockReturnValueOnce(100)
                    .mockReturnValueOnce(300)
                    .mockReturnValueOnce(700)
                    .mockReturnValueOnce(1100);

                stopwatch.start();
                stopwatch.stop();
                stopwatch.start();
                stopwatch.stop();
                stopwatch.send(InitializationMetric.WebviewInitialization, { 'simple': 'tag' });
            });

            it('should send metric', () => {
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(1);
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(InitializationMetric.WebviewInitialization, 600, { 'simple': 'tag' });
            });
        });
    });
});
