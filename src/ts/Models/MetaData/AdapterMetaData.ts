import { ISchema, Model } from 'Models/Model';

interface IAdapterMetaData extends ISchema {
    name: [string, string[]];
    version: [string, string[]];
}

export class AdapterMetaData extends Model<IAdapterMetaData> {

    public static getCategory(): string {
        return 'adapter';
    }

    public static getKeys(): string[] {
        return ['name', 'version'];
    }

    constructor(data: string[]) {
        super({
            name: ['', ['string']],
            version: ['', ['string']]
        });

        this.set('name', data[0]);
        this.set('version', data[1]);
    }

    public getName(): string {
        return this.get('name');
    }

    public getVersion(): string {
        return this.get('version');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'adapterName': this.getName(),
            'adapterVersion': this.getVersion()
        };
    }

}
