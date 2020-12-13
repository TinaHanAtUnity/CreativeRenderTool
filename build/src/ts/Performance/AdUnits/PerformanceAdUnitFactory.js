import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Platform } from 'Core/Constants/Platform';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { IOSPerformanceAdUnit } from 'Performance/AdUnits/IOSPerformanceAdUnit';
export class PerformanceAdUnitFactory extends AbstractAdUnitFactory {
    canCreateAdUnit(contentType) {
        return contentType === PerformanceAdUnitFactory.ContentType || contentType === PerformanceAdUnitFactory.ContentTypeVideo || contentType === PerformanceAdUnitFactory.ContentTypeMRAID;
    }
    createAdUnit(parameters) {
        const useIOSPerformanceAdUnit = parameters.platform === Platform.IOS;
        const performanceAdUnit = useIOSPerformanceAdUnit ? new IOSPerformanceAdUnit(parameters) : new PerformanceAdUnit(parameters);
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
            adUnit: performanceAdUnit,
            campaign: parameters.campaign,
            coreConfig: parameters.coreConfig
        };
        const storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
        const performanceOverlayEventHandler = new PerformanceOverlayEventHandler(performanceAdUnit, parameters, storeHandler);
        const endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, parameters, storeHandler);
        this.initializeHandlers(parameters, performanceAdUnit, performanceOverlayEventHandler, endScreenEventHandler);
        return performanceAdUnit;
    }
    initializeHandlers(parameters, performanceAdUnit, performanceOverlayEventHandler, endScreenEventHandler) {
        parameters.overlay.addEventHandler(performanceOverlayEventHandler);
        parameters.endScreen.addEventHandler(endScreenEventHandler);
        const videoEventHandlerParams = this.getVideoEventHandlerParams(performanceAdUnit, parameters.video, parameters.adUnitStyle, parameters);
        this.prepareVideoPlayer(PerformanceVideoEventHandler, videoEventHandlerParams);
        if (parameters.platform === Platform.ANDROID) {
            const onBackKeyObserver = parameters.ads.Android.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                endScreenEventHandler.onKeyEvent(keyCode);
                if (CustomFeatures.isCloseIconSkipEnabled(parameters.clientInfo.getGameId())) {
                    performanceOverlayEventHandler.onKeyEvent(keyCode);
                }
            });
            performanceAdUnit.onClose.subscribe(() => {
                if (onBackKeyObserver) {
                    parameters.ads.Android.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }
    }
}
PerformanceAdUnitFactory.ContentType = 'comet/campaign';
PerformanceAdUnitFactory.ContentTypeVideo = 'comet/video';
PerformanceAdUnitFactory.ContentTypeMRAID = 'comet/mraid-url';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VBZFVuaXRGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1BlcmZvcm1hbmNlL0FkVW5pdHMvUGVyZm9ybWFuY2VBZFVuaXRGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRTFFLE9BQU8sRUFBRSxnQ0FBZ0MsRUFBRSxNQUFNLDREQUE0RCxDQUFDO0FBQzlHLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQzFHLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBRXRHLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFnQyxpQkFBaUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRXhHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFEQUFxRCxDQUFDO0FBQzFGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBRWhGLE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxxQkFBd0U7SUFNM0csZUFBZSxDQUFDLFdBQW1CO1FBQ3RDLE9BQU8sV0FBVyxLQUFLLHdCQUF3QixDQUFDLFdBQVcsSUFBSSxXQUFXLEtBQUssd0JBQXdCLENBQUMsZ0JBQWdCLElBQUksV0FBVyxLQUFLLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDO0lBQzFMLENBQUM7SUFFTSxZQUFZLENBQUMsVUFBd0M7UUFDeEQsTUFBTSx1QkFBdUIsR0FBRyxVQUFVLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUM7UUFDckUsTUFBTSxpQkFBaUIsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxvQkFBb0IsQ0FBQyxV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