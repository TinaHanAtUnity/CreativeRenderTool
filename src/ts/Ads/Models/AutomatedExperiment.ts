import { ISchema, Model } from 'Core/Models/Model';

// The choices made for an experiment, indexed by action name
export interface IExperimentActionChoice {
    [actionName: string]: string;
}

// The possible values available for an experiment, indexed by action name
export interface IExperimentActionsPossibleValues {
    [actionName: string]: string[];
}

// The declaration of available actions and their respective values for an experiment
export interface IExperimentDeclaration {
    [actionName: string]: {[descriptiveName: string]: string};
}

export interface IAutomatedExperiment {
    name: string;
    actions: IExperimentDeclaration;
    defaultActions: IExperimentActionChoice;
    cacheDisabled?: boolean;
}

export class AutomatedExperiment extends Model<IAutomatedExperiment> {
    public static Schema: ISchema<IAutomatedExperiment> = {
        name: ['string'],
        actions: ['object'],
        defaultActions: ['object'],
        cacheDisabled: ['boolean', 'undefined']
    };

    constructor(data: IAutomatedExperiment) {
        super('AutomatedExperiment', AutomatedExperiment.Schema, data);
    }

    public getName(): string {
        return this.get('name');
    }

    public getActions(): IExperimentDeclaration {
        return this.get('actions');
    }

    public getDefaultActions(): IExperimentActionChoice {
        return this.get('defaultActions');
    }

    public isCacheDisabled(): boolean | undefined {
        return this.get('cacheDisabled');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'name': this.getName(),
            'actions': this.getActions(),
            'defaultAction': this.getDefaultActions(),
            'cacheDisabled': this.isCacheDisabled()
        };
    }

    public isValid(actions: IExperimentActionChoice): boolean {
        const actionsSpace = this.getActions();
        const actionNames = Object.keys(actionsSpace);

        for (const actionName of actionNames) {
            if (!Object.values(actionsSpace[actionName]).includes(actions[actionName])) {
                return false;
            }
        }

        return true;
    }
}
