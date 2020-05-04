import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { AutomatedExperimentsCategories, ArAvailableButtonExperiment } from 'MabExperimentation/Models/AutomatedExperimentsList';
import { Campaign } from 'Ads/Models/Campaign';

export function arAvailableButtonDecision(automatedExperimentManager: AutomatedExperimentManager, campaign: Campaign): IExperimentActionChoice {
    let actions: IExperimentActionChoice | undefined;

    actions = automatedExperimentManager.activateSelectedExperiment(campaign, AutomatedExperimentsCategories.MRAID_AR);

    if (actions === undefined) {
        actions = ArAvailableButtonExperiment.getDefaultActions();
    }

    return actions;
}
