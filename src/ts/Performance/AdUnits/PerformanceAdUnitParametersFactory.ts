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
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { PerformanceEndScreenWithCloseGuard } from 'Performance/Views/PerformanceEndScreenWithCloseGuard';

export class PerformanceAdUnitParametersFactory extends AbstractAdUnitParametersFactory<PerformanceCampaign, IPerformanceAdUnitParameters> {

    private _downloadManager: DownloadManager;
    private _deviceIdManager: DeviceIdManager;

    constructor(core: ICore, ads: IAds, china?: IChina) {
        super(core, ads);

        this._deviceIdManager = core.DeviceIdManager;
        if (china) {
            this._downloadManager = china.DownloadManager;
        }
    }

    protected createParameters(baseParams: IAdUnitParameters<PerformanceCampaign>) {
        const showPrivacyDuringVideo = baseParams.placement.skipEndCardOnClose() || false;
        const overlay = this.createOverlay(baseParams, baseParams.privacy, showPrivacyDuringVideo);

        const adUnitStyle: AdUnitStyle = baseParams.campaign.getAdUnitStyle() || AdUnitStyle.getDefaultAdUnitStyle();

        const endScreenParameters: IEndScreenParameters = {
            ... this.createEndScreenParameters(baseParams.privacy, baseParams.campaign.getGameName(), baseParams),
            adUnitStyle: adUnitStyle,
            campaignId: baseParams.campaign.getId(),
            osVersion: baseParams.deviceInfo.getOsVersion()
        };

        let endScreen;

        if (CustomFeatures.isSkipUnderTimerExperimentEnabled(baseParams.coreConfig, baseParams.placement)) {
            endScreen = new PerformanceEndScreenWithCloseGuard(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else {
            endScreen = new PerformanceEndScreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        }

        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);

        return {
            ... baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            downloadManager: this._downloadManager,
            deviceIdManager: this._deviceIdManager
        };
    }
}
