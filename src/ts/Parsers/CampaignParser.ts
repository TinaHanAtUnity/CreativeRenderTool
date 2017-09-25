import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';

export abstract class CampaignParser {
    private _auctionResponse: AuctionResponse;
    private _session: Session;
    private _gamerId: string;
    private _abGroup: number;

    constructor(auctionResponse: AuctionResponse, gamerId: string, abGroup: number) {
        this._auctionResponse = auctionResponse;
        this._gamerId = gamerId;
        this._abGroup = abGroup;
    }

    public abstract parse(nativeBridge: NativeBridge, request: Request): Promise<Campaign>;

    public setSession(session: Session) {
        this._session = session;
    }

    protected getAuctionResponse(): AuctionResponse {
        return this._auctionResponse;
    }

    protected getSession(): Session {
        return this._session;
    }

    protected getGamerId(): string {
        return this._gamerId;
    }

    protected getAbGroup(): number {
        return this._abGroup;
    }

    protected getProgrammaticCampaignId(nativeBridge: NativeBridge): string {
        switch (nativeBridge.getPlatform()) {
            case Platform.IOS:
                return '00005472656d6f7220694f53';
            case Platform.ANDROID:
                return '005472656d6f7220416e6472';
            default:
                return 'UNKNOWN';
        }
    }
}
