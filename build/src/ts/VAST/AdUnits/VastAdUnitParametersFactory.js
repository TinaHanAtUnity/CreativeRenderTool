import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { VastVideoOverlay } from 'Ads/Views/VastVideoOverlay';
import { VastOpenMeasurementFactory } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementFactory';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
import { VastHTMLEndScreen } from 'VAST/Views/VastHTMLEndScreen';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
export class VastAdUnitParametersFactory extends AbstractAdUnitParametersFactory {
    constructor(core, ads) {
        super(core, ads);
        this._webPlayerContainer = ads.InterstitialWebPlayerContainer;
    }
    createParameters(baseParams) {
        let showPrivacyDuringVideo = true;
        const attachTapForTencentVast = CustomFeatures.isTencentSeat(baseParams.campaign.getSeatId());
        // hide privacy icon for China
        if (baseParams.adsConfig.getHidePrivacy()) {
            showPrivacyDuringVideo = false;
        }
        const overlay = new VastVideoOverlay(baseParams, baseParams.privacy, this.showGDPRBanner(baseParams), showPrivacyDuringVideo, attachTapForTencentVast ? true : undefined);
        const vastAdUnitParameters = Object.assign({}, baseParams, { video: baseParams.campaign.getVideo(), overlay: overlay });
        if (baseParams.campaign.hasHtmlEndscreen()) {
            vastAdUnitParameters.endScreen = new VastHTMLEndScreen(baseParams, this._webPlayerContainer);
        }
        else if (baseParams.campaign.hasStaticEndscreen()) {
            vastAdUnitParameters.endScreen = new VastStaticEndScreen(baseParams, attachTapForTencentVast ? true : undefined);
        }
        const adVerifications = baseParams.campaign.getVast().getAdVerifications();
        if (adVerifications.length > 0) {
            const openMeasurementFactory = new VastOpenMeasurementFactory(adVerifications, baseParams.campaign, baseParams.deviceInfo, baseParams.platform, baseParams.clientInfo, baseParams.placement);
            vastAdUnitParameters.om = openMeasurementFactory.createOpenMeasurementManager(baseParams.core, baseParams.thirdPartyEventManager);
            openMeasurementFactory.setOMVendorTracking(baseParams.thirdPartyEventManager);
        }
        return vastAdUnitParameters;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVW5pdFBhcmFtZXRlcnNGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvQWRVbml0cy9WYXN0QWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFJdEYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFOUQsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDbEcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDckUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFJakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTlELE1BQU0sT0FBTywyQkFBNEIsU0FBUSwrQkFBb0U7SUFFakgsWUFBWSxJQUFXLEVBQUUsR0FBUztRQUM5QixLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLENBQUMsOEJBQThCLENBQUM7SUFDbEUsQ0FBQztJQUNTLGdCQUFnQixDQUFDLFVBQTJDO1FBQ2xFLElBQUksc0JBQXNCLEdBQUcsSUFBSSxDQUFDO1FBQ2xDLE1BQU0sdUJBQXVCLEdBQUcsY0FBYyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7UUFFOUYsOEJBQThCO1FBQzlCLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsRUFBRTtZQUN2QyxzQkFBc0IsR0FBRyxLQUFLLENBQUM7U0FDbEM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEVBQUUsc0JBQXNCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFMUssTUFBTSxvQkFBb0IscUJBQ2xCLFVBQVUsSUFDZCxLQUFLLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFDckMsT0FBTyxFQUFFLE9BQU8sR0FDbkIsQ0FBQztRQUVGLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO1lBQ3hDLG9CQUFvQixDQUFDLFNBQVMsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUNoRzthQUFNLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO1lBQ2pELG9CQUFvQixDQUFDLFNBQVMsR0FBRyxJQUFJLG1CQUFtQixDQUFDLFVBQVUsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNwSDtRQUVELE1BQU0sZUFBZSxHQUF5QixVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDakcsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM1QixNQUFNLHNCQUFzQixHQUFHLElBQUksMEJBQTBCLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdMLG9CQUFvQixDQUFDLEVBQUUsR0FBRyxzQkFBc0IsQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ2xJLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxvQkFBb0IsQ0FBQztJQUNoQyxDQUFDO0NBQ0oifQ==