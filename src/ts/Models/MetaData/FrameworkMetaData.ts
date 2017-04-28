import { IMetaData, MetaData } from 'Models/MetaData/MetaData';

interface IFrameworkMetaData extends IMetaData {
    name: string;
    version: string;
}

export class FrameworkMetaData extends MetaData<IFrameworkMetaData> {
    constructor(data: string[]) {
        super({
            ... MetaData.Schema,
            name: ['string'],
            version: ['string']
        });

        this.set('category', 'framework');
        this.set('keys', ['name', 'version']);
        this.set('name', data[0]);
        this.set('version', data[1]);
    }

    public getCategory(): string {
        return this.get('category');
    }

    public getKeys(): string[] {
        return this.get('keys');
    }

    public getName(): string {
        return this.get('name');
    }

    public getVersion(): string {
        return this.get('version');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'name': this.getName(),
            'version': this.getVersion(),
            'keys': this.getKeys(),
            'category': this.getCategory()
        };
    }
}
