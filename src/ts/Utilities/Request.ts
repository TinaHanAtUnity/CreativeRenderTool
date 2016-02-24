import { NativeBridge } from 'NativeBridge';

const enum RequestStatus {
    COMPLETE,
    FAILED
}

export class Request {

    private _nativeBridge: NativeBridge;

    private _urlCallbacks: Object = {};

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe('URL_COMPLETE', this.onComplete.bind(this));
        this._nativeBridge.subscribe('URL_FAILED', this.onFailed.bind(this));
    }

    public get(url: string, headers?: [string, string][]): Promise<any[]> {
        if(typeof headers === 'undefined') {
            headers = [];
        }
        let promise = this.registerCallback(url);
        this._nativeBridge.invoke('Url', 'get', [url, headers]);
        return promise;
    }

    public post(url: string, data?: {}, headers?: [string, string][]): Promise<any[]> {
        if(typeof data === 'undefined') {
            data = {};
        }
        if(typeof headers === 'undefined') {
            headers = [];
        }
        headers.push(['Content-Type', 'application/json']);
        let promise = this.registerCallback(url);
        this._nativeBridge.invoke('Url', 'post', [url, data, headers]);
        return promise;
    }

    private registerCallback(url): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            let callbackObject = {};
            callbackObject[RequestStatus.COMPLETE] = resolve;
            callbackObject[RequestStatus.FAILED] = reject;

            let callbackList: Function[] = this._urlCallbacks[url];
            if(callbackList) {
                this._urlCallbacks[url].push(callbackObject);
            } else {
                this._urlCallbacks[url] = [callbackObject];
            }
        });
    }

    private onComplete(url: string, response: string): void {
        let urlCallbacks: Function[] = this._urlCallbacks[url];
        if(urlCallbacks) {
            urlCallbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.COMPLETE]([response]);
            });
            delete this._urlCallbacks[url];
        }
    }

    private onFailed(url: string, error: string): void {
        let urlCallbacks: Function[] = this._urlCallbacks[url];
        if(urlCallbacks) {
            urlCallbacks.forEach((callbackObject: Object) => {
                callbackObject[RequestStatus.FAILED]([error]);
            });
            delete this._urlCallbacks[url];
        }
    }

}
