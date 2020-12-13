import { StorageError, StorageType } from 'Core/Native/Storage';
export class AnalyticsStorage {
    constructor(core) {
        this._core = core;
    }
    getUserId() {
        return this.getValue('analytics.userid').then(userId => {
            if (userId) {
                return userId;
            }
            else {
                return this._core.DeviceInfo.getUniqueEventId().then(id => {
                    return id.toLowerCase().replace(/-/g, '');
                });
            }
        });
    }
    getSessionId(reinit) {
        if (reinit) {
            return this.getValue('analytics.sessionid').then(sessionId => {
                if (sessionId) {
                    return sessionId;
                }
                else {
                    return this.getIntegerId();
                }
            }).catch(() => {
                return this.getIntegerId();
            });
        }
        else {
            return this.getIntegerId();
        }
    }
    getAppVersion() {
        return this.getValue('analytics.appversion');
    }
    getOsVersion() {
        return this.getValue('analytics.osversion');
    }
    getIAPTransactions() {
        return this._core.Storage.get(StorageType.PUBLIC, 'iap.purchases').then(value => {
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
    setIds(userId, sessionId) {
        this._core.Storage.set(StorageType.PRIVATE, 'analytics.userid', userId);
        this._core.Storage.set(StorageType.PRIVATE, 'analytics.sessionid', sessionId);
        this._core.Storage.write(StorageType.PRIVATE);
    }
    setSessionId(sessionId) {
        // session id is only valid for native process lifetime so no write necessary
        this._core.Storage.set(StorageType.PRIVATE, 'analytics.sessionid', sessionId);
    }
    setVersions(appVersion, osVersion) {
        this._core.Storage.set(StorageType.PRIVATE, 'analytics.appversion', appVersion);
        this._core.Storage.set(StorageType.PRIVATE, 'analytics.osversion', osVersion);
        this._core.Storage.write(StorageType.PRIVATE);
    }
    getIntegerId() {
        return this._core.DeviceInfo.getUniqueEventId().then(id => {
            // parse hex based native id to a safe decimal integer
            return parseInt(id.replace(/-/g, '').substring(0, 12), 16);
        });
    }
    getValue(key) {
        return this._core.Storage.get(StorageType.PRIVATE, key).then(value => {
            return value;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzU3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9BbmFseXRpY3MvQW5hbHl0aWNzU3RvcmFnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBV2hFLE1BQU0sT0FBTyxnQkFBZ0I7SUFHekIsWUFBWSxJQUFjO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFTLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzNELElBQUksTUFBTSxFQUFFO2dCQUNSLE9BQU8sTUFBTSxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNILE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQ3RELE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxZQUFZLENBQUMsTUFBZTtRQUMvQixJQUFJLE1BQU0sRUFBRTtZQUNSLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBUyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDakUsSUFBSSxTQUFTLEVBQUU7b0JBQ1gsT0FBTyxTQUFTLENBQUM7aUJBQ3BCO3FCQUFNO29CQUNILE9BQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2lCQUM5QjtZQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsT0FBTyxJQUFJLENB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