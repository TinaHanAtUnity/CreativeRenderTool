import { Asset } from 'Models/Asset';
import { ISchema, Model } from 'Models/Model';

export interface ICampaign extends ISchema {
    id: [string, string[]];
    gamerId: [string, string[]];
    abGroup: [number, string[]];
    timeout: [number, string[]];
    willExpireAt: [number, string[]];
}

export abstract class Campaign<T extends ICampaign> extends Model<T> {
    // constructor(id: string, gamerId: string, abGroup: number, timeout?: number, store?: string) {
    constructor(data: T) {
        super(data);

        this.set('id', data.id[0]);
        this.set('gamerId', data.gamerId[0]);
        this.set('abGroup', data.abGroup[0]);
        this.set('timeout', typeof data.timeout[0] !== 'undefined' ? data.timeout[0] : 0);

        if(data.timeout[0]) {
            this.set('willExpireAt', Date.now() +  data.timeout[0] * 1000);
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

    public getTimeout(): number {
        return this.get('timeout');
    }

    public isExpired() {
        return this.get('willExpireAt') && Date.now() > this.get('willExpireAt');
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
