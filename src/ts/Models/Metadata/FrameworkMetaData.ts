import { Model } from 'Models/Model';

export class FrameworkMetaData extends Model {

    private _name: string;
    private _version: string;

    constructor(name: string, version: string) {
        super();
        this._name = name;
        this._version = version;
    }

    public getName(): string {
        return this._name;
    }

    public getVersion(): string {
        return this._version;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'name': this._name,
            'version': this._version
        };
    }

}
