import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromoOverlayEventHandler } from 'XPromo/EventHandlers/XPromoOverlayEventHandler';
import { XPromoEndScreenEventHandler } from 'XPromo/EventHandlers/XPromoEndScreenEventHandler';
import { XPromoVideoEventHandler } from 'XPromo/EventHandlers/XPromoVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';

export class XPromoAdUnitFactory extends AbstractAdUnitFactory<XPromoCampaign, IXPromoAdUnitParameters> {

    public createAdUnit(parameters: IXPromoAdUnitParameters): XPromoAdUnit {

        const xPromoAdUnit = new XPromoAdUnit(parameters);

        const storeHandlerParameters: IStoreHandlerParameters = {
            platform: parameters.platform,
            core: parameters.core,
            ads: parameters.ads,
            store: parameters.store,
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
                if (CustomFeatures.isCloseIconSkipEnabled(parameters.clientInfo.getGameId())) {
                    xPromoOverlayEventHandler.onKeyEvent(keyCode);
                }
            });
            xPromoAdUnit.onClose.subscribe(() => {
                if (onBackKeyObserver) {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }

        return xPromoAdUnit;
    }

}
