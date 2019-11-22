import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { IPerformanceAdUnitWithAutomatedExperimentParameters } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperiment';

export class MabDecisionPerformanceEndScreenEventHandler extends PerformanceEndScreenEventHandler {

    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitWithAutomatedExperimentParameters, storeHandler: IStoreHandler) {
        super(adUnit, parameters, storeHandler);
        this._automatedExperimentManager = parameters.automatedExperimentManager;
    }

    public onEndScreenDownload(parameters: IStoreHandlerDownloadParameters): void {
        super.onEndScreenDownload(parameters);
        this._automatedExperimentManager.sendReward();
    }
}
