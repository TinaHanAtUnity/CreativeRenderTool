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
import { Privacy } from 'Ads/Views/Privacy';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandler/StoreHandler';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandler/StoreHandlerFactory';

export class XPromoAdUnitFactory extends AbstractAdUnitFactory<XPromoCampaign, IXPromoAdUnitParameters> {

    public createAdUnit(parameters: IXPromoAdUnitParameters): XPromoAdUnit {

        const xPromoAdUnit = new XPromoAdUnit(parameters);

        const storeHandlerParameters: IStoreHandlerParameters = {
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

        const storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);

        const xPromoOverlayEventHandler = new XPromoOverlayEventHandler(xPromoAdUnit, parameters, storeHandler);
        parameters.overlay.addEventHandler(xPromoOverlayEventHandler);
        const endScreenEventHandler = new XPromoEndScreenEventHandler(xPromoAdUnit, parameters, storeHandler);
        parameters.endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(xPromoAdUnit, parameters.video, undefined, parameters);
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
        Privacy.setupReportListener(parameters.privacy, xPromoAdUnit);

        return xPromoAdUnit;
    }

}
