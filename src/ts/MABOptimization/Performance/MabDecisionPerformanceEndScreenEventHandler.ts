import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { AutomatedExperimentManager } from 'MABOptimization/AutomatedExperimentManager';
import { AutomatedExperimentsCategories } from 'MABOptimization/Models/AutomatedExperimentsList';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { IPerformanceAdUnitWithAutomatedExperimentParameters } from 'MABOptimization/Performance/PerformanceAdUnitWithAutomatedExperiment';

export class MabDecisionPerformanceEndScreenEventHandler extends PerformanceEndScreenEventHandler {

    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitWithAutomatedExperimentParameters, storeHandler: IStoreHandler) {
        super(adUnit, parameters, storeHandler);
        this._automatedExperimentManager = parameters.automatedExperimentManager;
    }

    public onEndScreenDownload(parameters: IStoreHandlerDownloadParameters): void {
        super.onEndScreenDownload(parameters);
        this._automatedExperimentManager.rewardSelectedExperiment(this._adUnit.getCampaign(), AutomatedExperimentsCategories.PERFORMANCE_ENDCARD);
    }
}
