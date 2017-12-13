import { ISchema, Model } from 'Models/Model';
import { Session } from 'Models/Session';
import { WebViewError } from "../../Errors/WebViewError";
import { Diagnostics } from "../../Utilities/Diagnostics";

export interface IAsset {
    url: string;
    cachedUrl: string | undefined;
    fileId: string | undefined;
    session: Session;
}

export abstract class Asset<T extends IAsset = IAsset> extends Model<T> {
    public static Schema: ISchema<IAsset> = {
        url: ['string'],
        cachedUrl: ['string', 'undefined'],
        fileId: ['string', 'undefined'],
        session: ['object']
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

    public getDTO(): { [key: string]: any } {
        return {
            'url': this.getOriginalUrl(),
            'cachedUrl': this.getCachedUrl(),
            'fileId': this.getFileId()
        };
    }

    protected handleError(error: WebViewError) {
        Diagnostics.trigger('set_model_value_failed', error, this.getSession());
        throw error;
    }
}
