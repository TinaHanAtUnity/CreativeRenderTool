export class Session {

    private _id: string;

    constructor(id: string) {
        this._id = id;
    }

    public getId(): string {
        return this._id;
    }

}