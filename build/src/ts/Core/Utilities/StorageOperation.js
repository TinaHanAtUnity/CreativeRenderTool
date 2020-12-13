export var StorageCommandType;
(function (StorageCommandType) {
    StorageCommandType[StorageCommandType["SET"] = 0] = "SET";
    StorageCommandType[StorageCommandType["DELETE"] = 1] = "DELETE";
})(StorageCommandType || (StorageCommandType = {}));
export class StorageOperation {
    constructor(type) {
        this._type = type;
        this._batch = {
            commands: []
        };
    }
    set(key, value) {
        this._batch.commands.push({
            type: StorageCommandType.SET,
            key: key,
            value: value
        });
    }
    delete(key) {
        this._batch.commands.push({
            type: StorageCommandType.DELETE,
            key: key
        });
    }
    getType() {
        return this._type;
    }
    getBatch() {
        return this._batch;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmFnZU9wZXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL1V0aWxpdGllcy9TdG9yYWdlT3BlcmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sQ0FBTixJQUFZLGtCQUdYO0FBSEQsV0FBWSxrQkFBa0I7SUFDMUIseURBQUcsQ0FBQTtJQUNILCtEQUFNLENBQUE7QUFDVixDQUFDLEVBSFcsa0JBQWtCLEtBQWxCLGtCQUFrQixRQUc3QjtBQVlELE1BQU0sT0FBTyxnQkFBZ0I7SUFJekIsWUFBWSxJQUFpQjtRQUN6QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ1YsUUFBUSxFQUFFLEVBQUU7U0FDZixDQUFDO0lBQ04sQ0FBQztJQUVNLEdBQUcsQ0FBSSxHQUFXLEVBQUUsS0FBUTtRQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDdEIsSUFBSSxFQUFFLGtCQUFrQixDQUFDLEdBQUc7WUFDNUIsR0FBRyxFQUFFLEdBQUc7WUFDUixLQUFLLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBVztRQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7WUFDdEIsSUFBSSxFQUFFLGtCQUFrQixDQUFDLE1BQU07WUFDL0IsR0FBRyxFQUFFLEdBQUc7U0FDWCxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUN0QixDQUFDO0lBRU0sUUFBUTtRQUNYLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0NBQ0oifQ==