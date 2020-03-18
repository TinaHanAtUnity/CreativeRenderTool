import { IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { IOnCampaignListener, implementsIOnCampaignListener } from 'Ads/Managers/CampaignManager';
import { Campaign, ICampaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Platform } from 'Core/Constants/Platform';
import { Observable3 } from 'Core/Utilities/Observable';
import { IOSPerformanceAdUnitWithAutomatedExperiment } from 'Performance/AdUnits/IOSPerformanceAdUnitWithAutomatedExperiment';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import {
    IPerformanceAdUnitWithAutomatedExperimentParameters,
    PerformanceAdUnitWithAutomatedExperiment
} from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperiment';
import { MabDecisionPerformanceEndScreenEventHandler } from 'Performance/EventHandlers/MabDecisionPerformanceEndScreenEventHandler';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';

export class PerformanceAdUnitWithAutomatedExperimentFactory extends PerformanceAdUnitFactory implements IOnCampaignListener {

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

    public listenOnCampaigns(onCampaign: Observable3<string, Campaign, ICampaignTrackingUrls | undefined>): void {
        if (implementsIOnCampaignListener(this.getParametersFactory())) {
            (<IOnCampaignListener><unknown> this.getParametersFactory()).listenOnCampaigns(onCampaign);
        }
    }

}
