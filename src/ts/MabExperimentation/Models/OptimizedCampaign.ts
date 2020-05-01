import { CategorizedExperiment } from 'MabExperimentation/Models/CategorizedExperiment';

// What: Utility class that associates an Ad campaign to a list of CategorizedExperiment in various states of processing
//
// Why: AutomatedExperimentManager needed something to describe otimizations targeting an ad campaign and the current state
//      of processing it.
export class OptimizedCampaign {
    constructor() {
        this.CategorizedExperiments = {};
        this.Id = '';
    }

    public Id: string;
    public CategorizedExperiments: { [Category: string]: CategorizedExperiment };
}
