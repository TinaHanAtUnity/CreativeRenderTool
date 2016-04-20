import { Model } from 'Models/Model';

export class MediationMetaData extends Model {

    private _name: string;
    private _version: string;
    private _ordinal: number;

    constructor(name: string, version: string, ordinal: number) {
        super();
        this._name = name;
        this._version = version;
        this._ordinal = ordinal;
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
            'name': this._name,
            'version': this._version,
            'ordinal': this._ordinal
        };
    }

}
