import { AutomatedExperimentManager } from 'MABOptimization/AutomatedExperimentManager';
import { IExperimentActionChoice } from 'MABOptimization/Models/AutomatedExperiment';
import { AutomatedExperimentsCategories, ArAvailableButtonExperiment } from 'MABOptimization/Models/AutomatedExperimentsList';
import { Campaign } from 'Ads/Models/Campaign';

export function arAvailableButtonDecision(automatedExperimentManager: AutomatedExperimentManager, campaign: Campaign): IExperimentActionChoice {
    let actions: IExperimentActionChoice | undefined;

    const experimentID = automatedExperimentManager.getSelectedExperimentName(campaign, AutomatedExperimentsCategories.MRAID_AR);
    if (experimentID === ArAvailableButtonExperiment.getName()) {
        actions = automatedExperimentManager.activateSelectedExperiment(campaign, AutomatedExperimentsCategories.MRAID_AR);
    }

    if (actions === undefined) {
        actions = ArAvailableButtonExperiment.getDefaultActions();
    }

    return actions;
}
