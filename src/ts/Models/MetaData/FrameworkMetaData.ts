import { IMetaData, BaseMetaData } from 'Models/MetaData/BaseMetaData';

interface IFrameworkMetaData extends IMetaData {
    name: string | undefined;
    version: string | undefined;
}

export class FrameworkMetaData extends BaseMetaData<IFrameworkMetaData> {
    constructor() {
        super('FrameworkMetaData', {
            ... BaseMetaData.Schema,
            name: ['string', 'undefined'],
            version: ['string', 'undefined']
        });

        this.set('category', 'framework');
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
            'frameworkName': this.getName(),
            'frameworkVersion': this.getVersion(),
        };
    }
}
