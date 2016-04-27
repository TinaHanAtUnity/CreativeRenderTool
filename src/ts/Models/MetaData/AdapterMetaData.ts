import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';
import { Model } from 'Models/Model';

export class AdapterMetaData extends Model {

    private static _cache: AdapterMetaData;

    private _name: string;
    private _version: string;

    public static exists(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.getKeys(StorageType.PUBLIC, 'adapter', false).then(keys => {
            return keys.length > 0;
        });
    }

    public static fetch(nativeBridge: NativeBridge, cache = true): Promise<AdapterMetaData> {
        if(cache && AdapterMetaData._cache) {
            return Promise.resolve(AdapterMetaData._cache);
        }
        return AdapterMetaData.exists(nativeBridge).then(exists => {
            if(!exists) {
                return Promise.resolve(undefined);
            }
            return Promise.all([
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'adapter.name.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'adapter.version.value').catch(() => undefined)
            ]).then(([name, version]) => {
                if(cache && !AdapterMetaData._cache) {
                    AdapterMetaData._cache = new AdapterMetaData(name, version);
                }
                if(cache) {
                    return AdapterMetaData._cache;
                }
                return new AdapterMetaData(name, version);
            });
        });
    }

    constructor(name: string, version: string) {
        super();
        this._name = name;
        this._version = version;
    }

    public getName(): string {
        return this._name;
    }

    public getVersion(): string {
        return this._version;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'adapterName': this._name,
            'adapterVersion': this._version
        };
    }

}
