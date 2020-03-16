import { StorageType } from 'Core/Native/Storage';
import { ICoreApi } from 'Core/ICore';

export class UserCountData {

    public static setRequestCount(requestCount: number, core: ICoreApi): void {
        if (requestCount) {
            core.Storage.set<number>(StorageType.PRIVATE, 'user.requestCount', requestCount);
            core.Storage.write(StorageType.PRIVATE);
        }
    }

    public static setClickCount(clickCount: number, core: ICoreApi): void {
        if (clickCount) {
            core.Storage.set<number>(StorageType.PRIVATE, 'user.clickCount', clickCount);
            core.Storage.write(StorageType.PRIVATE);
        }
    }

    public static setPriorRequestToReadyTime(requestToReadyTime: number, core: ICoreApi): void {
        if (requestToReadyTime) {
            core.Storage.set<number>(StorageType.PRIVATE, 'user.requestToReadyTime', requestToReadyTime);
            core.Storage.write(StorageType.PRIVATE);
        }
    }

    public static getRequestCount(core: ICoreApi): Promise<number | void> {
        return core.Storage.get<number>(StorageType.PRIVATE, 'user.requestCount').then((requestCount) => {
            return requestCount;
        }).catch(() => {
            return 0;
        });
    }

    public static getClickCount(core: ICoreApi): Promise<number | void> {
        return core.Storage.get<number>(StorageType.PRIVATE, 'user.clickCount').then((clickCount) => {
            return clickCount;
        }).catch(() => {
            return 0;
        });
    }

    public static getPriorRequestToReadyTime(core: ICoreApi): Promise<number | void> {
        return core.Storage.get<number>(StorageType.PRIVATE, 'user.requestToReadyTime').then((requestReadyTime) => {
            return requestReadyTime;
        }).catch(() => {
            return 0;
        });
    }

}
