import { StorageApi, StorageType } from 'Core/Native/Storage';

export class UserCountData {

    public static setRequestCount(requestCount: number, storage: StorageApi): void {
        if (requestCount) {
            storage.set<number>(StorageType.PRIVATE, 'user.requestCount', requestCount);
            storage.write(StorageType.PRIVATE);
        }
    }

    public static setClickCount(clickCount: number, storage: StorageApi): void {
        if (clickCount) {
            storage.set<number>(StorageType.PRIVATE, 'user.clickCount', clickCount);
            storage.write(StorageType.PRIVATE);
        }
    }

    public static setPriorRequestToReadyTime(requestToReadyTime: number, storage: StorageApi): void {
        if (requestToReadyTime) {
            storage.set<number>(StorageType.PRIVATE, 'user.requestToReadyTime', requestToReadyTime);
            storage.write(StorageType.PRIVATE);
        }
    }

    public static getRequestCount(storage: StorageApi): Promise<number | void> {
        return storage.get<number>(StorageType.PRIVATE, 'user.requestCount').then((requestCount) => {
            return requestCount;
        }).catch(() => {
            return 0;
        });
    }

    public static getClickCount(storage: StorageApi): Promise<number | void> {
        return storage.get<number>(StorageType.PRIVATE, 'user.clickCount').then((clickCount) => {
            return clickCount;
        }).catch(() => {
            return 0;
        });
    }

    public static getPriorRequestToReadyTime(storage: StorageApi): Promise<number | void> {
        return storage.get<number>(StorageType.PRIVATE, 'user.requestToReadyTime').then((requestReadyTime) => {
            return requestReadyTime;
        }).catch(() => {
            return 0;
        });
    }

}
