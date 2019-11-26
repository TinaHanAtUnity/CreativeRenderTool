import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { MabDecisionButtonTest } from 'Core/Models/ABGroup';
import { ButtonAnimationsExperiment } from 'Ads/Models/AutomatedExperimentsList';
import { IOSPerformanceAdUnit } from 'Performance/AdUnits/IOSPerformanceAdUnit';
import { IPerformanceAdUnitWithAutomatedExperimentParameters } from 'Performance/AdUnits/PerformanceAdUnitWithAutomatedExperiment';

export class IOSPerformanceAdUnitWithAutomatedExperiment extends IOSPerformanceAdUnit {

    private _coreConfig: CoreConfiguration;
    private _automatedExperimentManager: AutomatedExperimentManager;

    constructor(parameters: IPerformanceAdUnitWithAutomatedExperimentParameters) {
        super(parameters);
        this._coreConfig = parameters.coreConfig;
        this._automatedExperimentManager = parameters.automatedExperimentManager;
    }

    public show(): Promise<void> {
        this._automatedExperimentManager.sendAction(ButtonAnimationsExperiment, this.getCampaign() ? this.getCampaign().getSession().getId() : undefined);
        return super.show();
    }

    public hide(): Promise<void> {
        this._automatedExperimentManager.endExperiment();

        return super.hide();
    }
}
