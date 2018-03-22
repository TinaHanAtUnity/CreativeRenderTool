import { NativeBridge } from 'Native/NativeBridge';
import { ClientInfo } from 'Models/ClientInfo';
import { Request, INativeResponse } from 'Utilities/Request';
import { JsonParser } from 'Utilities/JsonParser';
import { StorageType } from 'Native/Api/Storage';
import { Cache } from 'Utilities/Cache';

export class ReinitManager {
    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _request: Request;
    private _cache: Cache;

    private _configJsonCheckTimestamp: number;
    private _minConfigJsonCheckInterval = 15 * 60 * 1000; // 15 minutes

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, request: Request, cache: Cache) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._request = request;
        this._cache = cache;

        this._configJsonCheckTimestamp = Date.now();
    }

    public reinitialize(): void {
        // save caching pause state in case of reinit
        if(this._cache.isPaused()) {
            Promise.all([this._nativeBridge.Storage.set(StorageType.PUBLIC, 'caching.pause.value', true), this._nativeBridge.Storage.write(StorageType.PUBLIC)]).then(() => {
                this._nativeBridge.Sdk.reinitialize();
            }).catch(() => {
                this._nativeBridge.Sdk.reinitialize();
            });
        } else {
            this._nativeBridge.Sdk.reinitialize();
        }
    }

    public shouldReinitialize(): Promise<boolean> {
        // development webview
        if(!this._clientInfo.getWebviewHash()) {
            return Promise.resolve(false);
        }

        // never check config.json too often
        if(Date.now() - this._configJsonCheckTimestamp <= this._minConfigJsonCheckInterval) {
            return Promise.resolve(false);
        }

        return this.getConfigJson().then(response => {
            this._configJsonCheckTimestamp = Date.now();
            const configJson = JsonParser.parse(response.response);
            return configJson.hash !== this._clientInfo.getWebviewHash();
        }).catch((error) => {
            return false;
        });
    }

    private getConfigJson(): Promise<INativeResponse> {
        return this._request.get(this._clientInfo.getConfigUrl() + '?ts=' + Date.now() + '&sdkVersion=' + this._clientInfo.getSdkVersion());
    }
}
