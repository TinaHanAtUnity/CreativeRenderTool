import { Asset } from 'Ads/Models/Assets/Asset';
import { Session } from 'Ads/Models/Session';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ISchema, Model } from 'Core/Models/Model';

export interface ICampaign {
    id: string;
    willExpireAt: number | undefined;
    contentType: string;
    adType: string | undefined;
    correlationId: string | undefined;
    creativeId: string | undefined;
    seatId: number | undefined;
    meta: string | undefined;
    session: Session;
    mediaId: string;
}

export abstract class Campaign<T extends ICampaign = ICampaign> extends Model<T> {
    public static Schema: ISchema<ICampaign> = {
        id: ['string'],
        willExpireAt: ['number', 'undefined'],
        contentType: ['string'],
        adType: ['string', 'undefined'],
        correlationId: ['string', 'undefined'],
        creativeId: ['string', 'undefined'],
        seatId: ['number', 'undefined'],
        meta: ['string', 'undefined'],
        session: ['object'],
        mediaId: ['string']
    };

    constructor(name: string, schema: ISchema<T>, data: T) {
        super(name, schema, data);
    }

    public getId(): string {
        return this.get('id');
    }

    public getSession(): Session {
        return this.get('session');
    }

    public getContentType(): string {
        return this.get('contentType');
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

    public setMediaId(id: string) {
        this.set('mediaId', id);
    }

    public getMediaId(): string {
        return this.get('mediaId');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this.getId(),
            'willExpireAt': this.getWillExpireAt(),
            'mediaId': this.getMediaId()
        };
    }

    public abstract getRequiredAssets(): Asset[];
    public abstract getOptionalAssets(): Asset[];
    public abstract isConnectionNeeded(): boolean;

    protected handleError(error: WebViewError) {
        SessionDiagnostics.trigger('set_model_value_failed', error, this.getSession());
        throw error;
    }

}
