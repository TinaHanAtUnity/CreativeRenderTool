import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { Platform } from 'Core/Constants/Platform';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { PerformanceAdUnitWithAutomatedExperiment } from 'MabExperimentation/Performance/PerformanceAdUnitWithAutomatedExperiment';
import { IOSPerformanceAdUnitWithAutomatedExperiment } from 'MabExperimentation/Performance/IOSPerformanceAdUnitWithAutomatedExperiment';
import { MabDecisionPerformanceEndScreenEventHandler } from 'MabExperimentation/Performance/MabDecisionPerformanceEndScreenEventHandler';
export class PerformanceAdUnitWithAutomatedExperimentFactory extends PerformanceAdUnitFactory {
    createAdUnit(parameters) {
        const useIOSPerformanceAdUnit = parameters.platform === Platform.IOS;
        const performanceAdUnit = useIOSPerformanceAdUnit ? new IOSPerformanceAdUnitWithAutomatedExperiment(parameters) : new PerformanceAdUnitWithAutomatedExperiment(parameters);
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
        const endScreenEventHandler = new MabDecisionPerformanceEndScreenEventHandler(performanceAdUnit, parameters, storeHandler);
        this.initializeHandlers(parameters, performanceAdUnit, performanceOverlayEventHandler, endScreenEventHandler);
        return performanceAdUnit;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VBZFVuaXRXaXRoQXV0b21hdGVkRXhwZXJpbWVudEZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTWFiRXhwZXJpbWVudGF0aW9uL1BlcmZvcm1hbmNlL1BlcmZvcm1hbmNlQWRVbml0V2l0aEF1dG9tYXRlZEV4cGVyaW1lbnRGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBRzFHLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxREFBcUQsQ0FBQztBQUMxRixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUN4RixPQUFPLEVBRUgsd0NBQXdDLEVBQzNDLE1BQU0seUVBQXlFLENBQUM7QUFDakYsT0FBTyxFQUFFLDJDQUEyQyxFQUFFLE1BQU0sNEVBQTRFLENBQUM7QUFDekksT0FBTyxFQUFFLDJDQUEyQyxFQUFFLE1BQU0sNEVBQTRFLENBQUM7QUFFekksTUFBTSxPQUFPLCtDQUFnRCxTQUFRLHdCQUF3QjtJQUVsRixZQUFZLENBQUMsVUFBK0Q7UUFDL0UsTUFBTSx1QkFBdUIsR0FBRyxVQUFVLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUM7UUFDckUsTUFBTSxpQkFBaUIsR0FBRyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsSUFBSSwyQ0FBMkMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSx3Q0FBd0MsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUUzSyxNQUFNLHNCQUFzQixHQUE0QjtZQUNwRCxRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDN0IsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO1lBQ3JCLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRztZQUNuQixLQUFLLEVBQUUsVUFBVSxDQUFDLEtBQUs7WUFDdkIsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLHNCQUFzQjtZQUN6RCxxQkFBcUIsRUFBRSxVQUFVLENBQUMscUJBQXFCO1lBQ3ZELFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtZQUNqQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7WUFDakMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxTQUFTO1lBQy9CLE1BQU0sRUFBRSxpQkFBaUI7WUFDekIsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO1lBQzdCLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtTQUNwQyxDQUFDO1FBQ0YsTUFBTSxZQUFZLEdBQUcsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztRQUVwRixNQUFNLDhCQUE4QixHQUFHLElBQUksOEJBQThCLENBQUMsaUJBQWlCLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQ3ZILE1BQU0scUJBQXFCLEdBQUcsSUFBSSwyQ0FBMkMsQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFM0gsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSw4QkFBOEIsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO1FBRTlHLE9BQU8saUJBQWlCLENBQUM7SUFDN0IsQ0FBQztDQUVKIn0=