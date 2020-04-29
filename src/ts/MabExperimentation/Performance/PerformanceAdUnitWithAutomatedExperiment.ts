import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { AutomatedExperimentsCategories } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';

export interface IPerformanceAdUnitWithAutomatedExperimentParameters extends IPerformanceAdUnitParameters {
    automatedExperimentManager: AutomatedExperimentManager;
}

export class PerformanceAdUnitWithAutomatedExperiment extends PerformanceAdUnit {
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
