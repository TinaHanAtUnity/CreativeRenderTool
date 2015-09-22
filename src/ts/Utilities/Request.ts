import NativeBridge from 'NativeBridge';

export const enum RequestStatus {
    COMPLETE,
    FAILED
}

export default class Request {

    private _nativeBridge: NativeBridge;

    private _urlCallbacks: Object = {};

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe({
            'URL_COMPLETE': this.onComplete.bind(this),
            'URL_FAILED': this.onFailed.bind(this)
        });
    }

    public get(url: string, complete: (url: string, response: string) => void, error: (url: string, error: string) => void): void {
        this._urlCallbacks[url] = {};
        this._urlCallbacks[url][RequestStatus.COMPLETE] = complete;
        this._urlCallbacks[url][RequestStatus.FAILED] = error;
        this._nativeBridge.invoke('Url', 'get', [url, []]);
    }

    private onComplete(url: string, response: string): void {
        let callback: Function = this._urlCallbacks[url][RequestStatus.COMPLETE];
        callback(url, response);
        delete this._urlCallbacks[url];
    }

    private onFailed(url: string, error: string): void {
        let callback: Function = this._urlCallbacks[url][RequestStatus.FAILED];
        callback(url, error);
        delete this._urlCallbacks[url];
    }

}
