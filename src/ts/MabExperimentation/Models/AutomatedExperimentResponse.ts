import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';

// What: model of AUI/Optmz body's response to an optimization request
export interface IAutomatedExperimentResponse {
    categories: { [expCat: string]: IAggregateExperiment };
}

// What: Modelizartion of an aggregate experiment returned by the AUI/Optmz service.
//
// Why: For a given experiment category, AUI/Optmz service can return multiple answers that, as whole, make up to complete decision.
// These experiments always share the same "outcome" but are seperate decisions and need to be tracked seperately so that outcomes
// can be reported back correctly to the AUI/optmz service.
export interface IAggregateExperiment {
    experiment_name: string;
    parts: IAggregateExperimentPart[];
}

// What: modelization of response from AUI/Optmz service of a decision that makes up an Aggregate Experiment
export interface IAggregateExperimentPart {
    id: string;
    actions: IExperimentActionChoice;
    metadata: string;
}
