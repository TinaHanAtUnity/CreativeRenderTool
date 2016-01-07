export class GamerInfo {

    private _gamerId: string;
    private _abGroup: number;

    constructor(gamerId: string, abGroup: number) {
        this._gamerId = gamerId;
        this._abGroup = abGroup;
    }

    public getGamerId(): string {
        return this._gamerId;
    }

    public getAbGroup(): number {
        return this._abGroup;
    }

}