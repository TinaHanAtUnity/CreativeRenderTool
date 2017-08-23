import { Asset } from 'Models/Assets/Asset';
import { ISchema, Model } from 'Models/Model';

export interface ICampaign {
    id: string;
    gamerId: string;
    abGroup: number;
    timeout: number;
    willExpireAt: number;
    adType: string | undefined;
    correlationId: string | undefined;
    creativeId: string | undefined;
    seatId: number | undefined;
    meta: string | undefined;
}

export abstract class Campaign<T extends ICampaign = ICampaign> extends Model<T> {
    public static Schema: ISchema<ICampaign> = {
        id: ['string'],
        gamerId: ['string'],
        abGroup: ['number'],
        timeout: ['number'],
        willExpireAt: ['number'],
        adType: ['string', 'undefined'],
        correlationId: ['string', 'undefined'],
        creativeId: ['string', 'undefined'],
        seatId: ['number', 'undefined'],
        meta: ['string', 'undefined']
    };

    constructor(name: string, schema: ISchema<T>) {
        super(name, schema);
    }

    public getId(): string {
        return this.get('id');
    }

    public getGamerId(): string {
        return this.get('gamerId');
    }

    public getAbGroup(): number {
        return this.get('abGroup');
    }

    public getTimeout(): number | undefined {
        return this.get('timeout');
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

    public isExpired(): boolean {
        const willExpireAt = this.get('willExpireAt');
        return willExpireAt !== undefined && Date.now() > willExpireAt;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this.getId(),
            'gamerId': this.getGamerId(),
            'abGroup': this.getAbGroup(),
            'timeout': this.getTimeout(),
            'willExpireAt': this.get('willExpireAt')
        };
    }

    public abstract getRequiredAssets(): Asset[];
    public abstract getOptionalAssets(): Asset[];

}
