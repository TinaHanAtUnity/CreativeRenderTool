type AllowedTypes = string | number | boolean | null | undefined | object;

export interface ISchema {
    [key: string]: [AllowedTypes | AllowedTypes[], string[]];
}

export abstract class Model<T extends ISchema> {
    protected _data: T;

    constructor(data: T) {
        this._data = data;
    }

    public abstract getDTO(): { [key: string]: any }

    public set<K extends keyof T>(key: K, value: T[K][0]): void {
        const keyType = typeof this._data[key];
        const valueType = typeof value;
        if(this.checkValue(value, this._data[key][1])) {
            this._data[key][0] = value;
        } else {
            throw new Error(key + ': ' + keyType + ' is not ' + value + ': ' + valueType);
        }
    }

    public get<K extends keyof T>(key: K): T[K][0] {
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
