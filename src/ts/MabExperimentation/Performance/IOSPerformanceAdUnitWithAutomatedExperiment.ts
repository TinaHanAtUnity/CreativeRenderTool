import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { IOSPerformanceAdUnit } from 'Performance/AdUnits/IOSPerformanceAdUnit';
import { IPerformanceAdUnitWithAutomatedExperimentParameters } from 'MabExperimentation/Performance/PerformanceAdUnitWithAutomatedExperiment';
import { AutomatedExperimentsCategories } from 'MabExperimentation/Models/AutomatedExperimentsList';
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
