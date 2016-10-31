import { Model } from 'Models/Model';

export class PlayerMetaData extends Model {

    public static getCategory(): string {
        return 'player';
    }

    public static getKeys(): string[] {
        return ['server_id'];
    }

    private _serverId: string;

    constructor(data: string[]) {
        super();
        this._serverId = data[0];
    }

    public getServerId(): string {
        return this._serverId;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'sid': this._serverId
        };
    }

}
