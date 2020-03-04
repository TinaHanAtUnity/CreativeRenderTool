import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { ArAvailableButtonExperiment } from 'Ads/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export interface IArUiExperiments {
    color: string;
    skip: string;
}

export function arAvailableButtonDecision(automatedExperimentManager: AutomatedExperimentManager): IArUiExperiments {
    let arAvailableButtonCombination = ArAvailableButtonExperiment.getDefaultActions();
    const mabDecision = automatedExperimentManager.getExperimentAction(ArAvailableButtonExperiment);

    if (mabDecision) {
        arAvailableButtonCombination = mabDecision;
    } else {
        SDKMetrics.reportMetricEvent(AUIMetric.DecisionNotReady);
    }

    return {
        color: arAvailableButtonCombination.color,
        skip: arAvailableButtonCombination.skip
    };
}