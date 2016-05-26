import { Model } from 'Models/Model';

export class FrameworkMetaData extends Model {

    private _name: string;
    private _version: string;

    public static getCategory(): string {
        return 'framework';
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
            'frameworkName': this._name,
            'frameworkVersion': this._version
        };
    }

}
