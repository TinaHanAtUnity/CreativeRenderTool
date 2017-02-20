import { Model } from 'Models/Model';

export class MediationMetaData extends Model {

    public static getCategory(): string {
        return 'mediation';
    }

    public static getStaticKeys(): string[] {
        return ['name', 'version'];
    }

    public static getOrdinalKey(): string {
        return 'ordinal';
    }

    private _name: string;
    private _version: string;
    private _ordinal: number;

    constructor(data: string[]) {
        super();
        this._name = data[0];
        this._version = data[1];
    }

    public getName(): string {
        return this._name;
    }

    public getVersion(): string {
        return this._version;
    }

    public setOrdinal(ordinal: number) {
        this._ordinal = ordinal;
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
