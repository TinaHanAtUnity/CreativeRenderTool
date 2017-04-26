import { Model } from 'Models/Model';

interface IFrameworkMetaData {
    name: string;
    version: string;
}

export class FrameworkMetaData extends Model<IFrameworkMetaData> {

    public static getCategory(): string {
        return 'framework';
    }

    public static getKeys(): string[] {
        return ['name', 'version'];
    }

    constructor(data: string[]) {
        super({
            name: ['string'],
            version: ['string']
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
            'name': this.getName(),
            'version': this.getVersion()
        };
    }

}
