import { IMetaData, MetaData } from 'Models/MetaData/MetaData';

interface IMediationMetaData extends IMetaData {
    name: string;
    version: string;
    ordinal: number | undefined;
    ordinalKey: string;
}

export class MediationMetaData extends MetaData<IMediationMetaData> {

    constructor(data: string[]) {
        super({
            ... MetaData.Schema,
            name: ['string'],
            version: ['string'],
            ordinal: ['number', 'undefined'],
            ordinalKey: ['string']
        });

        this.set('ordinalKey', 'ordinal');
        this.set('category', 'mediation');
        this.set('keys', ['name', 'version']);
        this.set('name', data[0]);
        this.set('version', data[1]);
    }

    public getOrdinalKey(): string {
        return this.get('ordinalKey');
    }

    public getName(): string {
        return this.get('name');
    }

    public getVersion(): string {
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
            'name': this.getName(),
            'version': this.getVersion(),
            'ordinal': this.getOrdinal(),
            'keys': this.getKeys(),
            'category': this.getCategory()
        };
    }
}
