import { BackendApi } from 'Backend/BackendApi';
import { StorageType } from 'Core/Native/Storage';

interface IStorageData {
    [key: string]: IStorageData;
}

export class Storage extends BackendApi {

    private _storage: IStorageData = {};
    private _dirty: boolean = false;

    public set<T>(storageType: StorageType, key: string, value: T): Promise<void> {
        this._dirty = true;
        this._storage = this.setInMemoryValue(this._storage, key, value);
        return Promise.resolve(void(0));
    }

    public get<T>(storageType: StorageType, key: string): Promise<T> {
        const retValue = this.getInMemoryValue(this._storage, key);
        if(!retValue) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
        return Promise.resolve(<T>retValue);
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        return Promise.resolve(this.getInMemoryKeys(this._storage, key));
    }

    public write(storageType: StorageType): Promise<void> {
        this._dirty = false;
        return Promise.resolve(void(0));
    }

    public delete(storageType: StorageType, key: string): Promise<void> {
        this._dirty = true;
        this._storage = this.deleteInMemoryValue(this._storage, key);
        return Promise.resolve(void(0));
    }

    public isDirty(): boolean {
        return this._dirty;
    }

    private setInMemoryValue<T>(storage: IStorageData, key: string, value: T): {} {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                storage[keyArray[0]] = {};
            }

            storage[keyArray[0]] = this.setInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'), value);
            return storage;
        } else {
            // tslint:disable-next-line
            storage[keyArray[0]] = <any>value;
            return storage;
        }
    }

    private getInMemoryValue(storage: IStorageData, key: string): unknown {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return null;
            }

            return this.getInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            return storage[key];
        }
    }

    private getInMemoryKeys(storage: IStorageData, key: string): string[] {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return [];
            }

            return this.getInMemoryKeys(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            if(!storage[key]) {
                return [];
            }

            const retArray: string[] = [];
            for(const property in storage[key]) {
                if(storage.hasOwnProperty(key)) {
                    retArray.push(property);
                }
            }

            return retArray;
        }
    }

    private deleteInMemoryValue(storage: IStorageData, key: string): {} {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                storage[keyArray[0]] = {};
            }

            storage[keyArray[0]] = this.deleteInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
            return storage;
        } else {
            delete storage[keyArray[0]];
            return storage;
        }
    }

    public hasFileEntry(fileId: string): boolean {
        const splitFileId = fileId.split('.')[0];
        if(this._storage && this._storage.cache && this._storage.cache.files && this._storage.cache.files[splitFileId]) {
            return true;
        }

        return false;
    }

    public hasCampaignEntry(id: string): boolean {
        if(this._storage && this._storage.cache && this._storage.cache.campaigns && this._storage.cache.campaigns[id]) {
            return true;
        }

        return false;
    }

    public setStorageContents(contents: IStorageData): void {
        this._storage = contents;
    }

}
