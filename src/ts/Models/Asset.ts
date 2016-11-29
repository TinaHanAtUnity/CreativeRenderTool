export class Asset {

    private readonly _url: string;
    private _cachedUrl: string | undefined;

    constructor(url: string) {
        this._url = url;
    }

    public getUrl(): string {
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

}
