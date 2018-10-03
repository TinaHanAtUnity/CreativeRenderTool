import { Platform } from 'Core/Constants/Platform';
import { AndroidRequestApi } from 'Core/Native/Android/Request';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable3, Observable5 } from 'Core/Utilities/Observable';

export enum RequestEvent {
    COMPLETE,
    FAILED
}

export class RequestApi extends NativeApi {
    public readonly Android?: AndroidRequestApi;

    public readonly onComplete = new Observable5<string, string, string, number, Array<[string, string]>>();
    public readonly onFailed = new Observable3<string, string, string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Request', ApiPackage.CORE);

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidRequestApi(nativeBridge);
        }
    }

    public get(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'get', [id, url, headers, connectTimeout]);
        } else {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'get', [id, url, headers, connectTimeout, readTimeout]);
        }
    }

    public post(id: string, url: string, requestBody: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'post', [id, url, requestBody, headers, connectTimeout]);
        } else {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'post', [id, url, requestBody, headers, connectTimeout, readTimeout]);
        }
    }

    public head(id: string, url: string, headers: Array<[string, string]>, connectTimeout: number, readTimeout: number): Promise<string> {
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'head', [id, url, headers, connectTimeout]);
        } else {
            return this._nativeBridge.invoke<string>(this._fullApiClassName, 'head', [id, url, headers, connectTimeout, readTimeout]);
        }
    }

    public setConnectTimeout(connectTimeout: number): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'setConnectTimeout', [connectTimeout]);
    }

    public getConnectTimeout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getConnectTimeout');
    }

    public setReadTimeout(readTimeout: number): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'setReadTimeout', [readTimeout]);
    }

    public getReadTimeout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getReadTimeout');
    }

    public setConcurrentRequestCount(count: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setConcurrentRequestCount', [count]);
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
