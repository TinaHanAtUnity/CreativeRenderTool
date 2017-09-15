import { Asset } from 'Models/Assets/Asset';
import { ISchema, Model } from 'Models/Model';
import { Session } from 'Models/Session';

export interface ICampaign {
    id: string;
    gamerId: string;
    abGroup: number;
    willExpireAt: number | undefined;
    adType: string | undefined;
    correlationId: string | undefined;
    creativeId: string | undefined;
    seatId: number | undefined;
    meta: string | undefined;
    session: Session;
}

export abstract class Campaign<T extends ICampaign = ICampaign> extends Model<T> {
    public static Schema: ISchema<ICampaign> = {
        id: ['string'],
        gamerId: ['string'],
        abGroup: ['number'],
        willExpireAt: ['number', 'undefined'],
        adType: ['string', 'undefined'],
        correlationId: ['string', 'undefined'],
        creativeId: ['string', 'undefined'],
        seatId: ['number', 'undefined'],
        meta: ['string', 'undefined'],
        session: ['object']
    };

    constructor(name: string, schema: ISchema<T>) {
        super(name, schema);
    }

    public getId(): string {
        return this.get('id');
    }

    public getSession(): Session {
        return this.get('session');
    }

    public getGamerId(): string {
        return this.get('gamerId');
    }

    public getAbGroup(): number {
        return this.get('abGroup');
    }

    public getAdType(): string | undefined {
        return this.get('adType');
    }

    public getCorrelationId(): string | undefined {
        return this.get('correlationId');
    }

    public getCreativeId(): string | undefined {
        return this.get('creativeId');
    }

    public getSeatId(): number | undefined {
        return this.get('seatId');
    }

    public getMeta(): string | undefined {
        return this.get('meta');
    }

    public getWillExpireAt(): number | undefined {
        return this.get('willExpireAt');
    }

    public isExpired(): boolean {
        const willExpireAt = this.get('willExpireAt');
        return willExpireAt !== undefined && Date.now() > willExpireAt;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this.getId(),
            'gamerId': this.getGamerId(),
            'abGroup': this.getAbGroup(),
            'willExpireAt': this.getWillExpireAt()
        };
    }

    public abstract getRequiredAssets(): Asset[];
    public abstract getOptionalAssets(): Asset[];

}
