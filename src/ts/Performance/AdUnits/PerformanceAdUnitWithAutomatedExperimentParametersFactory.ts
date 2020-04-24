import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { ICore } from 'Core/ICore';
import { AnimatedDownloadButtonEndScreen } from 'Performance/Views/AnimatedDownloadButtonEndScreen';
import { AlternativeLayoutEndScreen } from 'Performance/Views/AlternativeLayoutEndScreen';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { AutomatedExperimentsCategories } from 'Ads/Models/AutomatedExperimentsList';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { IExperimentActionChoice } from 'Ads/Models/AutomatedExperiment';

export class PerformanceAdUnitWithAutomatedExperimentParametersFactory extends PerformanceAdUnitParametersFactory {

    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(core: ICore, aem: AutomatedExperimentManager) {
        super(core, core.Ads);
        this._automatedExperimentManager = aem;
        this._automatedExperimentManager.registerExperimentCategory(AutomatedExperimentsCategories.PERFORMANCE_ENDCARD, 'PerformanceCampaign');
    }

    protected createParameters(baseParams: IAdUnitParameters<PerformanceCampaign>) {
        const overlay = this.createOverlay(baseParams, baseParams.privacy);

        const adUnitStyle: AdUnitStyle = baseParams.campaign.getAdUnitStyle() || AdUnitStyle.getDefaultAdUnitStyle();

        const endScreenParameters: IEndScreenParameters = {
            ... this.createEndScreenParameters(baseParams.privacy, baseParams.campaign.getGameName(), baseParams),
            adUnitStyle: adUnitStyle,
            campaignId: baseParams.campaign.getId(),
            osVersion: baseParams.deviceInfo.getOsVersion()
        };

        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);

        const experimentID = this._automatedExperimentManager.getSelectedExperimentName(baseParams.campaign, AutomatedExperimentsCategories.PERFORMANCE_ENDCARD);

        let endScreenCombination: IExperimentActionChoice | undefined;

        if (AlternativeLayoutEndScreen.experimentSupported(experimentID)) {
            endScreenCombination = this._automatedExperimentManager.activateSelectedExperiment(baseParams.campaign, AutomatedExperimentsCategories.PERFORMANCE_ENDCARD);
        }
        const endScreen = new AlternativeLayoutEndScreen(endScreenCombination, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());

        return {
            ... baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            automatedExperimentManager: this._automatedExperimentManager
        };
    }
}
