import { Model } from 'Models/Model';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class FrameworkMetaData extends Model {

    private static _cache: FrameworkMetaData;

    private _name: string;
    private _version: string;

    public static exists(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.getKeys(StorageType.PUBLIC, 'framework', false).then(keys => {
            return keys.length > 0;
        });
    }

    public static fetch(nativeBridge: NativeBridge, cache = true): Promise<FrameworkMetaData> {
        if(cache && FrameworkMetaData._cache) {
            return Promise.resolve(FrameworkMetaData._cache);
        }
        return FrameworkMetaData.exists(nativeBridge).then(exists => {
            if(!exists) {
                return Promise.resolve(undefined);
            }
            return Promise.all([
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'framework.name.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'framework.version.value').catch(() => undefined)
            ]).then(([name, version]) => {
                if(cache && !FrameworkMetaData._cache) {
                    FrameworkMetaData._cache = new FrameworkMetaData(name, version);
                }
                if(cache) {
                    return FrameworkMetaData._cache;
                }
                return new FrameworkMetaData(name, version);
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
            'frameworkName': this._name,
            'frameworkVersion': this._version
        };
    }

}
