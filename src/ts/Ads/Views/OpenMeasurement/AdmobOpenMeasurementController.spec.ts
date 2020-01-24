import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { PlacementMock, Placement } from 'Ads/Models/__mocks__/Placement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { AdMobCampaignMock, AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfoMock, ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { OpenMeasurementAdViewBuilderMock, OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurementAdViewBuilder';
import { RequestManagerMock, RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { Core } from 'Core/__mocks__/Core';
import { DeviceInfoMock, DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { IAdView, ISessionEvent } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { ThirdPartyEventManagerMock, ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { ProgrammaticTrackingServiceMock,  ProgrammaticTrackingService } from 'Ads/Utilities/__mocks__/ProgrammaticTrackingService';
import { OpenMeasurementMock, OpenMeasurement } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurement';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} AdmobOpenMeasurementContoller`, () => {
        let placement: PlacementMock;
        let adViewBuilder: OpenMeasurementAdViewBuilderMock;
        let clientInformation: ClientInfoMock;
        let campaign: AdMobCampaignMock;
        let deviceInfo: DeviceInfoMock;
        let request: RequestManagerMock;
        let thirdPartyEventManager: ThirdPartyEventManagerMock;
        let programmaticTrackingService: ProgrammaticTrackingServiceMock;
        let openMeasurement0: OpenMeasurementMock;
        let openMeasurement1: OpenMeasurementMock;

        const initAdMobOMManager = () => {
            placement = new Placement();
            adViewBuilder = new OpenMeasurementAdViewBuilder();

            const core = new Core();
            clientInformation = new ClientInfo();
            deviceInfo = new DeviceInfo();
            campaign = new AdMobCampaign();
            thirdPartyEventManager = new ThirdPartyEventManager();
            request = new RequestManager();
            programmaticTrackingService = new ProgrammaticTrackingService();
            openMeasurement0 = new OpenMeasurement();
            openMeasurement1 = new OpenMeasurement();

            return new AdmobOpenMeasurementController(platform, core.Api, clientInformation, campaign, placement, deviceInfo, request, adViewBuilder, thirdPartyEventManager, programmaticTrackingService);
        };

        describe('session event additional handling', () => {
            let omManager: AdmobOpenMeasurementController;

            beforeEach(() => {
                omManager = initAdMobOMManager();
            });

            afterEach(() => {
                // sandbox.restore();
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
                // omManager.injectVerificationResources([verificationResource, verificationResource1]);
                // const om = omManager.getOMInstances();

                omManager.setupOMInstance(openMeasurement0, verificationResource0);
                omManager.setupOMInstance(openMeasurement1, verificationResource1);


                // sinon.stub(om[0], 'getVerificationResource').returns(verificationResource);
                // sinon.stub(om[1], 'getVerificationResource').returns(verificationResource1);
                // jest.spyOn(openMeasurement0, 'getVerificationResource').mockImplementation(() => verificationResource0);
                // jest.spyOn(openMeasurement1, 'getVerificationResource').mockImplementation(() => verificationResource1);
                openMeasurement0.getVerificationResource.mockReturnValue(verificationResource0);
                openMeasurement1.getVerificationResource.mockReturnValue(verificationResource1);


                // sinon.stub(om[0], 'sessionStart');
                // sinon.stub(om[1], 'sessionStart');

                omManager.sessionStart(sessionInterfaceEvent);

                // sinon.assert.calledWith(<sinon.SinonStub>om[0].sessionStart, event);
                // sinon.assert.calledWith(<sinon.SinonStub>om[1].sessionStart, event1);

                expect(openMeasurement0.sessionStart).toHaveBeenCalledWith(event);
                expect(openMeasurement1.sessionStart).toHaveBeenCalledWith(event1);
            });
        });
    });
});
