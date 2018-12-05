import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { XPromoOverlayEventHandler } from 'XPromo/EventHandlers/XPromoOverlayEventHandler';
import { XPromoEndScreenEventHandler } from 'XPromo/EventHandlers/XPromoEndScreenEventHandler';
import { XPromoVideoEventHandler } from 'XPromo/EventHandlers/XPromoVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { AppStoreDownloadHelper, IAppStoreDownloadHelperParameters } from 'Ads/Utilities/AppStoreDownloadHelper';
import { AndroidBackButtonSkipTest } from 'Core/Models/ABGroup';

export class XPromoAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(parameters: IAdUnitParameters<XPromoCampaign>): XPromoAdUnit {
        const privacy = this.createPrivacy(parameters);
        const showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose() || false;
        const overlay = this.createOverlay(parameters, privacy, showPrivacyDuringVideo);

        const endScreenParameters = this.createEndScreenParameters(privacy, parameters.campaign.getGameName(), parameters);
        const endScreen = new XPromoEndScreen(endScreenParameters, parameters.campaign);
        const video = this.getVideo(parameters.campaign, parameters.forceOrientation);

        const xPromoAdUnitParameters: IXPromoAdUnitParameters = {
            ... parameters,
            video: video,
            overlay: overlay,
            endScreen: endScreen,
            privacy: privacy
        };

        const xPromoAdUnit = new XPromoAdUnit(xPromoAdUnitParameters);

        const downloadHelperParameters: IAppStoreDownloadHelperParameters = {
            platform: parameters.platform,
            core: parameters.core,
            ads: parameters.ads,
            thirdPartyEventManager: parameters.thirdPartyEventManager,
            operativeEventManager: parameters.operativeEventManager,
            deviceInfo: parameters.deviceInfo,
            clientInfo: parameters.clientInfo,
            placement: parameters.placement,
            adUnit: xPromoAdUnit,
            campaign: parameters.campaign,
            coreConfig: parameters.coreConfig
        };

        const downloadHelper = new AppStoreDownloadHelper(downloadHelperParameters);

        const xPromoOverlayEventHandler = new XPromoOverlayEventHandler(xPromoAdUnit, xPromoAdUnitParameters, downloadHelper);
        overlay.addEventHandler(xPromoOverlayEventHandler);
        const endScreenEventHandler = new XPromoEndScreenEventHandler(xPromoAdUnit, xPromoAdUnitParameters, downloadHelper);
        endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(xPromoAdUnit, video, undefined, xPromoAdUnitParameters);
        this.prepareVideoPlayer(XPromoVideoEventHandler, <IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>>videoEventHandlerParams);

        if (parameters.platform === Platform.ANDROID) {
            const onBackKeyObserver = parameters.ads.Android!.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                endScreenEventHandler.onKeyEvent(keyCode);

                const abGroup = parameters.coreConfig.getAbGroup();
                const backButtonTestEnabled = AndroidBackButtonSkipTest.isValid(abGroup);

                if(backButtonTestEnabled || CustomFeatures.isCheetahGame(parameters.clientInfo.getGameId())) {
                    xPromoOverlayEventHandler.onKeyEvent(keyCode);
                }
            });
            xPromoAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }
        AbstractPrivacy.setupReportListener(privacy, xPromoAdUnit);

        return xPromoAdUnit;
    }

}
