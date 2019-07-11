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
import { QueryCTATest } from 'Core/Models/ABGroup';
import { RedesignedPerformanceEndscreen, DoubleShadowCloseButtonTest } from 'Performance/Views/RedesignedPerformanceEndScreen';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { PerformanceEndScreenQueryCTASquare } from 'Performance/Views/PerformanceEndScreenQueryCTASquare';
import { PerformanceEndScreenDoubleShadowClose } from 'Performance/Views/PerformanceEndScreenDoubleShadowClose';

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
        if (QueryCTATest.isValid(abGroup)) {
            if (baseParams.campaign.getSquare() !== undefined) {
                endScreen = new PerformanceEndScreenQueryCTA(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
            } else {
                endScreen = new PerformanceEndScreenQueryCTASquare(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
            }
        }
        else if (DoubleShadowCloseButtonTest.isValid(abGroup)) {
            endScreen = new PerformanceEndScreenDoubleShadowClose(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        } else {
            endScreen = new PerformanceEndScreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
        }
        const video = this.getVideo(baseParams.campaign, baseParams.forceOrientation);

        return {
            ...baseParams,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            downloadManager: this._downloadManager,
            deviceIdManager: this._deviceIdManager
        };
    }

    private createOverlay(parameters: IAdUnitParameters<Campaign>, privacy: AbstractPrivacy): AbstractVideoOverlay {
        const showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose() || false;
        const showGDPRBanner = this.showGDPRBanner(parameters) && showPrivacyDuringVideo;
        const overlay = new VideoOverlay(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

        if (parameters.placement.disableVideoControlsFade()) {
            overlay.setFadeEnabled(false);
        }

        return overlay;
    }
}
