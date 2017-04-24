import { Asset } from 'Models/Asset';
import { Model } from 'Models/Model';

export abstract class Campaign extends Model {

    private _id: string;
    private _gamerId: string;
    private _abGroup: number;
    private _timeout: number;
    private _willExpireAt: number;

    constructor(id: string, gamerId: string, abGroup: number, timeout?: number, store?: string) {
        super();

        this._id = id;
        this._gamerId = gamerId;
        this._abGroup = abGroup;
        this._timeout = typeof timeout !== 'undefined' ? timeout : 0;
        if(timeout) {
            this._willExpireAt = Date.now() + timeout * 1000;
        }
    }

    public getId(): string {
        return this._id;
    }

    public getGamerId(): string {
        return this._gamerId;
    }

    public getAbGroup(): number {
        return this._abGroup;
    }

    public getTimeout(): number {
        return this._timeout;
    }

    public isExpired() {
        return this._willExpireAt && Date.now() > this._willExpireAt;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this._id,
            'gamerId': this._gamerId,
            'abGroup': this._abGroup,
            'timeout': this._timeout,
            'willExpireAt': this._willExpireAt
        };
    }

    public abstract getRequiredAssets(): Asset[];
    public abstract getOptionalAssets(): Asset[];

}
