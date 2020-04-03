import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { IExperimentActionChoice } from 'Ads/Models/AutomatedExperiment';
import { AutomatedExperimentsCategories, ArAvailableButtonExperiment } from 'Ads/Models/AutomatedExperimentsList';
import { Campaign } from 'Ads/Models/Campaign';

export interface IArUiExperiments {
    color: string;
    skip: string;
}

export function arAvailableButtonDecision(automatedExperimentManager: AutomatedExperimentManager, campaign: Campaign): IArUiExperiments {
    let actions: IExperimentActionChoice | undefined;

    const experimentID = automatedExperimentManager.getSelectedExperiment(campaign, AutomatedExperimentsCategories.MRAID_AR);
    if (experimentID === ArAvailableButtonExperiment.getName()) {
        actions = automatedExperimentManager.activateSelectedExperiment(campaign, AutomatedExperimentsCategories.MRAID_AR);
    }

    if (actions === undefined) {
        actions = ArAvailableButtonExperiment.getDefaultActions();
    }

    return {
        color: actions.color,
        skip: actions.skip
    };
}
