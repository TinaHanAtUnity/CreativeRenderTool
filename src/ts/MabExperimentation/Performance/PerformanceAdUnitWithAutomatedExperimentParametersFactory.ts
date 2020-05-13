import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { ICore } from 'Core/ICore';
import { AlternativeLayoutEndScreen } from 'MabExperimentation/Performance/Views/AlternativeLayoutEndScreen';
import { AnimatedDownloadButtonEndScreen } from 'MabExperimentation/Performance/Views/AnimatedDownloadButtonEndScreen';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { AutomatedExperimentsCategories, ButtonExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { SwipeUpVideoOverlay } from 'Ads/Views/SwipeUpVideoOverlay';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';

export class PerformanceAdUnitWithAutomatedExperimentParametersFactory extends PerformanceAdUnitParametersFactory {

    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(core: ICore, aem: AutomatedExperimentManager) {
        super(core, core.Ads);
        this._automatedExperimentManager = aem;
        this._automatedExperimentManager.registerExperimentCategory(AutomatedExperimentsCategories.PERFORMANCE_ENDCARD, 'PerformanceCampaign');
        this._automatedExperimentManager.registerExperimentCategory(AutomatedExperimentsCategories.VIDEO_OVERLAY, 'PerformanceCampaign');
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

        let endScreenCombination: IExperimentActionChoice | undefined;

        endScreenCombination = this._automatedExperimentManager.activateSelectedExperiment(baseParams.campaign, AutomatedExperimentsCategories.PERFORMANCE_ENDCARD);

        let endScreen: PerformanceEndScreen;

        if (endScreenCombination && endScreenCombination.scheme === ButtonExperimentDeclaration.scheme.COLOR_BLUR) {
            endScreen = new AlternativeLayoutEndScreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else {
            endScreen = new AnimatedDownloadButtonEndScreen(endScreenCombination, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        }

        return {
            ... baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            automatedExperimentManager: this._automatedExperimentManager
        };
    }

    protected createVideoOverlay(baseParams: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean): VideoOverlay {
        const videoCombination = this._automatedExperimentManager.activateSelectedExperiment(baseParams.campaign, AutomatedExperimentsCategories.VIDEO_OVERLAY);

        return new SwipeUpVideoOverlay(baseParams, privacy, showGDPRBanner, showPrivacyDuringVideo, videoCombination, this._automatedExperimentManager);
    }
}
