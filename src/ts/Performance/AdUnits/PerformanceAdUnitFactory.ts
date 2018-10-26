import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';

export class PerformanceAdUnitFactory extends AbstractAdUnitFactory {

    public static ContentType = 'comet/campaign';
    public static ContentTypeVideo = 'comet/video';
    public static ContentTypeMRAID = 'comet/mraid-url';

    public canCreateAdUnit(contentType: string) {
        return contentType === PerformanceAdUnitFactory.ContentType || contentType === PerformanceAdUnitFactory.ContentTypeVideo || contentType === PerformanceAdUnitFactory.ContentTypeMRAID;
    }

    public createAdUnit(parameters: IAdUnitParameters<PerformanceCampaign>): PerformanceAdUnit {
        const privacy = this.createPrivacy(parameters);
        const showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose();
        const overlay = this.createOverlay(parameters, privacy, showPrivacyDuringVideo);

        const adUnitStyle: AdUnitStyle = parameters.campaign.getAdUnitStyle() || AdUnitStyle.getDefaultAdUnitStyle();

        const endScreenParameters: IEndScreenParameters = {
            ... this.createEndScreenParameters(privacy, parameters.campaign.getGameName(), parameters),
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

        const performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
        const performanceOverlayEventHandler = new PerformanceOverlayEventHandler(performanceAdUnit, performanceAdUnitParameters);
        overlay.addEventHandler(performanceOverlayEventHandler);
        const endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters);
        endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(performanceAdUnit, video, performanceAdUnitParameters.adUnitStyle, performanceAdUnitParameters);
        this.prepareVideoPlayer(PerformanceVideoEventHandler, <IVideoEventHandlerParams<PerformanceAdUnit>>videoEventHandlerParams);

        if (parameters.platform === Platform.ANDROID) {
            const onBackKeyObserver = parameters.ads.Android!.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => endScreenEventHandler.onKeyEvent(keyCode));
            performanceAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }
        Privacy.setupReportListener(privacy, performanceAdUnit);

        return performanceAdUnit;
    }

}
