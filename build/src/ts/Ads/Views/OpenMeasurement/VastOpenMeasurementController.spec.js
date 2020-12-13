import { Placement } from 'Ads/Models/__mocks__/Placement';
import { OpenMeasurementVast } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurement';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurementAdViewBuilder';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { VastAdVerification } from 'VAST/Models/__mocks__/VastAdVerification';
import { AccessMode, AdSessionType, OM_JS_VERSION, OMID_P, PARTNER_NAME } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementController';
import { Platform } from 'Core/Constants/Platform';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OMManager`, () => {
        let placement;
        let clientInfo;
        let deviceInfo;
        let adViewBuilder;
        const initOMManager = (om) => {
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
            let omManager;
            let openMeasurement1;
            let openMeasurement2;
            let vastAdVerificton1;
            let vastAdVerificton2;
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
                const contextData = {
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
                const event1 = {
                    adSessionId: '456',
                    timestamp: 123,
                    type: 'sessionStart',
                    data: {
                        vendorkey: 'iabtechlab.com-omid',
                        verificationParameters: 'AliceWonderland',
                        context: contextData
                    }
                };
                const event2 = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE9wZW5NZWFzdXJlbWVudENvbnRyb2xsZXIuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvT3Blbk1lYXN1cmVtZW50L1Zhc3RPcGVuTWVhc3VyZW1lbnRDb250cm9sbGVyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBaUIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMxRSxPQUFPLEVBQTJCLG1CQUFtQixFQUFFLE1BQU0scURBQXFELENBQUM7QUFDbkgsT0FBTyxFQUNILDRCQUE0QixFQUUvQixNQUFNLGtFQUFrRSxDQUFDO0FBQzFFLE9BQU8sRUFBRSxVQUFVLEVBQWtCLE1BQU0sa0NBQWtDLENBQUM7QUFDOUUsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsa0JBQWtCLEVBQTBCLE1BQU0sMENBQTBDLENBQUM7QUFDdEcsT0FBTyxFQUNILFVBQVUsRUFDVixhQUFhLEVBR2IsYUFBYSxFQUNiLE1BQU0sRUFDTixZQUFZLEVBQ2YsTUFBTSxvREFBb0QsQ0FBQztBQUM1RCxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSx5REFBeUQsQ0FBQztBQUN4RyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDbEQsUUFBUSxDQUFDLEdBQUcsUUFBUSxZQUFZLEVBQUUsR0FBRyxFQUFFO1FBQ25DLElBQUksU0FBd0IsQ0FBQztRQUM3QixJQUFJLFVBQTBCLENBQUM7UUFDL0IsSUFBSSxVQUEwQixDQUFDO1FBQy9CLElBQUksYUFBK0MsQ0FBQztRQUVwRCxNQUFNLGFBQWEsR0FBRyxDQUFDLEVBQTZCLEVBQUUsRUFBRTtZ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