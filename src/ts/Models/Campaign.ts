import { Asset } from 'Models/Asset';
import { ISchema, Model } from 'Models/Model';

export interface ICampaign extends ISchema {
    id: [string, string[]];
    gamerId: [string, string[]];
    abGroup: [number, string[]];
    timeout: [number | undefined, string[]];
    willExpireAt: [number | undefined, string[]];
}

export abstract class Campaign<T extends ICampaign> extends Model<T> {
    constructor(data: T) {
        super(data);

        this.set('id', data.id[0]);
        this.set('gamerId', data.gamerId[0]);
        this.set('abGroup', data.abGroup[0]);
        this.set('timeout', typeof data.timeout[0] !== 'undefined' ? data.timeout[0] : 0);

        const timeout = data.timeout[0];
        if(timeout) {
            this.set('willExpireAt', Date.now() + timeout * 1000);
        }
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
