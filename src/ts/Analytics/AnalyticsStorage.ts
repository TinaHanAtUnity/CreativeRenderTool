import { NativeBridge } from 'Common/Native/NativeBridge';
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
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public getUserId(): Promise<string> {
        return this.getValue<string>('analytics.userid').then(userId => {
            if(userId) {
                return userId;
            } else {
                return this._nativeBridge.DeviceInfo.getUniqueEventId().then(id => {
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
        return this._nativeBridge.Storage.get<IIAPInstrumentation[]>(StorageType.PUBLIC, 'iap.purchases').then(value => {
            this._nativeBridge.Storage.delete(StorageType.PUBLIC, 'iap.purchases');
            this._nativeBridge.Storage.write(StorageType.PUBLIC);
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
        this._nativeBridge.Storage.set<string>(StorageType.PRIVATE, 'analytics.userid', userId);
        this._nativeBridge.Storage.set<number>(StorageType.PRIVATE, 'analytics.sessionid', sessionId);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    public setSessionId(sessionId: number): void {
        // session id is only valid for native process lifetime so no write necessary
        this._nativeBridge.Storage.set<number>(StorageType.PRIVATE, 'analytics.sessionid', sessionId);
    }

    public setVersions(appVersion: string, osVersion: string): void {
        this._nativeBridge.Storage.set<string>(StorageType.PRIVATE, 'analytics.appversion', appVersion);
        this._nativeBridge.Storage.set<string>(StorageType.PRIVATE, 'analytics.osversion', osVersion);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    public getIntegerId(): Promise<number> {
        return this._nativeBridge.DeviceInfo.getUniqueEventId().then(id => {
            // parse hex based native id to a safe decimal integer
            return parseInt(id.replace(/-/g, '').substring(0, 12), 16);
        });
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
