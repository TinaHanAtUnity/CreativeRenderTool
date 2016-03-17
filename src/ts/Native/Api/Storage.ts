import {NativeBridge} from 'Native/NativeBridge';

export enum StorageType {
    PRIVATE,
    PUBLIC
}

export class Storage {

    public static read(type: StorageType): Promise<void> {
        return NativeBridge.getInstance().invoke<void>('Storage', 'read', [StorageType[type]]);
    }

    public static write(type: StorageType): Promise<void> {
        return NativeBridge.getInstance().invoke<void>('Storage', 'write', [StorageType[type]]);
    }

    public static get<T>(type: StorageType, key: string): Promise<T> {
        return NativeBridge.getInstance().invoke<T>('Storage', 'get', [StorageType[type], key]);
    }

    public static set<T>(type: StorageType, key: string, value: T): Promise<void> {
        return NativeBridge.getInstance().invoke<void>('Storage', 'set', [StorageType[type], key, value]);
    }

    public static delete(type: StorageType, key: string): Promise<void> {
        return NativeBridge.getInstance().invoke<void>('Storage', 'delete', [StorageType[type], key]);
    }

    public static clear(type: StorageType): Promise<void> {
        return NativeBridge.getInstance().invoke<void>('Storage', 'clear', [StorageType[type]]);
    }

    public static getKeys(type: StorageType, key: string, recursive: boolean): Promise<string[]> {
        return NativeBridge.getInstance().invoke<string[]>('Storage', 'getKeys', [StorageType[type], key, recursive]);
    }
}
