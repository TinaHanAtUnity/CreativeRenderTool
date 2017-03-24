export class Asset {

    private readonly _url: string;
    private _cachedUrl: string | undefined;
    private _fileId: string | undefined;

    constructor(url: string) {
        this._url = url;
    }

    public getUrl(): string {
        if(typeof this._cachedUrl !== 'undefined') {
            return this._cachedUrl;
        }
        return this._url;
    }

    public getOriginalUrl() {
        return this._url;
    }

    public isCached() {
        return typeof this._cachedUrl !== 'undefined';
    }

    public getCachedUrl() {
        return this._cachedUrl;
    }

    public setCachedUrl(url: string) {
        this._cachedUrl = url;
    }

    public setFileId(fileId: string) {
        this._fileId = fileId;
    }

    public getFileId() {
        return this._fileId;
    }

}
