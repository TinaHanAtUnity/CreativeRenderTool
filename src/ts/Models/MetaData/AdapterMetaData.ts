import { Model } from 'Models/Model';

export class AdapterMetaData extends Model {

    private _name: string;
    private _version: string;

    public static getCategory(): string {
        return 'adapter';
    }

    public static getKeys(): string[] {
        return ['name.value', 'version.value'];
    }

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

    public getDTO(): { [key: string]: any } {
        return {
            'adapterName': this._name,
            'adapterVersion': this._version
        };
    }

}
