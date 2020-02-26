import { ITimeMeasurements, createMeasurementsInstances } from "Core/Utilities/TimeMeasurements";
import { InitializationMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

describe('TimeMeasurements', () => {
    let performanceNowSpy: jest.SpyInstance;
    let timeMeasurement: ITimeMeasurements;

    beforeEach(() => {
        performanceNowSpy = jest.spyOn(performance, 'now');
        performanceNowSpy.mockReturnValue(0)
        timeMeasurement = createMeasurementsInstances(InitializationMetric.WebviewInitialization);
    });

    afterEach(() => {
        performanceNowSpy.mockRestore();
    });
    
    describe('start and stop', () => {
        describe('normal use case', () => {
            beforeEach(() => {
                performanceNowSpy
                    .mockReturnValueOnce(100)
                    .mockReturnValueOnce(249);

                timeMeasurement.start(InitializationMetric.WebviewPageLoading, []);
                timeMeasurement.stop(InitializationMetric.WebviewPageLoading);
            });

            it('should send metric', () => {
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(InitializationMetric.WebviewPageLoading, 149, expect.anything());
            });
        });

        describe('start and stop measurement send event once', () => {
            beforeEach(() => {
                performanceNowSpy
                    .mockReturnValueOnce(100)
                    .mockReturnValue(249);

                timeMeasurement.start(InitializationMetric.WebviewPageLoading, []);
                timeMeasurement.stop(InitializationMetric.WebviewPageLoading);
                timeMeasurement.stop(InitializationMetric.WebviewPageLoading);
            });

            it('should send metric', () => {
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(1);
            });
        });

        describe('stop called for not active metric', () => {
            beforeEach(() => {
                performanceNowSpy
                    .mockReturnValueOnce(100)
                    .mockReturnValue(249);

                timeMeasurement.start(InitializationMetric.WebviewPageLoading, []);
                timeMeasurement.stop(InitializationMetric.WebviewInitialization);
            });

            it('should not send metric', () => {
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(0);
            });
        });

        describe('multiple starts override value', () => {
            beforeEach(() => {
                performanceNowSpy
                    .mockReturnValueOnce(50)
                    .mockReturnValueOnce(100)
                    .mockReturnValue(249);

                timeMeasurement.start(InitializationMetric.WebviewPageLoading, []);
                timeMeasurement.start(InitializationMetric.WebviewPageLoading, []);
                timeMeasurement.stop(InitializationMetric.WebviewPageLoading);
            });

            it('should send metric', () => {
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(InitializationMetric.WebviewPageLoading, 149, expect.anything());
            });
        });
    });

    describe('measure', () => {
        describe('normal use case', () => {
            beforeEach(() => {
                performanceNowSpy
                    .mockReturnValueOnce(100)
                    .mockReturnValueOnce(300)
                    .mockReturnValueOnce(700);

                timeMeasurement.measure('step_1');
                timeMeasurement.measure('step_2');
            });

            it('should send metric', () => {
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(2);
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(InitializationMetric.WebviewInitialization, 100, ['ads_sdk2_stg:step_1']);
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(InitializationMetric.WebviewInitialization, 200, ['ads_sdk2_stg:step_2']);
            });
        });
    });
});
