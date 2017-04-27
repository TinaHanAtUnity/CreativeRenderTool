import { Asset } from 'Models/Assets/Asset';
import { ISchema, Model } from 'Models/Model';

export interface ICampaign {
    id: string;
    gamerId: string;
    abGroup: number;
    timeout: number;
    willExpireAt: number;
}

export abstract class Campaign<T extends ICampaign = ICampaign> extends Model<T> {
    public static Schema: {
        id: ['string'],
        gamerId: ['string'],
        abGroup: ['number'],
        timeout: ['number'],
        willExpireAt: ['number'],
    };
    constructor(schema: ISchema<T>) {
        super(schema);
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
