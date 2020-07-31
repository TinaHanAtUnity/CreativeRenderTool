import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { ICore } from 'Core/ICore';
import { ColorBlurEndScreen } from 'MabExperimentation/Performance/Views/ColorBlurEndScreen';
import { ExperimentEndScreen } from 'MabExperimentation/Performance/Views/ExperimentEndScreen';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { AutomatedExperimentsCategories, EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { ExternalEndScreen } from 'ExternalEndScreen/Views/ExternalEndScreen';

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
            ...this.createEndScreenParameters(baseParams.privacy, baseParams.campaign.getGameName(), baseParams),
            adUnitStyle: adUnitStyle,
            campaignId: baseParams.campaign.getId(),
            osVersion: baseParams.deviceInfo.getOsVersion()
        };

        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);

        const endScreenCombination: IExperimentActionChoice | undefined = this._automatedExperimentManager.activateSelectedExperiment(baseParams.campaign, AutomatedExperimentsCategories.PERFORMANCE_ENDCARD);

        let endScreen: ExperimentEndScreen | ColorBlurEndScreen | ExternalEndScreen;

        if (this._campaign.getEndScreenType() === 'iframe') {
            endScreen = new ExternalEndScreen(endScreenCombination, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else if (endScreenCombination && endScreenCombination.scheme === EndScreenExperimentDeclaration.scheme.COLORBLUR) {
            endScreen = new ColorBlurEndScreen(endScreenCombination, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else {
            endScreen = new ExperimentEndScreen(
                endScreenCombination,
                endScreenParameters,
                baseParams.campaign,
                this._automatedExperimentManager,
                baseParams.coreConfig.getCountry()
            );
        }

        return {
            ...baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            automatedExperimentManager: this._automatedExperimentManager
        };
    }
}
