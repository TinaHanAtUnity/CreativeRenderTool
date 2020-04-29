import { IExperimentActionChoice } from 'MabExperimentation/Models/AutomatedExperiment';
import { IAggregateExperiment } from 'MabExperimentation/Models/AutomatedExperimentResponse';

// What: enum expressing the possible states of a CategorizedExperiment
export enum CategorizedExperimentStage {
    AWAITING_OPTIMIZATION,
    OPTIMIZED,
    RUNNING,
    OUTCOME_PUBLISHED,
    ENDED
}

// What: Represents an Experiment that is Categorized as belongning to a group of experiments targetting the same element
//       (say `Performance Ad EndCards` vs `Performance Ad Video`).
//
// Why: Needed for holding an experiment, within the context of a Campaign Optimization.
export class CategorizedExperiment {
    constructor() {
        this.Outcome = 0;
        this.Stage = CategorizedExperimentStage.AWAITING_OPTIMIZATION;
    }

    public Stage: CategorizedExperimentStage;
    public Experiment: IAggregateExperiment;
    public Outcome: number;

    public aggregatedActions(): IExperimentActionChoice {

        const actions: IExperimentActionChoice = {};

        for (const part of this.Experiment.parts) {

            Object.keys(part.actions).forEach((act) => {
                actions[act] = part.actions[act];
            });
        }

        return actions;
    }
}
