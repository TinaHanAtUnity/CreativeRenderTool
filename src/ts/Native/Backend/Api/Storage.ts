export class Storage {

    public static get(storageType: string, key: string) {
        const rawStorage = window.sessionStorage.getItem(storageType);
        if(rawStorage) {
            const splitKeys = key.split('.');
            const lastKey = splitKeys[splitKeys.length - 1];
            const object = Storage.findObject(JSON.parse(rawStorage), Storage.getParentKey(key));
            if(!object) {
                throw ['COULDNT_GET_VALUE', key];
            }
            if(lastKey in object) {
                return object[lastKey];
            }
        }
        throw ['COULDNT_GET_VALUE', key];
    }

    public static set(storage: string, key: string, value: any) {
        return;
    }

    public static delete(storage: string, key: string) {
        return;
    }

    public static getKeys(storage: string, key: string, recursive: boolean) {
        return [];
    }

    public static write(storage: string) {
        return;
    }

    private static findObject(storage: any, key: string) {
        if (!key.length) {
            return storage;
        }

        const objects = key.split('.');
        let parentObject = storage;

        for(let i = 0; i < objects.length; ++i) {
            if(objects[i] in parentObject) {
                parentObject = parentObject[objects[i]];
            } else {
                return null;
            }
        }

        return parentObject;
    }

    private static getParentKey(key: string) {
        const splitKey = key.split('.');
        splitKey.pop();
        return splitKey.join('.');
    }

}