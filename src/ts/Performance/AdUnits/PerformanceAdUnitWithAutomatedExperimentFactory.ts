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

        let performanceOverlayEventHandler: PerformanceOverlayEventHandler;

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
            coreConfig: parameters.coreConfig,
            downloadManager: parameters.downloadManager,
            deviceIdManager: parameters.deviceIdManager
        };
        const storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);

        performanceOverlayEventHandler = new PerformanceOverlayEventHandler(performanceAdUnit, parameters, storeHandler);
        parameters.overlay.addEventHandler(performanceOverlayEventHandler);
        const endScreenEventHandler = new MabDecisionPerformanceEndScreenEventHandler(performanceAdUnit, parameters, storeHandler);
        parameters.endScreen.addEventHandler(endScreenEventHandler);

        const videoEventHandlerParams = this.getVideoEventHandlerParams(performanceAdUnit, parameters.video, parameters.adUnitStyle, parameters);
        this.prepareVideoPlayer(PerformanceVideoEventHandler, <IVideoEventHandlerParams<PerformanceAdUnit>>videoEventHandlerParams);

        if (parameters.platform === Platform.ANDROID) {
            const onBackKeyObserver = parameters.ads.Android!.AdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => {
                endScreenEventHandler.onKeyEvent(keyCode);

                if (CustomFeatures.isCloseIconSkipEnabled(parameters.clientInfo.getGameId())) {
                    performanceOverlayEventHandler.onKeyEvent(keyCode);
                }
            });
            performanceAdUnit.onClose.subscribe(() => {
                if (onBackKeyObserver) {
                    parameters.ads.Android!.AdUnit.onKeyDown.unsubscribe(onBackKeyObserver);
                }
            });
        }
        return performanceAdUnit;
    }

}
