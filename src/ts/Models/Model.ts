import { WebViewError } from 'Errors/WebViewError';
import { Diagnostics } from 'Utilities/Diagnostics';
export type SchemaType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'undefined' | 'null';

export type ISchema<T extends object> = {
    [P in keyof T]: SchemaType[];
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
        if(!(key in this._schema)) {
            this.handleError(new WebViewError('Key:' + key + ' not in schema', 'SchemaError'));
        }
        if(this.checkValue(value, this._schema[key])) {
            this._data[key] = value;
        } else {
            this.handleError(new WebViewError('key: ' + key + ' with value: ' + value + ': ' + this.getTypeOf(value) + ' is not in: ' + this._schema[key], 'CheckValueError'));
        }
    }

    public get<K extends keyof T>(key: K): T[K] {
        return this._data[key];
    }

    private getTypeOf(value: any): string {
        let valueType: string = typeof value;
        if (Array.isArray(value)) {
            valueType = 'array';
        } else if (value === null) {
            valueType = 'null';
        }

        return valueType;
    }

    private checkValue(value: any, allowedTypes: SchemaType[]): boolean {
        for(const currentType of allowedTypes) {
            if(this.getTypeOf(value) === currentType) {
                return true;
            }
        }

        return false;
    }

    private handleError(error: WebViewError) {
        Diagnostics.trigger('set_model_value_failed', error);
        throw error;
    }
}
