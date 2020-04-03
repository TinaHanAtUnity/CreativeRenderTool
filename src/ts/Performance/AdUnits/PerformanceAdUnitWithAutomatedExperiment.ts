import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { AutomatedExperimentsCategories } from 'Ads/Models/AutomatedExperimentsList';
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
        this._automatedExperimentManager.endSelectedExperiment(this.getCampaign(), AutomatedExperimentsCategories.PERFAD_ENDCARD);
        return super.hide();
    }
}
