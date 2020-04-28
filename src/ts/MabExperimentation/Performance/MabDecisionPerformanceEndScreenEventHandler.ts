import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { IStoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { AutomatedExperimentsCategories } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { IPerformanceAdUnitWithAutomatedExperimentParameters } from 'MabExperimentation/Performance/PerformanceAdUnitWithAutomatedExperiment';

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
