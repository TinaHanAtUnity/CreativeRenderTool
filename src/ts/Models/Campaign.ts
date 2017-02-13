import { Asset } from 'Models/Asset';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI,
    NO_STORE
}

export abstract class Campaign {

    private _id: string;
    private _gamerId: string;
    private _abGroup: number;
    private _timeout: number;
    private _willExpireAt: number;
    private _store: StoreName;

    constructor(id: string, gamerId: string, abGroup: number, timeout?: number, store?: string) {
        this._id = id;
        this._gamerId = gamerId;
        this._abGroup = abGroup;
        this._timeout = typeof timeout !== 'undefined' ? timeout : 0;
        if(this._timeout) {
            this._willExpireAt = Date.now() + timeout * 1000;
        }
        const campaignStore = typeof store !== 'undefined' ? store : 'brand';
        switch(campaignStore) {
            case 'apple': {
                this._store = StoreName.APPLE;
                break;
            }
            case 'google': {
                this._store = StoreName.GOOGLE;
                break;
            }
            case 'xiaomi': {
                this._store = StoreName.XIAOMI;
                break;
            }
            case 'brand': {
                this._store = StoreName.NO_STORE;
                break;
            }
            default: {
                throw new Error('Unknown store value "' + store + '"');
            }
        }
    }

    public getStore(): StoreName {
        return this._store;
    }

    public getId(): string {
        return this._id;
    }

    public getGamerId(): string {
        return this._gamerId;
    }

    public getAbGroup(): number {
        return this._abGroup;
    }

    public getTimeout(): number {
        return this._timeout;
    }

    public isExpired() {
        return this._willExpireAt && Date.now() > this._willExpireAt;
    }

    public abstract getRequiredAssets(): Asset[];
    public abstract getOptionalAssets(): Asset[];

}
