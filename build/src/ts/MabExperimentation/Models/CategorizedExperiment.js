// What: enum expressing the possible states of a CategorizedExperiment
export var CategorizedExperimentStage;
(function (CategorizedExperimentStage) {
    CategorizedExperimentStage[CategorizedExperimentStage["AWAITING_OPTIMIZATION"] = 0] = "AWAITING_OPTIMIZATION";
    CategorizedExperimentStage[CategorizedExperimentStage["OPTIMIZED"] = 1] = "OPTIMIZED";
    CategorizedExperimentStage[CategorizedExperimentStage["RUNNING"] = 2] = "RUNNING";
    CategorizedExperimentStage[CategorizedExperimentStage["OUTCOME_PUBLISHED"] = 3] = "OUTCOME_PUBLISHED";
    CategorizedExperimentStage[CategorizedExperimentStage["ENDED"] = 4] = "ENDED";
})(CategorizedExperimentStage || (CategorizedExperimentStage = {}));
// What: Represents an Experiment that is Categorized as belongning to a group of experiments targetting the same element
//       (say `Performance Ad EndCards` vs `Performance Ad Video`).
//
// Why: Needed for holding an experiment, within the context of a Campaign Optimization.
export class CategorizedExperiment {
    constructor() {
        this.Outcome = 0;
        this.Stage = CategorizedExperimentStage.AWAITING_OPTIMIZATION;
    }
    aggregatedActions() {
        const actions = {};
        for (const part of this.Experiment.parts) {
            Object.keys(part.actions).forEach((act) => {
                actions[act] = part.actions[act];
            });
        }
        return actions;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2F0ZWdvcml6ZWRFeHBlcmltZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL01hYkV4cGVyaW1lbnRhdGlvbi9Nb2RlbHMvQ2F0ZWdvcml6ZWRFeHBlcmltZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLHVFQUF1RTtBQUN2RSxNQUFNLENBQU4sSUFBWSwwQkFNWDtBQU5ELFdBQVksMEJBQTBCO0lBQ2xDLDZHQUFxQixDQUFBO0lBQ3JCLHFGQUFTLENBQUE7SUFDVCxpRkFBTyxDQUFBO0lBQ1AscUdBQWlCLENBQUE7SUFDakIsNkVBQUssQ0FBQTtBQUNULENBQUMsRUFOVywwQkFBMEIsS0FBMUIsMEJBQTBCLFFBTXJDO0FBRUQseUhBQXlIO0FBQ3pILG1FQUFtRTtBQUNuRSxFQUFFO0FBQ0Ysd0ZBQXdGO0FBQ3hGLE1BQU0sT0FBTyxxQkFBcUI7SUFDOUI7UUFDSSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLDBCQUEwQixDQUFDLHFCQUFxQixDQUFDO0lBQ2xFLENBQUM7SUFNTSxpQkFBaUI7UUFFcEIsTUFBTSxPQUFPLEdBQTRCLEVBQUUsQ0FBQztRQUU1QyxLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFO1lBRXRDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUN0QyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztTQUNOO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKIn0=