import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { ICore } from 'Core/ICore';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { SwipeUpVideoOverlay } from 'Ads/Views/SwipeUpVideoOverlay';
import { AnimatedDownloadButtonEndScreen } from 'Performance/Views/AnimatedDownloadButtonEndScreen';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { AutomatedExperimentsList, ButtonAnimationsExperiment, VideoOverlayDownloadExperiment } from 'Ads/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';

export class PerformanceAdUnitWithAutomatedExperimentParametersFactory extends PerformanceAdUnitParametersFactory {

    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(core: ICore, aem: AutomatedExperimentManager) {
        super(core, core.Ads);
        this._automatedExperimentManager = aem;
        this._automatedExperimentManager.registerExperiments(AutomatedExperimentsList);
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

        const endScreenCombination = this._automatedExperimentManager.activateExperiment(baseParams.campaign, ButtonAnimationsExperiment);

        const endScreen = new AnimatedDownloadButtonEndScreen(endScreenCombination, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());

        return {
            ... baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            automatedExperimentManager: this._automatedExperimentManager
        };
    }

    protected getOverlayType(baseParams: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean): VideoOverlay {
        const videoCombination = this._automatedExperimentManager.activateExperiment(baseParams.campaign, VideoOverlayDownloadExperiment);

        return new SwipeUpVideoOverlay(baseParams, privacy, showGDPRBanner, showPrivacyDuringVideo, videoCombination);
    }
}
