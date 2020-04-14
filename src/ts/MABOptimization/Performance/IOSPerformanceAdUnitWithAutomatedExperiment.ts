import { AutomatedExperimentManager } from 'MABOptimization/AutomatedExperimentManager';
import { IOSPerformanceAdUnit } from 'Performance/AdUnits/IOSPerformanceAdUnit';
import { IPerformanceAdUnitWithAutomatedExperimentParameters } from 'MABOptimization/Performance/PerformanceAdUnitWithAutomatedExperiment';
import { AutomatedExperimentsCategories } from 'MABOptimization/Models/AutomatedExperimentsList';
export class IOSPerformanceAdUnitWithAutomatedExperiment extends IOSPerformanceAdUnit {

    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(parameters: IPerformanceAdUnitWithAutomatedExperimentParameters) {
        super(parameters);
        this._automatedExperimentManager = parameters.automatedExperimentManager;
    }

    public hide(): Promise<void> {
        this._automatedExperimentManager.endSelectedExperiment(this.getCampaign(), AutomatedExperimentsCategories.PERFORMANCE_ENDCARD);

        return super.hide();
    }
}
