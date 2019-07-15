import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IPerformanceAdUnitParameters } from 'Performance/AdUnits/PerformanceAdUnit';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters, EndScreen } from 'Ads/Views/EndScreen';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { DownloadManager } from 'China/Managers/DownloadManager';
import { DeviceIdManager } from 'Core/Managers/DeviceIdManager';
import { IChina } from 'China/IChina';
import { SliderPerformanceCampaign } from 'Performance/Models/SliderPerformanceCampaign';
import { SliderPerformanceEndScreen } from 'Performance/Views/SliderPerformanceEndScreen';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
<<<<<<< HEAD
import { RedesignedEndScreenDesignTest } from 'Core/Models/ABGroup';
import { RedesignedPerformanceEndscreen } from 'Performance/Views/RedesignedPerformanceEndScreen';
import { VersionMatchers } from 'Ads/Utilities/VersionMatchers';
import { Platform } from 'Core/Constants/Platform';
=======
import { DoubleShadowCloseButtonTest } from 'Core/Models/ABGroup';
import { PerformanceEndScreenDoubleShadowClose } from 'Performance/Views/PerformanceEndScreenDoubleShadowClose';
>>>>>>> 03696113c6d48cbf94e28733f5858726d3ab00db
import { SliderPerformanceCampaign } from 'Performance/Models/SliderPerformanceCampaign';
import { SliderPerformanceEndScreen } from 'Performance/Views/SliderPerformanceEndScreen';

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

        let endScreen: EndScreen;

        const abGroup = baseParams.coreConfig.getAbGroup();
<<<<<<< HEAD
        const isAndroid4 = this._platform === Platform.ANDROID && VersionMatchers.matchesMajorOSVersion(4, this._osVersion);
        if (RedesignedEndScreenDesignTest.isValid(abGroup) && !isAndroid4) {
            endScreenParameters.id = 'redesigned-end-screen';
            endScreen = new RedesignedPerformanceEndscreen(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
=======
        if (DoubleShadowCloseButtonTest.isValid(abGroup)) {
            endScreen = new PerformanceEndScreenDoubleShadowClose(endScreenParameters, baseParams.campaign, baseParams.coreConfig.getCountry());
>>>>>>> 03696113c6d48cbf94e28733f5858726d3ab00db
        } else if (baseParams.campaign instanceof SliderPerformanceCampaign) {
            endScreen = new SliderPerformanceEndScreen(endScreenParameters, baseParams.campaign);
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
