import { ICoreApi } from 'Core/ICore';
import { StorageError, StorageType } from 'Core/Native/Storage';

export interface IIAPInstrumentation {
    price: number;
    currency: string;
    productId: string;
    signature?: string;
    receiptPurchaseData?: string;
    ts: number;
}

export class AnalyticsStorage {
    private _core: ICoreApi;

    constructor(core: ICoreApi) {
        this._core = core;
    }

    public getUserId(): Promise<string> {
        return this.getValue<string>('analytics.userid').then(userId => {
            if(userId) {
                return userId;
            } else {
                return this._core.DeviceInfo.getUniqueEventId().then(id => {
                    return id.toLowerCase().replace(/-/g, '');
                });
            }
        });
    }

    public getSessionId(reinit: boolean): Promise<number> {
        if(reinit) {
            return this.getValue<number>('analytics.sessionid').then(sessionId => {
                if(sessionId) {
                    return sessionId;
                } else {
                    return this.getIntegerId();
                }
            }).catch(() => {
                return this.getIntegerId();
            });
        } else {
            return this.getIntegerId();
        }
    }

    public getAppVersion(): Promise<string | undefined> {
        return this.getValue<string>('analytics.appversion');
    }

    public getOsVersion(): Promise<string | undefined> {
        return this.getValue<string>('analytics.osversion');
    }

    public getIAPTransactions(): Promise<IIAPInstrumentation[]> {
        return this._core.Storage.get<IIAPInstrumentation[]>(StorageType.PUBLIC, 'iap.purchases').then(value => {
            this._core.Storage.delete(StorageType.PUBLIC, 'iap.purchases');
            this._core.Storage.write(StorageType.PUBLIC);
            return value;
        }).catch(([error]) => {
            switch (error) {
                case StorageError[StorageError.COULDNT_GET_VALUE]:
                    return [];

                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    return [];

                default:
                    throw new Error(error);
            }
        });
    }

    public setIds(userId: string, sessionId: number): void {
        this._core.Storage.set<string>(StorageType.PRIVATE, 'analytics.userid', userId);
        this._core.Storage.set<number>(StorageType.PRIVATE, 'analytics.sessionid', sessionId);
        this._core.Storage.write(StorageType.PRIVATE);
    }

    public setSessionId(sessionId: number): void {
        // session id is only valid for native process lifetime so no write necessary
        this._core.Storage.set<number>(StorageType.PRIVATE, 'analytics.sessionid', sessionId);
    }

    public setVersions(appVersion: string, osVersion: string): void {
        this._core.Storage.set<string>(StorageType.PRIVATE, 'analytics.appversion', appVersion);
        this._core.Storage.set<string>(StorageType.PRIVATE, 'analytics.osversion', osVersion);
        this._core.Storage.write(StorageType.PRIVATE);
    }

    public getIntegerId(): Promise<number> {
        return this._core.DeviceInfo.getUniqueEventId().then(id => {
            // parse hex based native id to a safe decimal integer
            return parseInt(id.replace(/-/g, '').substring(0, 12), 16);
        });
    }

    private getValue<T>(key: string): Promise<T | undefined> {
        return this._core.Storage.get(StorageType.PRIVATE, key).then(value => {
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
