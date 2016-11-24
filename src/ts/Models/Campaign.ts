export abstract class Campaign {

    private _id: string;
    private _gamerId: string;
    private _abGroup: number;
    private _timeout: number;

    constructor(id: string, gamerId: string, abGroup: number, timeout?: number) {
        this._id = id;
        this._gamerId = gamerId;
        this._abGroup = abGroup;
        this._timeout = typeof timeout !== 'undefined' ? timeout : 0;
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
        return this._timeout !== 0 && Date.now() > this._timeout;
    }

}
