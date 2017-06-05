import { ISchema, Model } from 'Models/Model';

export interface IAsset {
    url: string;
    cachedUrl: string | undefined;
    fileId: string | undefined;
}

export abstract class Asset<T extends IAsset = IAsset> extends Model<T> {
    public static Schema: ISchema<IAsset> = {
        url: ['string'],
        cachedUrl: ['string', 'undefined'],
        fileId: ['string', 'undefined']
    };

    constructor(name: string, schema: ISchema<T>) {
        super(name, schema);
    }

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

    public setCachedUrl(url: string) {
        this.set('cachedUrl', url);
    }

    public setFileId(fileId: string) {
        this.set('fileId', fileId);
    }

    public getFileId(): string | undefined {
        return this.get('fileId');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'url': this.getOriginalUrl(),
            'cachedUrl': this.getCachedUrl(),
            'fileId': this.getFileId()
        };
    }
}
