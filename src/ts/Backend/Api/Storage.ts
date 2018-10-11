import { StorageType } from 'Core/Native/Storage';

export class Storage {

    private static _storage = {};
    private static _dirty: boolean = false;

    public static set<T>(storageType: StorageType, key: string, value: T): Promise<void> {
        Storage._dirty = true;
        Storage._storage = Storage.setInMemoryValue(Storage._storage, key, value);
        return Promise.resolve(void(0));
    }

    public static get<T>(storageType: StorageType, key: string): Promise<T> {
        const retValue = Storage.getInMemoryValue(Storage._storage, key);
        if(!retValue) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
        return Promise.resolve(retValue);
    }

    public static getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        return Promise.resolve(Storage.getInMemoryKeys(Storage._storage, key));
    }

    public static write(storageType: StorageType): Promise<void> {
        Storage._dirty = false;
        return Promise.resolve(void(0));
    }

    public static delete(storageType: StorageType, key: string): Promise<void> {
        Storage._dirty = true;
        Storage._storage = Storage.deleteInMemoryValue(Storage._storage, key);
        return Promise.resolve(void(0));
    }

    public static isDirty(): boolean {
        return Storage._dirty;
    }

    private static setInMemoryValue(storage: { [key: string]: any }, key: string, value: any): {} {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                storage[keyArray[0]] = {};
            }

            storage[keyArray[0]] = Storage.setInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'), value);
            return storage;
        } else {
            storage[keyArray[0]] = value;
            return storage;
        }
    }

    private static getInMemoryValue(storage: { [key: string]: any }, key: string): any {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return null;
            }

            return Storage.getInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            return storage[key];
        }
    }

    private static getInMemoryKeys(storage: { [key: string]: any }, key: string): string[] {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return [];
            }

            return Storage.getInMemoryKeys(storage[keyArray[0]], keyArray.slice(1).join('.'));
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

    private static deleteInMemoryValue(storage: { [key: string]: any }, key: string): {} {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                storage[keyArray[0]] = {};
            }

            storage[keyArray[0]] = Storage.deleteInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
            return storage;
        } else {
            delete storage[keyArray[0]];
            return storage;
        }
    }

}
