import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { ButtonAnimationsExperiment } from 'Ads/Models/AutomatedExperimentsList';
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

    public show(): Promise<void> {
        this._automatedExperimentManager.sendAction(ButtonAnimationsExperiment);
        return super.show();
    }

    public hide(): Promise<void> {
        this._automatedExperimentManager.endExperiment();
        return super.hide();
    }
}
