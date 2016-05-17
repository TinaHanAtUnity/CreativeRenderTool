import { Model } from 'Models/Model';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

export class MediationMetaData extends Model {

    private static _cache: MediationMetaData;

    private _name: string;
    private _version: string;
    private _ordinal: number;

    public static exists(nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.getKeys(StorageType.PUBLIC, 'mediation', false).then(keys => {
            return keys.length > 0;
        });
    }

    public static fetch(nativeBridge: NativeBridge, cache = true): Promise<MediationMetaData> {
        if(cache && MediationMetaData._cache) {
            return Promise.resolve(MediationMetaData._cache);
        }
        return MediationMetaData.exists(nativeBridge).then(exists => {
            if(!exists) {
                return Promise.resolve(undefined);
            }
            return Promise.all([
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'mediation.name.value').catch(() => undefined),
                nativeBridge.Storage.get<string>(StorageType.PUBLIC, 'mediation.version.value').catch(() => undefined),
                nativeBridge.Storage.get<number>(StorageType.PUBLIC, 'mediation.ordinal.value').catch(() => undefined)
            ]).then(([name, version, ordinal]) => {
                if(cache && !MediationMetaData._cache) {
                    MediationMetaData._cache = new MediationMetaData(name, version, ordinal);
                }
                if(cache) {
                    return MediationMetaData._cache;
                }
                return new MediationMetaData(name, version, ordinal);
            });
        });
    }

    constructor(name: string, version: string, ordinal: number) {
        super();
        this._name = name;
        this._version = version;
        this._ordinal = ordinal;
    }

    public getName(): string {
        return this._name;
    }

    public getVersion(): string {
        return this._version;
    }

    public getOrdinal(): number {
        return this._ordinal;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'mediationName': this._name,
            'mediationVersion': this._version,
            'mediationOrdinal': this._ordinal
        };
    }

}
