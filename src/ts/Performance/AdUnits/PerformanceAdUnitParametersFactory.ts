import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IPerformanceAdUnitParameters } from 'Performance/AdUnits/PerformanceAdUnit';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { DownloadManager } from 'China/Managers/DownloadManager';
import { DeviceIdManager } from 'Core/Managers/DeviceIdManager';
import { IChina } from 'China/IChina';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { AnimatedDownloadButtonEndScreen, EndScreenAnimation } from 'Performance/Views/AnimatedDownloadButtonEndScreen';
import {
    HeartbeatingDownloadButtonTest,
    BouncingDownloadButtonTest,
    ShiningDownloadButtonTest,
    MabDecisionButtonTest
} from 'Core/Models/ABGroup';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { AutomatedExperimentsList, ButtonAnimationsExperiment } from 'Ads/Models/AutomatedExperimentsList';

export class PerformanceAdUnitParametersFactory extends AbstractAdUnitParametersFactory<PerformanceCampaign, IPerformanceAdUnitParameters> {

    private _downloadManager: DownloadManager;
    private _deviceIdManager: DeviceIdManager;
    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(core: ICore, ads: IAds, china?: IChina) {
        super(core, ads);

        this._deviceIdManager = core.DeviceIdManager;
        if (china) {
            this._downloadManager = china.DownloadManager;
        }

        this._automatedExperimentManager = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
        if (MabDecisionButtonTest.isValid(core.Config.getAbGroup())) {
            this._automatedExperimentManager.initialize(AutomatedExperimentsList);
            this._automatedExperimentManager.beginExperiment();
        }
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

        let endScreen: PerformanceEndScreen;
        const abGroup = baseParams.coreConfig.getAbGroup();
        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);
        let endscreenAnimation = EndScreenAnimation.STATIC;
        const mabDecision = this._automatedExperimentManager.getExperimentAction(ButtonAnimationsExperiment);

        if (mabDecision) {
            if (Object.keys(EndScreenAnimation).includes(mabDecision)) { // Should be tested
                endscreenAnimation = <EndScreenAnimation> mabDecision;
            } else {
                // Can be removed, since the developer doesn't need to know about this
                this._core.Sdk.logError(`Invalid Endscreen animation: "${mabDecision}".`);
                // Suggest to replace with the following to track on our datadog dashboard to get live updates if incorrect values are being sent
                // baseParams.programmaticTrackingService.reportMetricEvent(AUIMetric.InvalidEndscreenAnimation);
            }
        }

        if (HeartbeatingDownloadButtonTest.isValid(abGroup)) {
            endScreen = new AnimatedDownloadButtonEndScreen(EndScreenAnimation.HEARTBEATING, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else if (BouncingDownloadButtonTest.isValid(abGroup)) {
            endScreen = new AnimatedDownloadButtonEndScreen(EndScreenAnimation.BOUNCING, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else if (ShiningDownloadButtonTest.isValid(abGroup)) {
            endScreen = new AnimatedDownloadButtonEndScreen(EndScreenAnimation.SHINING, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else if (MabDecisionButtonTest.isValid(abGroup) && endscreenAnimation !== EndScreenAnimation.STATIC) {
            endScreen = new AnimatedDownloadButtonEndScreen(endscreenAnimation, endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else {
            endScreen = new PerformanceEndScreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        }

        return {
            ... baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            downloadManager: this._downloadManager,
            deviceIdManager: this._deviceIdManager,
            automatedExperimentManager: this._automatedExperimentManager
        };
    }

    private createOverlay(parameters: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy): AbstractVideoOverlay {
        let showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose() || false;

        // hide privacy icon for China
        if (parameters.adsConfig.getHidePrivacy()) {
           showPrivacyDuringVideo = false;
        }

        const showGDPRBanner = this.showGDPRBanner(parameters) && showPrivacyDuringVideo;
        const overlay = new VideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }

        return overlay;
    }
}
