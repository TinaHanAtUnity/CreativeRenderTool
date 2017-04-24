import { NativeBridge } from 'Native/NativeBridge';
import { StorageType, StorageError } from 'Native/Api/Storage';
import { IAnalyticsCommonObject, IAnalyticsObject } from "Analytics/AnalyticsProtocol";

export class AnalyticsStorage {
    private _nativeBridge: NativeBridge;
    private _common: IAnalyticsCommonObject;
    private _events: IAnalyticsObject[];

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._events = [];
    }

    public setCommonObject(common: IAnalyticsCommonObject): void {
        this._common = common;
    }

    public getCommonObject(): any {
        return this._common;
    }

    public pushEvent(event: IAnalyticsObject): void {
        this._events.push(event);
        // todo: write to native storage
    }

    public getEvents(): IAnalyticsObject[] {
        return this._events;
        // todo: fetch from native storage
    }

    public clearEvents(): void {
        this._events = [];
        // todo: clear native analytics storage
    }

    public getValue(key: string): Promise<string | null> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(([error]) => {
            switch (error) {
                case StorageError[StorageError.COULDNT_GET_VALUE]:
                    return null;

                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    return null;

                default:
                    throw new Error(error);
            }
        });
    }
}
