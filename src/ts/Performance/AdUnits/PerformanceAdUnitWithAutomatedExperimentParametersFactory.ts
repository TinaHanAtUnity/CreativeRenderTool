import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { ICore } from 'Core/ICore';
import { AnimatedDownloadButtonEndScreen, EndScreenAnimation } from 'Performance/Views/AnimatedDownloadButtonEndScreen';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { AutomatedExperimentsList, ButtonAnimationsExperiment } from 'Ads/Models/AutomatedExperimentsList';
import { AUIMetric, ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';

export class PerformanceAdUnitWithAutomatedExperimentParametersFactory extends PerformanceAdUnitParametersFactory {

    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(core: ICore) {
        super(core, core.Ads);
        this._automatedExperimentManager = new AutomatedExperimentManager(core);
        this._automatedExperimentManager.initialize(AutomatedExperimentsList).catch(() => {
            ProgrammaticTrackingService.reportMetricEvent(AUIMetric.AutomatedExperimentManagerInitializationError);
        });
        this._automatedExperimentManager.beginExperiment();
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

        let endscreenAnimation = EndScreenAnimation.STATIC;
        const mabDecision = this._automatedExperimentManager.getExperimentAction(ButtonAnimationsExperiment);

        if (mabDecision) {
            if ((<string[]>Object.values(EndScreenAnimation)).includes(mabDecision)) {
                endscreenAnimation = <EndScreenAnimation> mabDecision;
            } else {
                ProgrammaticTrackingService.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
            }
        }

        const endScreen = new AnimatedDownloadButtonEndScreen(endscreenAnimation, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());

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
