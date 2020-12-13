import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { AdMobView } from 'AdMob/Views/AdMobView';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
export class AdMobAdUnitParametersFactory extends AbstractAdUnitParametersFactory {
    constructor(core, ads) {
        super(core, ads);
        this._adMobSignalFactory = ads.AdMobSignalFactory;
    }
    createParameters(baseParams) {
        const showGDPRBanner = this.showGDPRBanner(baseParams);
        let om;
        const isOMEnabled = baseParams.campaign.isOMEnabled() ? true : false;
        baseParams.thirdPartyEventManager.setTemplateValue(ThirdPartyEventMacro.OM_ENABLED, `${isOMEnabled}`);
        if (isOMEnabled) {
            const omAdViewBuilder = new OpenMeasurementAdViewBuilder(baseParams.campaign);
            om = new AdmobOpenMeasurementController(baseParams.platform, baseParams.core, baseParams.clientInfo, baseParams.campaign, baseParams.placement, baseParams.deviceInfo, baseParams.request, omAdViewBuilder, baseParams.thirdPartyEventManager);
            om.addToViewHierarchy();
            SDKMetrics.reportMetricEvent(AdmobMetric.AdmobOMEnabled);
        }
        const view = new AdMobView(baseParams.platform, baseParams.core, this._adMobSignalFactory, baseParams.container, baseParams.campaign, baseParams.deviceInfo, baseParams.clientInfo.getGameId(), baseParams.privacy, showGDPRBanner, om);
        return Object.assign({}, baseParams, { adMobSignalFactory: this._adMobSignalFactory, view });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JBZFVuaXRQYXJhbWV0ZXJzRmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZE1vYi9BZFVuaXRzL0FkTW9iQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLCtCQUErQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFPdEYsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2xELE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQzFHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFbkUsTUFBTSxPQUFPLDRCQUE2QixTQUFRLCtCQUFzRTtJQUlwSCxZQUFZLElBQVcsRUFBRSxHQUFTO1FBQzlCLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztJQUN0RCxDQUFDO0lBRVMsZ0JBQWdCLENBQUMsVUFBNEM7UUFDbkUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV2RCxJQUFJLEVBQUUsQ0FBQztRQUNQLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ3JFLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsQ0FBQyxVQUFVLEVBQUUsR0FBRyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3RHLElBQUksV0FBVyxFQUFFO1lBQ2IsTUFBTSxlQUFlLEdBQUcsSUFBSSw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUUsRUFBRSxHQUFHLElBQUksOEJBQThCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDL08sRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDeEIsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUM1RDtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV4Tyx5QkFDUSxVQUFVLElBQ2Qsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUM1QyxJQUFJLElBQ047SUFDTixDQUFDO0NBQ0oifQ==