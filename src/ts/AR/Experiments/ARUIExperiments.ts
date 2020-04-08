import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { ArAvailableButtonExperiment } from 'Ads/Models/AutomatedExperimentsList';
import { AUIMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Campaign } from 'Ads/Models/Campaign';

export interface IArUiExperiments {
    color: string;
    skip: string;
}

export function arAvailableButtonDecision(automatedExperimentManager: AutomatedExperimentManager, campaign: Campaign): IArUiExperiments {
    const arAvailableButtonCombination = automatedExperimentManager.activateExperiment(campaign, ArAvailableButtonExperiment);

    return {
        color: arAvailableButtonCombination.color,
        skip: arAvailableButtonCombination.skip
    };
}
