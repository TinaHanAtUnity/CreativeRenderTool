import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { ColorBlurEndScreen } from 'MabExperimentation/Performance/Views/ColorBlurEndScreen';
import { ExperimentEndScreen } from 'MabExperimentation/Performance/Views/ExperimentEndScreen';
import { AutomatedExperimentsCategories, EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { ExternalEndScreen } from 'ExternalEndScreen/Views/ExternalEndScreen';
export class PerformanceAdUnitWithAutomatedExperimentParametersFactory extends PerformanceAdUnitParametersFactory {
    constructor(core, aem) {
        super(core, core.Ads);
        this._automatedExperimentManager = aem;
        this._automatedExperimentManager.registerExperimentCategory(AutomatedExperimentsCategories.PERFORMANCE_ENDCARD, 'PerformanceCampaign');
    }
    createParameters(baseParams) {
        const overlay = this.createOverlay(baseParams, baseParams.privacy);
        const adUnitStyle = baseParams.campaign.getAdUnitStyle() || AdUnitStyle.getDefaultAdUnitStyle();
        const endScreenParameters = Object.assign({}, this.createEndScreenParameters(baseParams.privacy, baseParams.campaign.getGameName(), baseParams), { adUnitStyle: adUnitStyle, campaignId: baseParams.campaign.getId(), osVersion: baseParams.deviceInfo.getOsVersion() });
        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);
        const endScreenCombination = this._automatedExperimentManager.activateSelectedExperiment(baseParams.campaign, AutomatedExperimentsCategories.PERFORMANCE_ENDCARD);
        let endScreen;
        if (this._campaign.getEndScreenType() === 'iframe') {
            endScreen = new ExternalEndScreen(endScreenCombination, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        }
        else if (endScreenCombination && endScreenCombination.scheme === EndScreenExperimentDeclaration.scheme.COLORBLUR) {
            endScreen = new ColorBlurEndScreen(endScreenCombination, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        }
        else {
            endScreen = new ExperimentEndScreen(endScreenCombination, endScreenParameters, baseParams.campaign, this._automatedExperimentManager, baseParams.coreConfig.getCountry());
        }
        return Object.assign({}, baseParams, { video: video, overlay: overlay, endScreen: endScreen, adUnitStyle: adUnitStyle, automatedExperimentManager: this._automatedExperimentManager });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VBZFVuaXRXaXRoQXV0b21hdGVkRXhwZXJpbWVudFBhcmFtZXRlcnNGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL01hYkV4cGVyaW1lbnRhdGlvbi9QZXJmb3JtYW5jZS9QZXJmb3JtYW5jZUFkVW5pdFdpdGhBdXRvbWF0ZWRFeHBlcmltZW50UGFyYW1ldGVyc0ZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBR3JELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlEQUF5RCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBRS9GLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSw4QkFBOEIsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3BJLE9BQU8sRUFBRSxrQ0FBa0MsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBRTVHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRTlFLE1BQU0sT0FBTyx5REFBMEQsU0FBUSxrQ0FBa0M7SUFHN0csWUFBWSxJQUFXLEVBQUUsR0FBK0I7UUFDcEQsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEIsSUFBSSxDQUFDLDJCQUEyQixHQUFHLEdBQUcsQ0FBQztRQUN2QyxJQUFJLENBQUMsMkJBQTJCLENBQUMsMEJBQTBCLENBQUMsOEJBQThCLENBQUMsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUMzSSxDQUFDO0lBRVMsZ0JBQWdCLENBQUMsVUFBa0Q7UUFDekUsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5FLE1BQU0sV0FBVyxHQUFnQixVQUFVLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxJQUFJLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRTdHLE1BQU0sbUJBQW1CLHFCQUNsQixJQUFJLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxFQUFFLFVBQVUsQ0FBQyxJQUNwRyxXQUFXLEVBQUUsV0FBVyxFQUN4QixVQUFVLEVBQUUsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFDdkMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLEdBQ2xELENBQUM7UUFFRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFOUUsTUFBTSxvQkFBb0IsR0FBd0MsSUFBSSxDQUFDLDJCQUEyQixDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsOEJBQThCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUV2TSxJQUFJLFNBQXVFLENBQUM7UUFFNUUsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLEtBQUssUUFBUSxFQUFFO1lBQ2hELFNBQVMsR0FBRyxJQUFJLGlCQUFpQixDQUFDLG9CQUFvQixFQUFFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1NBQ3pJO2FBQU0sSUFBSSxvQkFBb0IsSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssOEJBQThCLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUNoSCxTQUFTLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxvQkFBb0IsRUFBRSxtQkFBbUIsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztTQUMxSTthQUFNO1lBQ0gsU0FBUyxHQUFHLElBQUksbUJBQW1CLENBQy9CLG9CQUFvQixFQUNwQixtQkFBbUIsRUFDbkIsVUFBVSxDQUFDLFFBQVEsRUFDbkIsSUFBSSxDQUFDLDJCQUEyQixFQUNoQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUNyQyxDQUFDO1NBQ0w7UUFFRCx5QkFDTyxVQUFVLElBQ2IsS0FBSyxFQUFFLEtBQUssRUFDWixPQUFPLEVBQUUsT0FBTyxFQUNoQixTQUFTLEVBQUUsU0FBUyxFQUNwQixXQUFXLEVBQUUsV0FBVyxFQUN4QiwwQkFBMEIsRUFBRSxJQUFJLENBQUMsMkJBQTJCLElBQzlEO0lBQ04sQ0FBQztDQUNKIn0=