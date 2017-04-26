import { ISchema, Model } from 'Models/Model';

interface IAsset extends ISchema {
    url: [string, string[]];
    cachedUrl: [string | undefined, string[]];
    fileId: [string | undefined, string[]];
}

export class Asset extends Model<IAsset> {
    constructor(url: string) {
        super({
            url: ['', ['string']],
            cachedUrl: [undefined, ['string', 'undefined']],
            fileId: [undefined, ['string', 'undefined']]
        });

        this.set('url', url);
    }

    public getUrl(): string {
        const cachedUrl = this.getCachedUrl();
        if(typeof cachedUrl !== 'undefined') {
            return cachedUrl;
        }
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
