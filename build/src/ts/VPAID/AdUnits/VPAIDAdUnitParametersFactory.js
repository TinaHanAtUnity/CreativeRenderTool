import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { Closer } from 'Ads/Views/Closer';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { VPAID } from 'VPAID/Views/VPAID';
export class VPAIDAdUnitParametersFactory extends AbstractAdUnitParametersFactory {
    constructor(core, ads) {
        super(core, ads);
        this._webPlayerContainer = ads.InterstitialWebPlayerContainer;
    }
    createParameters(baseParams) {
        const showGDPRBanner = this.showGDPRBanner(baseParams);
        const closer = new Closer(baseParams.platform, baseParams.placement, baseParams.privacy, baseParams.deviceInfo.getLanguage(), showGDPRBanner, baseParams.adsConfig.getHidePrivacy());
        const vpaid = new VPAID(baseParams.platform, baseParams.core, this._webPlayerContainer, this._campaign, this._placement);
        let endScreen;
        const vpaidAdUnitParameters = Object.assign({}, baseParams, { vpaid: vpaid, closer: closer, webPlayerContainer: this._webPlayerContainer });
        if (baseParams.campaign.hasEndScreen()) {
            endScreen = new VPAIDEndScreen(baseParams.platform, baseParams.campaign, baseParams.clientInfo.getGameId());
            vpaidAdUnitParameters.endScreen = endScreen;
        }
        return vpaidAdUnitParameters;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURBZFVuaXRQYXJhbWV0ZXJzRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WUEFJRC9BZFVuaXRzL1ZQQUlEQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFLdEYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFJMUMsTUFBTSxPQUFPLDRCQUE2QixTQUFRLCtCQUFzRTtJQUdwSCxZQUFZLElBQVcsRUFBRSxHQUFTO1FBQzlCLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQztJQUNsRSxDQUFDO0lBRVMsZ0JBQWdCLENBQUMsVUFBNEM7UUFDbkUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RCxNQUFNLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDckwsTUFBTSxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6SCxJQUFJLFNBQXFDLENBQUM7UUFFMUMsTUFBTSxxQkFBcUIscUJBQ25CLFVBQVUsSUFDZCxLQUFLLEVBQUUsS0FBSyxFQUNaLE1BQU0sRUFBRSxNQUFNLEVBQ2Qsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixHQUMvQyxDQUFDO1FBRUYsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxFQUFFO1lBQ3BDLFNBQVMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQzVHLHFCQUFxQixDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDL0M7UUFDRCxPQUFPLHFCQUFxQixDQUFDO0lBQ2pDLENBQUM7Q0FDSiJ9