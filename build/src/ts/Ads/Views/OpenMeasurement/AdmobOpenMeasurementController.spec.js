import { AdMobCampaign } from 'AdMob/Models/__mocks__/AdMobCampaign';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { OpenMeasurementAdmob } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurement';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurementAdViewBuilder';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { Core } from 'Core/__mocks__/Core';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { Platform } from 'Core/Constants/Platform';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} AdmobOpenMeasurementContoller`, () => {
        let placement;
        let adViewBuilder;
        let clientInformation;
        let campaign;
        let deviceInfo;
        let request;
        let thirdPartyEventManager;
        let openMeasurement0;
        let openMeasurement1;
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
        describe('session event additional handling', () => {
            let omManager;
            beforeEach(() => {
                omManager = initAdMobOMManager();
            });
            it('sessionStart should be called with correct data', () => {
                const sessionInterfaceEvent = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        context: {}
                    }
                };
                const event0 = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        context: {},
                        verificationParameters: 'param1',
                        vendorkey: 'unity'
                    }
                };
                const event1 = {
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
                expect(openMeasurement0.sessionStart).toHaveBeenCalledWith(event0);
                expect(openMeasurement1.sessionStart).toHaveBeenCalledWith(event1);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRtb2JPcGVuTWVhc3VyZW1lbnRDb250cm9sbGVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL09wZW5NZWFzdXJlbWVudC9BZG1vYk9wZW5NZWFzdXJlbWVudENvbnRyb2xsZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFxQixNQUFNLHNDQUFzQyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxzQkFBc0IsRUFBOEIsTUFBTSwrQ0FBK0MsQ0FBQztBQUNuSCxPQUFPLEVBQUUsU0FBUyxFQUFpQixNQUFNLGdDQUFnQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBNEIsTUFBTSxxREFBcUQsQ0FBQztBQUNySCxPQUFPLEVBQ0gsNEJBQTRCLEVBRS9CLE1BQU0sa0VBQWtFLENBQUM7QUFDMUUsT0FBTyxFQUFFLGNBQWMsRUFBc0IsTUFBTSx3Q0FBd0MsQ0FBQztBQUM1RixPQUFPLEVBQUUsVUFBVSxFQUFrQixNQUFNLGtDQUFrQyxDQUFDO0FBQzlFLE9BQU8sRUFBRSxVQUFVLEVBQWtCLE1BQU0sa0NBQWtDLENBQUM7QUFDOUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTNDLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBRTFHLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsR0FBRyxRQUFRLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtRQUN2RCxJQUFJLFNBQXdCLENBQUM7UUFDN0IsSUFBSSxhQUErQyxDQUFDO1FBQ3BELElBQUksaUJBQWlDLENBQUM7UUFDdEMsSUFBSSxR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