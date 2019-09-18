import { Model } from 'Core/Models/Model';

export interface IRawAgeGate {
    ageLimit: number;
    enabled: boolean;
}

interface IAgeGate {
    ageLimit: number;
    enabled: boolean;
}

export class AgeGate extends Model<IAgeGate> {

    constructor(data: IRawAgeGate) {
        super('AgeGate', {
            ageLimit: ['number'],
            enabled: ['boolean']
        });

        this.set('ageLimit', data.ageLimit);
        this.set('enabled', data.enabled);
    }

    public isEnabled(): boolean {
        return this.get('enabled');
    }

    public getAgeLimit(): number {
        return this.get('ageLimit');
    }

    public getDTO(): { [p: string]: unknown } {
        return {};
    }

}
