import { NativeBridge } from 'Native/NativeBridge';
import { StorageType, StorageError } from 'Native/Api/Storage';

export class AnalyticsStorage {
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public getUserId(): Promise<string> {
        return this.getValue<string>('analytics.userid').then(userId => {
            if(userId) {
                return userId;
            } else {
                return this._nativeBridge.DeviceInfo.getUniqueEventId();
            }
        });
    }

    public getSessionId(reinit: boolean): Promise<number> {
        if(reinit) {
            return this.getValue<number>('analytics.sessionid');
        } else {
            return this._nativeBridge.DeviceInfo.getUniqueEventId().then(id => {
                // session ids are decimal numbers in analytics so parse native hex string format to a decimal number
                return parseInt(id.replace(/-/g, ''), 16);
            });
        }
    }

    public getAppVersion(): Promise<string> {
        return this.getValue<string>('analytics.appversion');
    }

    public getOsVersion(): Promise<string> {
        return this.getValue<string>('analytics.osversion');
    }

    public setIds(userId: string, sessionId: number): void {
        this._nativeBridge.Storage.set<string>(StorageType.PRIVATE, 'analytics.userid', userId);
        this._nativeBridge.Storage.set<number>(StorageType.PRIVATE, 'analytics.sessionId', sessionId);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    public setVersions(appVersion: string, osVersion: string): void {
        this._nativeBridge.Storage.set<string>(StorageType.PRIVATE, 'analytics.appversion', appVersion);
        this._nativeBridge.Storage.set<string>(StorageType.PRIVATE, 'analytics.osversion', osVersion);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    private getValue<T>(key: string): Promise<T | undefined> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, key).then(value => {
            return <T>value;
        }).catch(([error]) => {
            switch (error) {
                case StorageError[StorageError.COULDNT_GET_VALUE]:
                    return undefined;

                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    return undefined;

                default:
                    throw new Error(error);
            }
        });
    }
}
