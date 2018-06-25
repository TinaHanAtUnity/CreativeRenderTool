import { NativeBridge } from 'Native/NativeBridge';
import { Observable5, Observable3 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';
import { Platform } from 'Constants/Platform';
import { AndroidRequestApi } from 'Native/Api/AndroidRequestApi';

export enum RequestEvent {
    COMPLETE,
    FAILED
}

export class RequestApi extends NativeApi {
    public Android: AndroidRequestApi;

    public readonly onComplete = new Observable5<string, string, string, number, Array<[string, string]>>();
    public readonly onFailed = new Observable3<string, string, string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Request');

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidRequestApi(nativeBridge);
        }
    }

    public get(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._apiClass, 'get', [id, url, headers, connectTimeout]);
        } else {
            return this._nativeBridge.invoke<string>(this._apiClass, 'get', [id, url, headers, connectTimeout, readTimeout]);
        }
    }

    public post(id: string, url: string, requestBody: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._apiClass, 'post', [id, url, requestBody, headers, connectTimeout]);
        } else {
            return this._nativeBridge.invoke<string>(this._apiClass, 'post', [id, url, requestBody, headers, connectTimeout, readTimeout]);
        }
    }

    public head(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
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

    public setConcurrentRequestCount(count: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setConcurrentRequestCount', [count]);
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
