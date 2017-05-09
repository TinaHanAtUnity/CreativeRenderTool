import { Model } from 'Models/Model';

interface ISession {
    id: string;
}

export class Session extends Model<ISession> {
    public startSent: boolean = false;
    public firstQuartileSent: boolean = false;
    public midpointSent: boolean = false;
    public thirdQuartileSent: boolean = false;
    public viewSent: boolean = false;
    public skipSent: boolean = false;

    public impressionSent: boolean = false;
    public vastCompleteSent: boolean = false;

    constructor(id: string) {
        super({
            id: ['string']
        });

        this.set('id', id);
    }

    public getId(): string {
        return this.get('id');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this.getId()
        };
    }
}
