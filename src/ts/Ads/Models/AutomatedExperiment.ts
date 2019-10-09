import { ISchema, Model } from 'Core/Models/Model';

export interface IAutomatedExperiment {
    name: string;
    actions: string[];
    defaultAction: string;
    cacheDisabled?: boolean;
}

export class AutomatedExperiment extends Model<IAutomatedExperiment> {
    public static Schema: ISchema<IAutomatedExperiment> = {
        name: ['string'],
        actions: ['array'],
        defaultAction: ['string'],
        cacheDisabled: ['boolean', 'undefined']
    };

    constructor(data: IAutomatedExperiment) {
        super('AutomatedExperiment', AutomatedExperiment.Schema, data);
    }

    public getName(): string {
        return this.get('name');
    }

    public getActions(): string[] {
        return this.get('actions');
    }

    public getDefaultAction(): string {
        return this.get('defaultAction');
    }

    public isCacheDisabled(): boolean | undefined {
        return this.get('cacheDisabled');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'name': this.getName(),
            'actions': this.getActions(),
            'defaultAction': this.getDefaultAction(),
            'cacheDisabled': this.isCacheDisabled()
        };
    }
}
