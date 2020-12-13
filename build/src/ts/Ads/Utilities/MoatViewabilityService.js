import { MOAT } from 'Ads/Views/MOAT';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
export class MoatViewabilityService {
    static initMoat(platform, core, campaign, clientInfo, placement, deviceInfo, configuration) {
        this._moat = new MOAT(platform, core, placement.muteVideo());
        this._moat.render();
        this._moat.addMessageListener();
        document.body.appendChild(this._moat.container());
        if (campaign instanceof VastCampaign || campaign instanceof VPAIDCampaign) {
            this._moatIds = {
                level1: campaign.getSeatId(),
                level2: campaign.getBuyerId(),
                level3: campaign.getAdvertiserBundleId() ? campaign.getAdvertiserBundleId() : campaign.getAdvertiserDomain(),
                level4: campaign.getCreativeId(),
                slicer1: clientInfo.getSdkVersionName(),
                slicer2: clientInfo.getApplicationName(),
                slicer3: placement.getName()
            };
            this._moatData = {
                SDK: 'UnityAds',
                Version: '1.1',
                SDKVersion: clientInfo.getSdkVersionName(),
                LimitAdTracking: deviceInfo.getLimitAdTracking(),
                COPPA: configuration.isCoppaCompliant(),
                bundle: clientInfo.getApplicationName()
            };
        }
    }
    static getMoat() {
        return this._moat;
    }
    static getMoatIds() {
        return this._moatIds;
    }
    static getMoatData() {
        return this._moatData;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9hdFZpZXdhYmlsaXR5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVXRpbGl0aWVzL01vYXRWaWV3YWJpbGl0eVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBTXRDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFxQjNELE1BQU0sT0FBTyxzQkFBc0I7SUFFeEIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFrQixFQUFFLElBQWMsRUFBRSxRQUFrQixFQUFFLFVBQXNCLEVBQUUsU0FBb0IsRUFBRSxVQUFzQixFQUFFLGFBQWdDO1FBQ2pMLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUNoQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFbEQsSUFBSSxRQUFRLFlBQVksWUFBWSxJQUFJLFFBQVEsWUFBWSxhQUFhLEVBQUU7WUFDdkUsSUFBSSxDQUFDLFFBQVEsR0FBRztnQkFDWixNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDNUIsTUFBTSxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUU7Z0JBQzdCLE1BQU0sRUFBRSxRQUFRLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDNUcsTUFBTSxFQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUU7Z0JBQ2hDLE9BQU8sRUFBRSxVQUFVLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3ZDLE9BQU8sRUFBRSxVQUFVLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ3hDLE9BQU8sRUFBRSxTQUFTLENBQUMsT0FBTyxFQUFFO2FBQy9CLENBQUM7WUFFRixJQUFJLENBQUMsU0FBUyxHQUFHO2dCQUNiLEdBQUcsRUFBRSxVQUFVO2dCQUNmLE9BQU8sRUFBRSxLQUFLO2dCQUNkLFVBQVUsRUFBRSxVQUFVLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzFDLGVBQWUsRUFBRSxVQUFVLENBQUMsa0JBQWtCLEVBQUU7Z0JBQ2hELEtBQUssRUFBRSxhQUFhLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3ZDLE1BQU0sRUFBRSxVQUFVLENBQUMsa0JBQWtCLEVBQUU7YUFDMUMsQ0FBQztTQUNMO0lBQ0wsQ0FBQztJQUVNLE1BQU0sQ0FBQyxPQUFPO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRU0sTUFBTSxDQUFDLFVBQVU7UUFDcEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVztRQUNyQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQUtKIn0=