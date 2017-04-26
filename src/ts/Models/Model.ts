type AllowedTypes = string | number | boolean | null | undefined | object;

export interface ISchema {
    [key: string]: AllowedTypes | AllowedTypes[];
}

export interface IRuntimeSchema {
    [key: string]: string[];
}

export abstract class Model<T extends ISchema, K> {
    protected _data: T;
    private _runtimeSchema: K;

    constructor(runtimeSchema: K) {
        this._runtimeSchema = runtimeSchema;
        // this._data = data;
    }

    public abstract getDTO(): { [key: string]: any }

    public set<K extends keyof T>(key: K, value: T[K]): void {
       // const keyType = typeof this._data[key];
       // const valueType = typeof value;
        if(this.checkValue(value, this._runtimeSchema[key])) {
            this._data[key] = value;
        } else {
//            throw new Error(key + ': ' + keyType + ' is not ' + value + ': ' + valueType);
        }
    }

    public get<K extends keyof T>(key: K): T[K] {
        return this._data[key][0];
    }

    private checkValue(value: any, allowedTypes: string[]): boolean {
        for(const currentType of allowedTypes) {
            if(typeof value === currentType) {
                return true;
            } else if(currentType === 'array' && Array.isArray(value)) {
                return true;
            } else if(currentType === 'null' && value === null) {
                return true;
            }
        }

        return false;
    }
}
