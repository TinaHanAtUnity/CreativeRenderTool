import { ITimeMeasurements, createMeasurementsInstance } from "Core/Utilities/TimeMeasurements";
import { InitializationMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

describe('TimeMeasurements', () => {
    let performanceNowSpy: jest.SpyInstance;
    let timeMeasurement: ITimeMeasurements;

    beforeEach(() => {
        performanceNowSpy = jest.spyOn(performance, 'now');
        performanceNowSpy.mockReturnValue(0)
        timeMeasurement = createMeasurementsInstance(InitializationMetric.WebviewInitialization, ['simple:tag']);
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

                timeMeasurement.measure('step_1');
                timeMeasurement.measure('step_2');
            });

            it('should send metric', () => {
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledTimes(2);
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(InitializationMetric.WebviewInitialization, 100, ['simple:tag', 'ads_sdk2_stg:step_1']);
                expect(SDKMetrics.reportTimingEventWithTags).toBeCalledWith(InitializationMetric.WebviewInitialization, 200, ['simple:tag', 'ads_sdk2_stg:step_2']);
            });
        });
    });
});
