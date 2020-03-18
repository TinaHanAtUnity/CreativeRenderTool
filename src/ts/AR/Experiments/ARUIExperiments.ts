import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { ArAvailableButtonExperiment } from 'Ads/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Campaign } from 'Ads/Models/Campaign';

export interface IArUiExperiments {
    color: string;
    skip: string;
}

export function arAvailableButtonDecision(automatedExperimentManager: AutomatedExperimentManager, campaign: Campaign): IArUiExperiments {
    let arAvailableButtonCombination = ArAvailableButtonExperiment.getDefaultActions();
    const mabDecision = automatedExperimentManager.activateExperiment(campaign, ArAvailableButtonExperiment);

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
