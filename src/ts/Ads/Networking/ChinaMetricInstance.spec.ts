import { Platform } from 'Core/Constants/Platform';
import { RequestManagerMock, RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import {
    ProgrammaticTrackingService,
    AdmobMetric
} from 'Ads/Utilities/ProgrammaticTrackingService';
import { ClientInfoMock, ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfoMock, DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { ChinaMetricInstance } from 'Ads/Networking/ChinaMetricInstance';

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

      it('should fire with china endpoint', () => {
          const promise = metricInstance.reportMetricEvent(AdmobMetric.AdmobOMRegisteredImpression);
          expect(requestManager.post).toBeCalledWith(
              'https://sdk-diagnostics.prd.mz.internal.unity.cn/v1/metrics',
              expect.anything(),
              expect.anything()
          );

          return promise;

      });
    });
}));
