import { ISchema, Model } from 'Models/Model';

interface IMediationMetaData extends ISchema {
    name: [string, string[]];
    version: [string, string[]];
    ordinal: [number | undefined, string[]];
}

export class MediationMetaData extends Model<IMediationMetaData> {

    public static getCategory(): string {
        return 'mediation';
    }

    public static getStaticKeys(): string[] {
        return ['name', 'version'];
    }

    public static getOrdinalKey(): string {
        return 'ordinal';
    }

    constructor(data: string[]) {
        super({
            name: ['', ['string']],
            version: ['', ['string']],
            ordinal: [undefined, ['number', 'undefined']]
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
            'ordinal': this.getOrdinal()
        };
    }

}
