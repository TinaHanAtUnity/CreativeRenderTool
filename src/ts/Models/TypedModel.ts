export class Optional<T> {
    private _value?: T;
    constructor(value?: T) {
        this._value = value;
    }
    public get(): T | undefined {
        return this._value;
    }
    public set(value: T) {
        this._value = value;
    }
}

type AllowedTypes = string | number | boolean | null;

export interface ISchema {
    [key: string]: AllowedTypes | Optional<AllowedTypes>;
}

export abstract class TypedModel<T extends ISchema> {
    protected _data: T;

    constructor(data: T) {
        this._data = data;
    }

    public abstract getDTO(): { [key: string]: any }

    public set<K extends keyof T>(key: K, value: T[K]): void {
        const keyType = typeof this._data[key];
        const valueType = typeof value;
        if(keyType === valueType) {
            this._data[key] = value;
        } else {
            throw new Error(key + ': ' + keyType + ' is not ' + value + ': ' + valueType);
        }
    }

    public get<K extends keyof T>(key: K): T[K] {
        return this._data[key];
    }

}
