import { Asset } from 'Ads/Models/Assets/Asset';
import { Session } from 'Ads/Models/Session';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ISchema, Model } from 'Core/Models/Model';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';

export interface ICampaignTrackingUrls {
    [key: string]: string[];
}

export interface IRawCampaign {
    id: string;
    willExpireAt?: number;
    contentType: string;
    adType?: string;
    correlationId?: string;
    creativeId?: string;
    seatId?: number;
    meta?: string;
    mediaId: string;
}

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
    trackingUrls: ICampaignTrackingUrls;
    isLoadEnabled: boolean;
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
        mediaId: ['string'],
        trackingUrls: ['object'],
        isLoadEnabled: ['boolean']
    };

    private _uniqueId: string;

    constructor(name: string, schema: ISchema<T>, data: T) {
        super(name, schema, data);

        this._uniqueId = JaegerUtilities.uuidv4();
    }

    public getId(): string {
        return this.get('id');
    }

    public getSession(): Session {
        return this.get('session');
    }

    public getAdType(): string | undefined {
        return this.get('adType');
    }

    public getContentType(): string {
        return this.get('contentType');
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

    public setIsLoadEnabled(isLoadEnabled: boolean) {
        this.set('isLoadEnabled', isLoadEnabled);
    }

    public isLoadEnabled(): boolean {
        return this.get('isLoadEnabled');
    }

    public setMediaId(id: string) {
        this.set('mediaId', id);
    }

    public getMediaId(): string {
        return this.get('mediaId');
    }

    public setTrackingUrls(trackingUrls: ICampaignTrackingUrls) {
        this.set('trackingUrls', trackingUrls);
    }

    public getTrackingUrls(): ICampaignTrackingUrls {
        return this.get('trackingUrls');
    }

    public getTrackingUrlsForEvent(event: TrackingEvent): string[] {
        const urls = this.getTrackingUrls();
        if (urls) {
            return urls[event] || [];
        }
        return [];
    }

    public getUniqueId(): string {
        return this._uniqueId;
    }

    public getDTO(): { [key: string]: unknown } {
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
