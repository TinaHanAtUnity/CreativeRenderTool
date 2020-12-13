import { VastOpenMeasurementFactory } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementFactory';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { VastCampaign } from 'VAST/Models/__mocks__/VastCampaign';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { VastAdVerification } from 'VAST/Models/__mocks__/VastAdVerification';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import { Vast } from 'VAST/Models/__mocks__/Vast';
describe(`VastOpenMeasurementFactory`, () => {
    let omSetup;
    let adVerifications;
    let campaign;
    let deviceInfo;
    let platform;
    let clientInfo;
    let placement;
    beforeEach(() => {
        campaign = new VastCampaign();
        deviceInfo = new DeviceInfo();
        platform = Platform.TEST;
        clientInfo = new ClientInfo();
        placement = new Placement();
        const verificationResource = new VastVerificationResource('https://scootmcdoot.com', 'omid');
        const verification = new VastAdVerification();
        verification.getVerificationVendor.mockReturnValue('IAS');
        verification.getVerficationResources.mockReturnValue([verificationResource]);
        adVerifications = [verification];
        omSetup = new VastOpenMeasurementFactory(adVerifications, campaign, deviceInfo, platform, clientInfo, placement);
    });
    describe('setting up OM tracking', () => {
        let thirdPartyEventManager;
        beforeEach(() => {
            thirdPartyEventManager = new ThirdPartyEventManager();
            const vastModel = new Vast();
            vastModel.isPublicaTag.mockReturnValue(true);
            campaign.getVast.mockReturnValue(vastModel);
            // unique not on array prototype
            Array.prototype.unique = function () {
                // tslint:disable-next-line
                return this.filter((val, index) => this.indexOf(val) === index);
            };
        });
        afterEach(() => {
            jest.restoreAllMocks();
        });
        it('should set third party template values', () => {
            omSetup.setOMVendorTracking(thirdPartyEventManager);
            expect(thirdPartyEventManager.setTemplateValue).toBeCalledTimes(2);
            expect(thirdPartyEventManager.setTemplateValue).toBeCalledWith('%25OM_ENABLED%25', 'true');
            expect(thirdPartyEventManager.setTemplateValue).toBeCalledWith('%25OM_VENDORS%25', 'IAS|publica');
        });
        it('should set om vendors on the campaign', () => {
            omSetup.setOMVendorTracking(thirdPartyEventManager);
            expect(campaign.setOmEnabled).toBeCalledWith(true);
            expect(campaign.setOMVendors).toBeCalledWith(['IAS', 'publica']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE9wZW5NZWFzdXJlbWVudEZhY3Rvcnkuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvT3Blbk1lYXN1cmVtZW50L1Zhc3RPcGVuTWVhc3VyZW1lbnRGYWN0b3J5LnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDbEcsT0FBTyxFQUFFLHNCQUFzQixFQUE4QixNQUFNLCtDQUErQyxDQUFDO0FBQ25ILE9BQU8sRUFBRSxZQUFZLEVBQW9CLE1BQU0sb0NBQW9DLENBQUM7QUFDcEYsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBa0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQUUsU0FBUyxFQUFpQixNQUFNLGdDQUFnQyxDQUFDO0FBQzFFLE9BQU8sRUFBMEIsa0JBQWtCLEVBQUUsTUFBTSwwQ0FBMEMsQ0FBQztBQUN0RyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNoRixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFbEQsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtJQUN4QyxJQUFJLE9BQW1DLENBQUM7SUFDeEMsSUFBSSxlQUF5QyxDQUFDO0lBQzlDLElBQUksUUFBMEIsQ0FBQztJQUMvQixJQUFJLFVBQTBCLENBQUM7SUFDL0IsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLElBQUksVUFBMEIsQ0FBQztJQUMvQixJQUFJLFNBQXdCLENBQUM7SUFFN0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFFBQVEsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzlCLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQzlCLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ3pCLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQzlCLFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDO1FBRTVCLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyx5QkFBeUIsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM3RixNQUFNLFlBQVksR0FBRyxJQUFJLGtCQUFrQixFQUFFLENBQUM7UUFDOUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxRCxZQUFZLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1FBQzdFLGVBQWUsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRWpDLE9BQU8sR0FBRyxJQUFJLDBCQUEwQixDQUFDLGVBQWUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDckgsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1FBQ3BDLElBQUksc0JBQWtELENBQUM7UUFFdkQsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLHNCQUFzQixHQUFHLElBQUksc0JBQXNCLEVBQUUsQ0FBQztZQUN0RCxNQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQzdCLFNBQVMsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdDLFFBQVEsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTVDLGdDQUFnQztZQUNoQyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRztnQkFDckIsMkJBQTJCO2dCQUMzQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO1lBQ3BFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxDQUFDO1FBRUgsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUNYLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7WUFDOUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLHNCQUFzQixDQUFDLGdCQUFnQixDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25FLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzRixNQUFNLENBQUMsc0JBQXNCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdEcsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO1lBQzdDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELE1BQU0sQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDckUsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=