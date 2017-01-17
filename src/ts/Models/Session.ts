export class Session {
    public startSent: boolean = false;
    public firstQuartileSent: boolean = false;
    public midpointSent: boolean = false;
    public thirdQuartileSent: boolean = false;
    public viewSent: boolean = false;
    public skipSent: boolean = false;
    public videoClickThroughSent: boolean = false;
    public companionClickThroughSent: boolean = false;

    public impressionSent: boolean = false;
    public vastCompleteSent: boolean = false;

    private _id: string;

    constructor(id: string) {
        this._id = id;
    }

    public getId(): string {
        return this._id;
    }

}
