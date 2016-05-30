import { NativeBridge } from 'Native/NativeBridge';
import { Observable5, Observable3 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';
import { Platform } from 'Constants/Platform';

export enum RequestEvent {
    COMPLETE,
    FAILED
}

export class RequestApi extends NativeApi {

    public onComplete: Observable5<string, string, string, number, [string, string][]> = new Observable5();
    public onFailed: Observable3<string, string, string> = new Observable3();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Request');
    }

    public get(id: string, url: string, headers: [string, string][], connectTimeout: number, readTimeout: number): Promise<string> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._apiClass, 'get', [id, url, headers, connectTimeout]);
        } else {
            return this._nativeBridge.invoke<string>(this._apiClass, 'get', [id, url, headers, connectTimeout, readTimeout]);
        }
    }

    public post(id: string, url: string, requestBody: string, headers: [string, string][], connectTimeout: number, readTimeout: number): Promise<string> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._apiClass, 'post', [id, url, requestBody, headers, connectTimeout]);
        } else {
            return this._nativeBridge.invoke<string>(this._apiClass, 'post', [id, url, requestBody, headers, connectTimeout, readTimeout]);
        }
    }

    public head(id: string, url: string, headers: [string, string][], connectTimeout: number, readTimeout: number): Promise<string> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._apiClass, 'head', [id, url, headers, connectTimeout]);
        } else {
            return this._nativeBridge.invoke<string>(this._apiClass, 'head', [id, url, headers, connectTimeout, readTimeout]);
        }
    }

    public setConnectTimeout(connectTimeout: number): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'setConnectTimeout', [connectTimeout]);
    }

    public getConnectTimeout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getConnectTimeout');
    }

    public setReadTimeout(readTimeout: number): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'setReadTimeout', [readTimeout]);
    }

    public getReadTimeout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getReadTimeout');
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case RequestEvent[RequestEvent.COMPLETE]:
                this.onComplete.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
                break;

            case RequestEvent[RequestEvent.FAILED]:
                this.onFailed.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }

}
