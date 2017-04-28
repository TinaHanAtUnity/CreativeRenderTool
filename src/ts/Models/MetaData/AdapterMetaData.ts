import { IMetaData, BaseMetaData } from 'Models/MetaData/BaseMetaData';

interface IAdapterMetaData extends IMetaData {
    name: string | undefined;
    version: string | undefined;
}

export class AdapterMetaData extends BaseMetaData<IAdapterMetaData> {
    constructor() {
        super({
            ... BaseMetaData.Schema,
            name: ['string', 'undefined'],
            version: ['string', 'undefined']
        });

        this.set('category', 'adapter');
        this.set('keys', ['name', 'version']);
    }

    public getName(): string | undefined {
        return this.get('name');
    }

    public getVersion(): string | undefined {
        return this.get('version');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'name': this.getName(),
            'version': this.getVersion()
        };
    }
}
