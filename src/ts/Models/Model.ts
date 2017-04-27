export type ISchema<T extends object> = {
    [P in keyof T]: ['string' | 'number' | 'boolean' | 'array' | 'object' | 'undefined' | 'null'];
};

export abstract class Model<T extends object> {
    private _data: T;
    private readonly _schema: ISchema<T>;

    constructor(schema: ISchema<T>) {
        this._data = <T>{};
        this._schema = schema;
    }

    public abstract getDTO(): { [key: string]: any }

    public set<K extends keyof T>(key: K, value: T[K]): void {
        if(this.checkValue(value, this._schema[key])) {
            this._data[key] = value;
        } else {
            const valueType = typeof value;
            throw new Error(value + ': ' + valueType + ' is not in: ' + this._schema[key]);
        }
    }

    public get<K extends keyof T>(key: K): T[K] {
        return this._data[key];
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
