import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Privacy } from 'Ads/Views/Privacy';
import { AppStoreDownloadHelper, IAppStoreDownloadHelperParameters } from 'Ads/Utilities/AppStoreDownloadHelper';

export class PerformanceAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<PerformanceCampaign>): PerformanceAdUnit {
        const privacy = this.createPrivacy(nativeBridge, parameters);
        const showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose();
        const overlay = this.createOverlay(nativeBridge, parameters, privacy, showPrivacyDuringVideo);

        const adUnitStyle: AdUnitStyle = parameters.campaign.getAdUnitStyle() || AdUnitStyle.getDefaultAdUnitStyle();

        const endScreenParameters: IEndScreenParameters = {
            ... this.createEndScreenParameters(nativeBridge, privacy, parameters.campaign.getGameName(), parameters),
            adUnitStyle: adUnitStyle,
            campaignId: parameters.campaign.getId(),
            osVersion: parameters.deviceInfo.getOsVersion()
        };
        const endScreen = new PerformanceEndScreen(endScreenParameters, parameters.campaign);
        const video = this.getVideo(parameters.campaign, parameters.forceOrientation);

        const performanceAdUnitParameters: IPerformanceAdUnitParameters = {
            ... parameters,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            adUnitStyle: adUnitStyle,
            privacy: privacy
        };

        const performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);

        let performanceOverlayEventHandler: PerformanceOverlayEventHandler;

        const downloadEventHandlerParameters: IAppStoreDownloadHelperParameters = {
            thirdPartyEventManager: parameters.thirdPartyEventManager,
            operativeEventManager: parameters.operativeEventManager,
            deviceInfo: parameters.deviceInfo,
            clientInfo: parameters.clientInfo,
            placement: parameters.placement,
            adUnit: performanceAdUnit,
            campaign: parameters.campaign,
            coreConfig: parameters.coreConfig
        };
        const downloadEventHandler = new AppStoreDownloadHelper(nativeBridge, downloadEventHandlerParameters);

        performanceOverlayEventHandler = new PerformanceOverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters, downloadEventHandler);
        overlay.addEventHandler(performanceOverlayEventHandler);
        const endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, downloadEventHandler);
        endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(nativeBridge, performanceAdUnit, video, performanceAdUnitParameters.adUnitStyle, performanceAdUnitParameters);
        this.prepareVideoPlayer(PerformanceVideoEventHandler, <IVideoEventHandlerParams<PerformanceAdUnit>>videoEventHandlerParams);

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            const onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                endScreenEventHandler.onKeyEvent(keyCode);

                if(CustomFeatures.isCheetahGame(parameters.clientInfo.getGameId())) {
                    performanceOverlayEventHandler.onKeyEvent(keyCode);
                }
            });
            performanceAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }
        Privacy.setupReportListener(privacy, performanceAdUnit);

        return performanceAdUnit;
    }

}
