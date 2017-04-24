import { Model } from 'Models/Model';

export class Session extends Model {
    public startSent: boolean = false;
    public firstQuartileSent: boolean = false;
    public midpointSent: boolean = false;
    public thirdQuartileSent: boolean = false;
    public viewSent: boolean = false;
    public skipSent: boolean = false;

    public impressionSent: boolean = false;
    public vastCompleteSent: boolean = false;

    private _id: string;

    constructor(id: string) {
        super();
        this._id = id;
    }

    public getId(): string {
        return this._id;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this._id
        };
    }
}
