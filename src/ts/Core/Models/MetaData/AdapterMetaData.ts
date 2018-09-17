import { BaseMetaData, IMetaData } from 'Core/Models/MetaData/BaseMetaData';

interface IAdapterMetaData extends IMetaData {
    name: string | undefined;
    version: string | undefined;
}

export class AdapterMetaData extends BaseMetaData<IAdapterMetaData> {
    constructor() {
        super('AdapterMetaData', {
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
            'adapterName': this.getName(),
            'adapterVersion': this.getVersion()
        };
    }
}
