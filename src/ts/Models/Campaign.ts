import { Asset } from 'Models/Asset';

export abstract class Campaign {

    private _id: string;
    private _gamerId: string;
    private _abGroup: number;
    private _timeout: number;
    private _willExpireAt: number;

    constructor(id: string, gamerId: string, abGroup: number, timeout?: number) {
        this._id = id;
        this._gamerId = gamerId;
        this._abGroup = abGroup;
        this._timeout = typeof timeout !== 'undefined' ? timeout : 0;
        if(this._timeout) {
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

    public abstract getRequiredAssets(): Asset[];
    public abstract getOptionalAssets(): Asset[];

}
