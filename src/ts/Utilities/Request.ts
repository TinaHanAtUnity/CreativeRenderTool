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
        this._nativeBridge.subscribe({
            'URL_COMPLETE': this.onComplete.bind(this),
            'URL_FAILED': this.onFailed.bind(this)
        });
    }

    public get(url: string): Promise<any[]> {
        let promise = this.registerCallback(url);
        this._nativeBridge.invoke('Url', 'get', [url, []]);
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
                callbackObject[RequestStatus.COMPLETE]([error]);
            });
            delete this._urlCallbacks[url];
        }
    }

}
