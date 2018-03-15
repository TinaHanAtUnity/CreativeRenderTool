import { IMetaData, BaseMetaData } from 'Models/MetaData/BaseMetaData';

interface IUserMetaData extends IMetaData {
    requestCount: number;
    clickCount: number;
}

export class UserMetaData extends BaseMetaData<IUserMetaData> {
    constructor() {
        super('UserMetaData', {
            ... BaseMetaData.Schema,
            requestCount: ['number'],
            clickCount: ['number']
        });

        this.set('category', 'user');
        this.set('keys', ['requestCount', 'clickCount']);
    }

    public getRequestCount(): number {
        return this.get('requestCount');
    }

    public getClickCount(): number {
        return this.get('clickCount');
    }

    public getDTO(): { [key: string]: any} {
        return {
            'requestCount': this.getRequestCount(),
            'clickCount': this.getClickCount()
        };
    }
}
