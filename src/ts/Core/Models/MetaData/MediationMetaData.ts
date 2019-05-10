import { BaseMetaData, IMetaData } from 'Core/Models/MetaData/BaseMetaData';


interface IMediationMetaData extends IMetaData {
    name: string | undefined;
    version: string | undefined;
    ordinal: number | undefined;
    enable_metadata_load: boolean | undefined;
}

export class MediationMetaData extends BaseMetaData<IMediationMetaData> {

    constructor() {
        super('MediationMetaData', {
            ... BaseMetaData.Schema,
            name: ['string', 'undefined'],
            version: ['string', 'undefined'],
            ordinal: ['number', 'undefined'],
            enable_metadata_load: ['boolean', 'undefined']
        });

        this.set('category', 'mediation');
        this.set('keys', ['name', 'version', 'ordinal', 'enable_metadata_load']);
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

    public isMetaDataLoadEnabled(): boolean {
        const enableMetadataLoad:boolean | undefined = this.get('enable_metadata_load');
        return enableMetadataLoad ? enableMetadataLoad : false;
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'mediationName': this.getName(),
            'mediationVersion': this.getVersion(),
            'mediationOrdinal': this.getOrdinal()
        };
    }
}
