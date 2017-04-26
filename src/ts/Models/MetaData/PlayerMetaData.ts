import { Model } from 'Models/Model';

interface IPlayerMetaData {
    serverId: string;
}

export class PlayerMetaData extends Model<IPlayerMetaData> {

    public static getCategory(): string {
        return 'player';
    }

    public static getKeys(): string[] {
        return ['server_id'];
    }

    constructor(data: string[]) {
        super({
            serverId: ['string'],
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
