import { IMetaData, MetaData } from 'Models/MetaData/MetaData';

interface IPlayerMetaData extends IMetaData {
    serverId: string;
}

export class PlayerMetaData extends MetaData<IPlayerMetaData> {

    constructor(data: string[]) {
        super({
            ... MetaData.Schema,
            serverId: ['string'],
        });

        this.set('keys', ['server_id']);
        this.set('category', 'player');
        this.set('serverId', data[0]);
    }

    public getCategory(): string {
        return this.get('category');
    }

    public getKeys(): string[] {
        return this.get('keys');
    }

    public getServerId(): string {
        return this.get('serverId');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'sid': this.getServerId(),
            'keys': this.getKeys(),
            'category': this.getCategory()
        };
    }
}
