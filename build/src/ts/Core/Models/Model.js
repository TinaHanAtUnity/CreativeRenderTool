import { WebViewError } from 'Core/Errors/WebViewError';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
export class Model {
    constructor(name, schema, data = {}) {
        this._data = {};
        this._schema = schema;
        this._name = name;
        this.setModelValues(data);
    }
    toJSON() {
        return JSON.stringify(this._data, this.serializeFilter);
    }
    set(key, value) {
        if (!(key in this._schema)) {
            this.handleError(new WebViewError('model: ' + this._name + ' key:' + key + ' not in schema', 'SchemaError'));
        }
        if (this.checkValue(value, this._schema[key])) {
            this._data[key] = value;
        }
        else {
            this.handleError(new WebViewError('model: ' + this._name + ' key: ' + key + ' with value: ' + value + ': ' + this.getTypeOf(value) + ' is not in: ' + this._schema[key], 'CheckValueError'));
        }
    }
    setModelValues(values) {
        for (const key in values) {
            if (values.hasOwnProperty(key)) {
                this.set(key, values[key]);
            }
        }
    }
    get(key) {
        return this._data[key];
    }
    handleError(error) {
        Diagnostics.trigger('set_model_value_failed', error);
        throw error;
    }
    serializeFilter(key, value) {
        return value;
    }
    getTypeOf(value) {
        let valueType = typeof value;
        if (Array.isArray(value)) {
            valueType = 'array';
        }
        else if (value === null) {
            valueType = 'null';
        }
        else if (valueType === 'number' && Number.isInteger(value)) {
            valueType = 'integer';
        }
        return valueType;
    }
    checkValue(value, allowedTypes) {
        for (const currentType of allowedTypes) {
            const valueType = this.getTypeOf(value);
            if (valueType === currentType || (currentType === 'number' && valueType === 'integer')) {
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9Nb2RlbHMvTW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQVF6RCxNQUFNLE9BQWdCLEtBQUs7SUFLdkIsWUFBWSxJQUFZLEVBQUUsTUFBa0IsRUFBRSxPQUFhLEVBQUU7UUFDekQsSUFBSSxDQUFDLEtBQUssR0FBTSxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBSU0sTUFBTTtRQUNULE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU0sR0FBRyxDQUFvQixHQUFNLEVBQUUsS0FBVztRQUM3QyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1NBQ2hIO1FBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7U0FDM0I7YUFBTTtZQUNILElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxHQUFHLEdBQUcsR0FBRyxlQUFlLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztTQUNoTTtJQUNMLENBQUM7SUFFTSxjQUFjLENBQUMsTUFBUztRQUMzQixLQUFLLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRTtZQUN0QixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzlCO1NBQ0o7SUFDTCxDQUFDO0lBRU0sR0FBRyxDQUFvQixHQUFNO1FBQ2hDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRVMsV0FBVyxDQUFDLEtBQW1CO1FBQ3JDLFdBQVcsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckQsTUFBTSxLQUFLLENBQUM7SUFDaEIsQ0FBQztJQUVTLGVBQWUsQ0FBQyxHQUFXLEVBQUUsS0FBYztRQUNqRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU8sU0FBUyxDQUFDLEtBQWM7UUFDNUIsSUFBSSxTQUFTLEdBQVcsT0FBTyxLQUFLLENBQUM7UUFDckMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLFNBQVMsR0FBRyxPQUFPLENBQUM7U0FDdkI7YUFBTSxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7WUFDdkIsU0FBUyxHQUFHLE1BQU0sQ0FBQztTQUN0QjthQUFNLElBQUksU0FBUyxLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFTLEtBQUssQ0FBQyxFQUFFO1lBQ2xFLFNBQVMsR0FBRyxTQUFTLENBQUM7U0FDekI7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBRU8sVUFBVSxDQUFDLEtBQWMsRUFBRSxZQUEwQjtRQUN6RCxLQUFLLE1BQU0sV0FBVyxJQUFJLFlBQVksRUFBRTtZQUNwQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLElBQUksU0FBUyxLQUFLLFdBQVcsSUFBSSxDQUFDLFdBQVcsS0FBSyxRQUFRLElBQUksU0FBUyxLQUFLLFNBQVMsQ0FBQyxFQUFFO2dCQUNwRixPQUFPLElBQUksQ0FBQzthQUNmO1NBQ0o7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0oifQ==