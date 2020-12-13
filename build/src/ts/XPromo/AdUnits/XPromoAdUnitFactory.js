import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { XPromoOverlayEventHandler } from 'XPromo/EventHandlers/XPromoOverlayEventHandler';
import { XPromoEndScreenEventHandler } from 'XPromo/EventHandlers/XPromoEndScreenEventHandler';
import { XPromoVideoEventHandler } from 'XPromo/EventHandlers/XPromoVideoEventHandler';
import { Platform } from 'Core/Constants/Platform';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
export class XPromoAdUnitFactory extends AbstractAdUnitFactory {
    createAdUnit(parameters) {
        const xPromoAdUnit = new XPromoAdUnit(parameters);
        const storeHandlerParameters = {
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
        this.prepareVideoPlayer(XPromoVideoEventHandler, videoEventHandlerParams);
        if (parameters.platform === Platform.ANDROID) {
            const onBackKeyObserver = parameters.ads.Android.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                endScreenEventHandler.onKeyEvent(keyCode);
                if (CustomFeatures.isCloseIconSkipEnabled(parameters.clientInfo.getGameId())) {
                    xPromoOverlayEventHandler.onKeyEvent(keyCode);
                }
            });
            xPromoAdUnit.onClose.subscribe(() => {
                if (onBackKeyObserver) {
                    parameters.ads.Android.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }
        return xPromoAdUnit;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vQWRVbml0RmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9YUHJvbW8vQWRVbml0cy9YUHJvbW9BZFVuaXRGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRTFFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQzNGLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQy9GLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBR3ZGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUEyQixZQUFZLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVwRixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUUxRixNQUFNLE9BQU8sbUJBQW9CLFNBQVEscUJBQThEO0lBRTVGLFlBQVksQ0FBQyxVQUFtQztRQUVuRCxNQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUVsRCxNQUFNLHNCQUFzQixHQUE0QjtZQUNwRCxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDN0IsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO1lBQ3JCLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRztZQUNuQixLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7WUFDdkIsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLHNCQUFzQjtZQUN6RCxxQkFBcUIsRUFBRSxVQUFVLENBQUMscUJBQXFCO1lBQ3ZELFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7WUFDakMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTO1lBQy9CLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLFFBQVEsRUFBRSxVQUFVLENBQUMsUUFBUTtZQUM3QixVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7U0FDcEMsQ0FBQztRQUVGLE1BQU0sWUFBWSxHQUFHLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFcEYsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLHlCQUF5QixDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDeEcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUM5RCxNQUFNLHFCQUFxQixHQUFHLElBQUksMkJBQTJCLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN0RyxVQUFVLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBRTVELE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2SCxJQUFJLENBQUMsa0JBQWtCLENBQUMsdUJBQXVCLEVBQXVGLHVCQUF1QixDQUFDLENBQUM7UUFFL0osSUFBSSxVQUFVLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDMUMsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxFQUFFO2dCQUN2SCxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLElBQUksY0FBYyxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRTtvQkFDMUUseUJBQXlCLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2lCQUNqRDtZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsWUFBWSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNoQyxJQUFJLGlCQUFpQixFQUFFO29CQUNuQixVQUFVLENBQUMsR0FBRyxDQUFDLE9BQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUMzRTtZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0NBRUoifQ==