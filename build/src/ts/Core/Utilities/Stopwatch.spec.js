import { createStopwatch } from 'Core/Utilities/Stopwatch';
import { InitializationMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
describe('TimeMeasurements', () => {
    let performanceNowSpy;
    let stopwatch;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcHdhdGNoLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9VdGlsaXRpZXMvU3RvcHdhdGNoLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFjLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUU1RSxRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLElBQUksaUJBQW1DLENBQUM7SUFDeEMsSUFBSSxTQUFxQixDQUFDO0lBRTFCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRCxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMsU0FBUyxHQUFHLGVBQWUsRUFBRSxDQUFDO0lBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNYLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3BDLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFDckIsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtZQUM3QixVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNaLGlCQUFpQjtxQkFDWixtQkFBbUIsQ0FBQyxHQUFHLENBQUM7cUJBQ3hCLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztxQkFDeEIsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBRTlCLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDbEIsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqQixTQUFTLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDcEYsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ3RJLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ25DLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osaUJBQWlCO3FCQUNaLG1CQUFtQixDQUFDLEdBQUcsQ0FBQztxQkFDeEIsbUJBQW1CLENBQUMsR0FBRyxDQUFDO3FCQUN4QixtQkFBbUIsQ0FBQyxHQUFHLENBQUM7cUJBQ3hCLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUUvQixTQUFTLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2xCLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDakIsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNsQixTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2pCLFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMscUJBQXFCLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUNwRixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hFLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDdEksQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==