import { Model } from 'Models/Model';

export class PlayerMetaData extends Model {

    private _serverId: string;

    public static getCategory(): string {
        return 'player';
    }

    public static getKeys(): string[] {
        return ['server_id.value'];
    }

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
