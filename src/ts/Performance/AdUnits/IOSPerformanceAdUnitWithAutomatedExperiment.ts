import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { IOSPerformanceAdUnit } from 'Performance/AdUnits/IOSPerformanceAdUnit';
import { IPerformanceAdUnitWithAutomatedExperimentParameters } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperiment';

export class IOSPerformanceAdUnitWithAutomatedExperiment extends IOSPerformanceAdUnit {

    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(parameters: IPerformanceAdUnitWithAutomatedExperimentParameters) {
        super(parameters);
        this._automatedExperimentManager = parameters.automatedExperimentManager;
    }

    public show(): Promise<void> {
        this._automatedExperimentManager.startCampaign(this.getCampaign());
        return super.show();
    }

    public hide(): Promise<void> {
        this._automatedExperimentManager.endCampaign(this.getCampaign());

        return super.hide();
    }
}
