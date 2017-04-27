import { ISchema, Model } from 'Models/Model';

export interface IAsset {
    url: string;
    cachedUrl: string | undefined;
    fileId: string | undefined;
}

export abstract class Asset<T extends IAsset = IAsset> extends Model<T> {
    public static Schema: {
        url: ['string'],
        cachedUrl: ['string', 'undefined'],
        fileId: ['string', 'undefined']
    };

    constructor(schema: ISchema<T>) {
        super(schema);
    }

    public getUrl(): string {
        return this.getOriginalUrl();
    }

    public getOriginalUrl() {
        return this.get('url');
    }

    public isCached() {
        const cachedUrl = this.getCachedUrl();
        return typeof cachedUrl !== 'undefined';
    }

    public getCachedUrl() {
        return this.get('cachedUrl');
    }

    public setCachedUrl(url: string) {
        this.set('cachedUrl', url);
    }

    public setFileId(fileId: string) {
        this.set('fileId', fileId);
    }

    public getFileId() {
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
