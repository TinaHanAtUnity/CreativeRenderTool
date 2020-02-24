import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo, DeviceInfoMock } from 'Core/Models/__mocks__/DeviceInfo';

import { ChinaMetricInstance } from 'Ads/Networking/ChinaMetricInstance';
import { AdmobMetric } from 'Ads/Utilities/SDKMetrics';
import { Platform } from 'Core/Constants/Platform';

[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('ChinaMetricInstance', () => {

    let clientInfo: ClientInfoMock;
    let deviceInfo: DeviceInfoMock;
    let requestManager: RequestManagerMock;
    const osVersion = '11.2.1';
    const sdkVersion = '2300';
    const country = 'cn';

    let metricInstance: ChinaMetricInstance;

    beforeEach(() => {
        requestManager = new RequestManager();
        clientInfo = new ClientInfo();
        deviceInfo = new DeviceInfo();
        deviceInfo.getOsVersion.mockReturnValue(osVersion);
        clientInfo.getSdkVersionName.mockReturnValue(sdkVersion);
        clientInfo.getTestMode.mockReturnValue(false);
        metricInstance = new ChinaMetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
    });

    describe('reportMetricEvent with Chinese network operator', () => {
        beforeEach(() => {
            metricInstance.reportMetricEvent(AdmobMetric.AdmobOMRegisteredImpression);
            metricInstance.sendBatchedEvents();
        });

        it('should fire with china endpoint', () => {
            expect(requestManager.post).toBeCalledWith(
                'https://sdk-diagnostics.prd.mz.internal.unity.cn/v1/metrics',
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
        });
    });

    describe('When test mode is enabled', () => {
        beforeEach(() => {
            clientInfo.getTestMode.mockReturnValue(true);
            metricInstance = new ChinaMetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
            metricInstance.reportMetricEvent(AdmobMetric.AdmobUsedStreamedVideo);
            metricInstance.sendBatchedEvents();
        });

        it('should call the (non-china) staging endpoint', () => {
            expect(requestManager.post).toBeCalledWith(
                'https://sdk-diagnostics.stg.mz.internal.unity3d.com/v1/metrics',
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
        });
    });
}));
