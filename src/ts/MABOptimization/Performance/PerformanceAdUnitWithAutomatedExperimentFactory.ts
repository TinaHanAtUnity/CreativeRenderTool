import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Platform } from 'Core/Constants/Platform';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import {
    IPerformanceAdUnitWithAutomatedExperimentParameters,
    PerformanceAdUnitWithAutomatedExperiment
} from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperiment';
import { IOSPerformanceAdUnitWithAutomatedExperiment } from 'Performance/AdUnits/IOSPerformanceAdUnitWithAutomatedExperiment';
import { MabDecisionPerformanceEndScreenEventHandler } from 'Performance/EventHandlers/MabDecisionPerformanceEndScreenEventHandler';

export class PerformanceAdUnitWithAutomatedExperimentFactory extends PerformanceAdUnitFactory {

    public createAdUnit(parameters: IPerformanceAdUnitWithAutomatedExperimentParameters): PerformanceAdUnit {
        const useIOSPerformanceAdUnit = parameters.platform === Platform.IOS;
        const performanceAdUnit = useIOSPerformanceAdUnit ? new IOSPerformanceAdUnitWithAutomatedExperiment(parameters) : new PerformanceAdUnitWithAutomatedExperiment(parameters);

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
