import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { IXPromoAdUnitParameters, XPromoAdUnit } from './XPromoAdUnit';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';
import { XPromoOverlayEventHandler } from 'XPromo/EventHandlers/XPromoOverlayEventHandler';
import { XPromoEndScreenEventHandler } from 'XPromo/EventHandlers/XPromoEndScreenEventHandler';
import { XPromoVideoEventHandler } from 'XPromo/EventHandlers/XPromoVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Privacy } from 'Ads/Views/Privacy';

export class XPromoAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(parameters: IAdUnitParameters<XPromoCampaign>): XPromoAdUnit {
        const privacy = this.createPrivacy(parameters);
        const showPrivacyDuringVideo = parameters.placement.skipEndCardOnClose();
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
        const xPromoOverlayEventHandler = new XPromoOverlayEventHandler(xPromoAdUnit, xPromoAdUnitParameters);
        overlay.addEventHandler(xPromoOverlayEventHandler);
        const endScreenEventHandler = new XPromoEndScreenEventHandler(xPromoAdUnit, xPromoAdUnitParameters);
        endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(xPromoAdUnit, video, undefined, xPromoAdUnitParameters);
        this.prepareVideoPlayer(XPromoVideoEventHandler, <IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>>videoEventHandlerParams);

        if (parameters.platform === Platform.ANDROID) {
            const onBackKeyObserver = parameters.ads.Android!.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                endScreenEventHandler.onKeyEvent(keyCode);
                if(CustomFeatures.isCheetahGame(parameters.clientInfo.getGameId())) {
                    xPromoOverlayEventHandler.onKeyEvent(keyCode);
                }
            });
            xPromoAdUnit.onClose.subscribe(() => {
                if(onBackKeyObserver) {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }
        Privacy.setupReportListener(privacy, xPromoAdUnit);

        return xPromoAdUnit;
    }

}
