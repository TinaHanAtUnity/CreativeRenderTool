import { IMetaData, BaseMetaData } from 'Models/MetaData/BaseMetaData';

interface IMediationMetaData extends IMetaData {
    name: string | undefined;
    version: string | undefined;
    ordinal: number | undefined;
}

export class MediationMetaData extends BaseMetaData<IMediationMetaData> {

    constructor() {
        super('MediationMetaData', {
            ... BaseMetaData.Schema,
            name: ['string', 'undefined'],
            version: ['string', 'undefined'],
            ordinal: ['number', 'undefined']
        });

        this.set('category', 'mediation');
        this.set('keys', ['name', 'version', 'ordinal']);
    }

    public getName(): string | undefined {
        return this.get('name');
    }

    public getVersion(): string | undefined {
        return this.get('version');
    }

    public setOrdinal(ordinal: number) {
        this.set('ordinal', ordinal);
    }

    public getOrdinal(): number | undefined {
        return this.get('ordinal');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'mediationName': this.getName(),
            'mediationVersion': this.getVersion(),
            'mediationOrdinal': this.getOrdinal()
        };
    }
}
