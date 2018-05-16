import { IMetaData, BaseMetaData } from 'Models/MetaData/BaseMetaData';

interface IGdprMetaData extends IMetaData {
    consent: boolean | undefined;
}

export class GdprMetaData extends BaseMetaData<IGdprMetaData> {
    constructor() {
        super('GdprMetaData', {
            ... BaseMetaData.Schema,
            consent: ['boolean', 'undefined']
        });

        this.set('category', 'gdpr');
        this.set('keys', ['consent']);
    }

    public getConsent(): boolean | undefined {
        return this.get('consent');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'consent': this.getConsent()
        };
    }
}
