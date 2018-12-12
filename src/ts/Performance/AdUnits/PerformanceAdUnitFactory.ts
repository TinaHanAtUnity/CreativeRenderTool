import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Platform } from 'Core/Constants/Platform';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { AppStoreDownloadHelper, IAppStoreDownloadHelperParameters } from 'Ads/Utilities/AppStoreDownloadHelper';
import { AndroidBackButtonSkipTest } from 'Core/Models/ABGroup';

export class PerformanceAdUnitFactory extends AbstractAdUnitFactory<PerformanceCampaign, IPerformanceAdUnitParameters> {

    public static ContentType = 'comet/campaign';
    public static ContentTypeVideo = 'comet/video';
    public static ContentTypeMRAID = 'comet/mraid-url';

    public canCreateAdUnit(contentType: string) {
        return contentType === PerformanceAdUnitFactory.ContentType || contentType === PerformanceAdUnitFactory.ContentTypeVideo || contentType === PerformanceAdUnitFactory.ContentTypeMRAID;
    }

    public createAdUnit(parameters: IPerformanceAdUnitParameters): PerformanceAdUnit {
        const performanceAdUnit = new PerformanceAdUnit(parameters);

        let performanceOverlayEventHandler: PerformanceOverlayEventHandler;

        const downloadHelperParameters: IAppStoreDownloadHelperParameters = {
            platform: parameters.platform,
            core: parameters.core,
            ads: parameters.ads,
            thirdPartyEventManager: parameters.thirdPartyEventManager,
            operativeEventManager: parameters.operativeEventManager,
            deviceInfo: parameters.deviceInfo,
            clientInfo: parameters.clientInfo,
            placement: parameters.placement,
            adUnit: performanceAdUnit,
            campaign: parameters.campaign,
            coreConfig: parameters.coreConfig
        };
        const downloadHelper = new AppStoreDownloadHelper(downloadHelperParameters);

        performanceOverlayEventHandler = new PerformanceOverlayEventHandler(performanceAdUnit, parameters, downloadHelper);
        parameters.overlay.addEventHandler(performanceOverlayEventHandler);
        const endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, parameters, downloadHelper);
        parameters.endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(performanceAdUnit, parameters.video, parameters.adUnitStyle, parameters);
        this.prepareVideoPlayer(PerformanceVideoEventHandler, <IVideoEventHandlerParams<PerformanceAdUnit>>videoEventHandlerParams);

        if (parameters.platform === Platform.ANDROID) {
            const onBackKeyObserver = parameters.ads.Android!.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                endScreenEventHandler.onKeyEvent(keyCode);
                const abGroup = parameters.coreConfig.getAbGroup();
                const backButtonTestEnabled = AndroidBackButtonSkipTest.isValid(abGroup);

                if(backButtonTestEnabled || CustomFeatures.isCheetahGame(parameters.clientInfo.getGameId())) {
                    performanceOverlayEventHandler.onKeyEvent(keyCode);
                }
            });
            performanceAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }
        AbstractPrivacy.setupReportListener(parameters.privacy, performanceAdUnit);

        return performanceAdUnit;
    }

}
