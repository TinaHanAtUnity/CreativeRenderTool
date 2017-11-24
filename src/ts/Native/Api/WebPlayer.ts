import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export class WebPlayerApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'WebPlayer');
    }

    public setUrl(url: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setUrl', [url]);
    }

    public setData(data: string, mimeType: string, encoding: string): Promise<void>  {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setData', [data, mimeType, encoding]);
    }

    public setDataWithUrl(baseUrl: string, data: string, mimeType: string, encoding: string, historyUrl: string): Promise<void>  {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setDataWithUrl', [baseUrl, data, mimeType, encoding, historyUrl]);
    }

    public setSettings<T>(webSettings: T, webPlayerSettings: T): Promise<void>  {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setSettings', [webSettings, webPlayerSettings]);
    }

    public clearSettings(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'clearSettings');
    };
}