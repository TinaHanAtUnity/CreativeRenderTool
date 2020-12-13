import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { ChinaMetricInstance } from 'Ads/Networking/MetricInstance';
import { AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { Platform } from 'Core/Constants/Platform';
[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('ChinaMetricInstance', () => {
    let clientInfo;
    let deviceInfo;
    let requestManager;
    const osVersion = '11.2.1';
    const sdkVersion = '2300';
    const country = 'cn';
    let metricInstance;
    beforeEach(() => {
        requestManager = new RequestManager();
        clientInfo = new ClientInfo();
        deviceInfo = new DeviceInfo();
        deviceInfo.getOsVersion.mockReturnValue(osVersion);
        clientInfo.getSdkVersionName.mockReturnValue(sdkVersion);
        clientInfo.getTestMode.mockReturnValue(false);
        metricInstance = new ChinaMetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
    });
    describe('When test mode is enabled', () => {
        beforeEach(() => {
            clientInfo.getTestMode.mockReturnValue(true);
            metricInstance = new ChinaMetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
            metricInstance.reportMetricEvent(AdmobMetric.AdmobUsedStreamedVideo);
            metricInstance.sendBatchedEvents();
        });
        it('should call the (non-china) staging endpoint', () => {
            expect(requestManager.post).toBeCalledWith('https://sdk-diagnostics.stg.mz.internal.unity3d.com/v1/metrics', expect.anything(), expect.anything(), expect.anything());
        });
    });
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hpbmFNZXRyaWNJbnN0YW5jZS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9OZXR3b3JraW5nL0NoaW5hTWV0cmljSW5zdGFuY2Uuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFzQixNQUFNLHdDQUF3QyxDQUFDO0FBQzVGLE9BQU8sRUFBRSxVQUFVLEVBQWtCLE1BQU0sa0NBQWtDLENBQUM7QUFDOUUsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUU5RSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNwRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5EO0lBQ0ksUUFBUSxDQUFDLEdBQUc7SUFDWixRQUFRLENBQUMsT0FBTztDQUNuQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFFdkQsSUFBSSxVQUEwQixDQUFDO0lBQy9CLElBQUksVUFBMEIsQ0FBQztJQUMvQixJQUFJLGNBQWtDLENBQUM7SUFDdkMsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDO0lBQzNCLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUMxQixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFFckIsSUFBSSxjQUFtQyxDQUFDO0lBRXhDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixjQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUN0QyxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUM5QixVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUM5QixVQUFVLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxVQUFVLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3pELFVBQVUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN4RyxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7UUFDdkMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLFVBQVUsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRyxjQUFjLENBQUMsaUJBQWlCLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDckUsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsOENBQThDLEVBQUUsR0FBRyxFQUFFO1lBQ3BELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUN0QyxnRUFBZ0UsRUFDaEUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUNqQixNQUFNLENBQUMsUUFBUSxFQUFFLEVBQ2pCLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FDcEIsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyxDQUFDIn0=