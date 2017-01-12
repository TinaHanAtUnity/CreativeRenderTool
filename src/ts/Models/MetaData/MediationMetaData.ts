import { Model } from 'Models/Model';

export class MediationMetaData extends Model {

    public static getCategory(): string {
        return 'mediation';
    }

    public static getKeys(): string[] {
        return ['name', 'version', 'ordinal'];
    }

    private _name: string;
    private _version: string;
    private _ordinal: number;

    constructor(data: string[]) {
        super();
        this._name = data[0];
        this._version = data[1];
        this._ordinal = parseInt(data[2], 10);
    }

    public getName(): string {
        return this._name;
    }

    public getVersion(): string {
        return this._version;
    }

    public getOrdinal(): number {
        return this._ordinal;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'mediationName': this._name,
            'mediationVersion': this._version,
            'mediationOrdinal': this._ordinal
        };
    }

}
