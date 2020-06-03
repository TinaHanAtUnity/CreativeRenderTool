import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { OpenMeasurementMockVast, OpenMeasurementVast } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurement';
import {
    OpenMeasurementAdViewBuilder,
    OpenMeasurementAdViewBuilderMock
} from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurementAdViewBuilder';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo, DeviceInfoMock } from 'Core/Models/__mocks__/DeviceInfo';
import { VastAdVerification, VastAdVerificationMock } from 'VAST/Models/__mocks__/VastAdVerification';
import {
    AccessMode,
    AdSessionType,
    IContext,
    ISessionEvent,
    OM_JS_VERSION,
    OMID_P,
    PARTNER_NAME
} from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { Platform } from 'Core/Constants/Platform';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
  describe(`${platform} OMManager`, () => {
      let placement: PlacementMock;
      let clientInfo: ClientInfoMock;
      let deviceInfo: DeviceInfoMock;
      let adViewBuilder: OpenMeasurementAdViewBuilderMock;

      const initOMManager = (om: OpenMeasurementMockVast[]) => {
          placement = new Placement();
          clientInfo = new ClientInfo();
          deviceInfo = new DeviceInfo();
          adViewBuilder = new OpenMeasurementAdViewBuilder();
          return new VastOpenMeasurementController(platform, placement, om, adViewBuilder, clientInfo, deviceInfo);
      };

      describe('when controller triggers video start event', () => {
          it('the duration time in event data should be integer', () => {
              const openMeasurementInstance = new OpenMeasurementVast();
              const omController = initOMManager([openMeasurementInstance]);
              omController.start(5120);
              expect(openMeasurementInstance.triggerVideoEvent).toHaveBeenCalledWith('omidStart', { duration: 5, videoPlayerVolume: 1, deviceVolume: undefined });
          });
      });

      describe('session start', () => {
          let omManager: VastOpenMeasurementController;
          let openMeasurement1: OpenMeasurementMockVast;
          let openMeasurement2: OpenMeasurementMockVast;
          let vastAdVerificton1: VastAdVerificationMock;
          let vastAdVerificton2: VastAdVerificationMock;

          beforeEach(() => {

              openMeasurement1 = new OpenMeasurementVast();
              openMeasurement2 = new OpenMeasurementVast();
              jest.spyOn(Date, 'now').mockImplementation(() => 123);
              vastAdVerificton1 = new VastAdVerification();
              vastAdVerificton2 = new VastAdVerification();
              vastAdVerificton1.getVerificationParameters.mockReturnValue('AliceWonderland');
              vastAdVerificton2.getVerificationParameters.mockReturnValue('');
              vastAdVerificton1.getVerificationVendor.mockReturnValue('iabtechlab.com-omid');
              vastAdVerificton2.getVerificationVendor.mockReturnValue('test.test');
              openMeasurement1.getOMAdSessionId.mockReturnValue('456');
              openMeasurement2.getOMAdSessionId.mockReturnValue('456');
              openMeasurement1.getVastVerification.mockReturnValue(vastAdVerificton1);
              openMeasurement2.getVastVerification.mockReturnValue(vastAdVerificton2);
              omManager = initOMManager([openMeasurement1, openMeasurement2]);
          });

          it('should be called with correct data', () => {

              const contextData: IContext = {
                  apiVersion: OMID_P,
                  environment: 'app',
                  accessMode: AccessMode.LIMITED,
                  adSessionType: AdSessionType.NATIVE,
                  omidNativeInfo: {
                      partnerName: PARTNER_NAME,
                      partnerVersion: ''
                  },
                  omidJsInfo: {
                      omidImplementer: PARTNER_NAME,
                      serviceVersion: '1.2.10',
                      sessionClientVersion: '1.2.10',
                      partnerName: PARTNER_NAME,
                      partnerVersion: ''
                  },
                  app: {
                      libraryVersion: OM_JS_VERSION,
                      appId: clientInfo.getApplicationName()
                  },
                  deviceInfo: {
                      deviceType: deviceInfo.getModel(),
                      os: platform === Platform.ANDROID ? 'Android' : 'iOS',
                      osVersion: deviceInfo.getOsVersion()
                  },
                  supports: ['vlid', 'clid']
              };
              const event1: ISessionEvent = {
                  adSessionId: '456',
                  timestamp: 123,
                  type: 'sessionStart',
                  data: {
                      vendorkey: 'iabtechlab.com-omid',
                      verificationParameters: 'AliceWonderland',
                      context: contextData
                  }
              };
              const event2: ISessionEvent = {
                  adSessionId: '456',
                  timestamp: 123,
                  type: 'sessionStart',
                  data: {
                      vendorkey: 'test.test',
                      context: contextData
                  }
              };

              omManager.sessionStart();

              expect(openMeasurement1.sessionStart).toHaveBeenCalledWith(event1);
              expect(openMeasurement2.sessionStart).toHaveBeenCalledWith(event2);
          });
      });
  });
});
