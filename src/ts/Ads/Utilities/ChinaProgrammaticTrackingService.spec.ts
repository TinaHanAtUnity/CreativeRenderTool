import { Platform } from 'Core/Constants/Platform';
import { RequestManagerMock, RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import {
    ProgrammaticTrackingService,
    AdmobMetric
} from 'Ads/Utilities/ProgrammaticTrackingService';
import { ClientInfoMock, ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfoMock, DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { ChinaProgrammaticTrackingService } from 'Ads/Utilities/ChinaProgrammaticTrackingService'

[
    Platform.IOS,
    Platform.ANDROID
].forEach(platform => describe('ChinaProgrammaticTrackingService', () => {

    let programmaticTrackingService: ProgrammaticTrackingService;
    let clientInfo: ClientInfoMock;
    let deviceInfo: DeviceInfoMock;
    let requestManager: RequestManagerMock;
    const osVersion = '11.2.1';
    const sdkVersion = '2300';

    beforeEach(() => {
        requestManager = new RequestManager();
        clientInfo = new ClientInfo();
        deviceInfo = new DeviceInfo();
        programmaticTrackingService = new ChinaProgrammaticTrackingService(platform, requestManager, clientInfo, deviceInfo, 'us');
        deviceInfo.getOsVersion.mockReturnValue(osVersion);
        clientInfo.getSdkVersionName.mockReturnValue(sdkVersion);
    });

    describe('reportMetricEvent with Chinese network operator', () => {

      it('should fire with china endpoint', () => {
          const promise = programmaticTrackingService.reportMetricEvent(AdmobMetric.AdmobOMRegisteredImpression);
          expect(requestManager.post).toBeCalledWith(
              'https://sdk-diagnostics.prd.mz.internal.unity.cn/v1/metrics',
              expect.anything(),
              expect.anything()
          );

          return promise;

      });
    });
}));
