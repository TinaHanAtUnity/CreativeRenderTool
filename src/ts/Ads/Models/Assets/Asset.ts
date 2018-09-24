import { Session } from 'Ads/Models/Session';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ISchema, Model } from 'Core/Models/Model';

export interface IAsset {
    url: string;
    cachedUrl: string | undefined;
    fileId: string | undefined;
    session: Session;
    creativeId: string | undefined;
}

export abstract class Asset<T extends IAsset = IAsset> extends Model<T> {
    public static Schema: ISchema<IAsset> = {
        url: ['string'],
        cachedUrl: ['string', 'undefined'],
        fileId: ['string', 'undefined'],
        session: ['object'],
        creativeId: ['string', 'undefined']
    };

    constructor(name: string, session: Session, schema: ISchema<T>) {
        super(name, schema);
        this.set('session', session);
    }

    public abstract getDescription(): string;

    public getUrl(): string {
        const cachedUrl = this.getCachedUrl();
        if (cachedUrl) {
            return cachedUrl;
        }

        return this.getOriginalUrl();
    }

    public getOriginalUrl(): string {
        return this.get('url');
    }

    public isCached(): boolean {
        const cachedUrl = this.getCachedUrl();
        return typeof cachedUrl !== 'undefined';
    }

    public getCachedUrl(): string | undefined {
        return this.get('cachedUrl');
    }

    public setCachedUrl(url: string | undefined) {
        this.set('cachedUrl', url);
    }

    public setFileId(fileId: string) {
        this.set('fileId', fileId);
    }

    public getFileId(): string | undefined {
        return this.get('fileId');
    }

    public getSession(): Session {
        return this.get('session');
    }

    public getCreativeId(): string | undefined {
        return this.get('creativeId');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'url': this.getOriginalUrl(),
            'cachedUrl': this.getCachedUrl(),
            'fileId': this.getFileId()
        };
    }

    protected handleError(error: WebViewError) {
        SessionDiagnostics.trigger('set_model_value_failed', error, this.getSession());
        throw error;
    }
}
