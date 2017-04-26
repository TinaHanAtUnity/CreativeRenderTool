import { IRuntimeSchema, ISchema, Model } from 'Models/Model';

interface IPlayerMetaData extends ISchema {
    serverId: string;
}

interface IPlayerMetaDataRuntimeSchema {
    serverId: string[];
}

export class PlayerMetaData extends Model<IPlayerMetaData, IPlayerMetaDataRuntimeSchema> {

    public static getCategory(): string {
        return 'player';
    }

    public static getKeys(): string[] {
        return ['server_id'];
    }

    constructor(data: string[]) {
        super({
            serverId: ['string'],
            madadsa: []
        });

        this.set('serverId', data[0]);
    }

    public getServerId(): string {
        return this.get('serverId');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'sid': this.getServerId()
        };
    }

}
