import { AdMobCampaign, AdMobCampaignMock } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { ThirdPartyEventManager, ThirdPartyEventManagerMock } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { MockPTS } from 'Ads/Utilities/__mocks__/ProgrammaticTrackingService';
import { OpenMeasurementAdmob, OpenMeasurementMockAdmob } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurement';
import { OpenMeasurementAdViewBuilder, OpenMeasurementAdViewBuilderMock } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurementAdViewBuilder';
import { RequestManager, RequestManagerMock } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo, DeviceInfoMock } from 'Core/Models/__mocks__/DeviceInfo';
import { Core } from 'Core/__mocks__/Core';

import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { ISessionEvent } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { Platform } from 'Core/Constants/Platform';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} AdmobOpenMeasurementContoller`, () => {
        let placement: PlacementMock;
        let adViewBuilder: OpenMeasurementAdViewBuilderMock;
        let clientInformation: ClientInfoMock;
        let campaign: AdMobCampaignMock;
        let deviceInfo: DeviceInfoMock;
        let request: RequestManagerMock;
        let thirdPartyEventManager: ThirdPartyEventManagerMock;
        let openMeasurement0: OpenMeasurementMockAdmob;
        let openMeasurement1: OpenMeasurementMockAdmob;

        const initAdMobOMManager = () => {
            placement = new Placement();
            adViewBuilder = new OpenMeasurementAdViewBuilder();

            const core = new Core();
            clientInformation = new ClientInfo();
            deviceInfo = new DeviceInfo();
            campaign = new AdMobCampaign();
            thirdPartyEventManager = new ThirdPartyEventManager();
            request = new RequestManager();
            openMeasurement0 = new OpenMeasurementAdmob();
            openMeasurement1 = new OpenMeasurementAdmob();

            return new AdmobOpenMeasurementController(platform, core.Api, clientInformation, campaign, placement, deviceInfo, request, adViewBuilder, thirdPartyEventManager);
        };

        beforeEach(() => {
            MockPTS();
        });

        describe('session event additional handling', () => {
            let omManager: AdmobOpenMeasurementController;

            beforeEach(() => {
                omManager = initAdMobOMManager();
            });

            it('sessionStart should be called with correct data', () => {
                const sessionInterfaceEvent : ISessionEvent = {
                  adSessionId: '456',
                  timestamp: 123,
                  type: 'sessionStart',
                  data: {
                      context: {}
                  }
              };

                const event: ISessionEvent = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        context: {},
                        verificationParameters: 'param1',
                        vendorkey: 'unity'
                    }
                };

                const event1: ISessionEvent = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        context: {},
                        verificationParameters: 'param2',
                        vendorkey: 'omid'
                    }
                };

                const verificationResource0 = {
                    resourceUrl: 'https://s3-us-west-2.amazonaws.com/omsdk-files/compliance-js/omid-validation-verification-script-v1.js',
                    vendorKey: 'unity',
                    verificationParameters: 'param1'
                };
                const verificationResource1 = {
                    resourceUrl: 'https://something.test.js',
                    vendorKey: 'omid',
                    verificationParameters: 'param2'
                };

                omManager.setupOMInstance(openMeasurement0, verificationResource0);
                omManager.setupOMInstance(openMeasurement1, verificationResource1);

                openMeasurement0.getVerificationResource.mockReturnValue(verificationResource0);
                openMeasurement1.getVerificationResource.mockReturnValue(verificationResource1);

                omManager.sessionStart(sessionInterfaceEvent);

                expect(openMeasurement0.sessionStart).toHaveBeenCalledWith(event);
                expect(openMeasurement1.sessionStart).toHaveBeenCalledWith(event1);
            });
        });
    });
});
