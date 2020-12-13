import { StorageType } from 'Core/Native/Storage';
import { Observable0 } from 'Core/Utilities/Observable';
import { StorageCommandType } from 'Core/Utilities/StorageOperation';
export class StorageBridge {
    constructor(core, interval) {
        this.onPublicStorageWrite = new Observable0();
        this.onPrivateStorageWrite = new Observable0();
        this._storageBatchInterval = 1000; // default value is 1000 milliseconds
        this._core = core;
        this._publicStorageQueue = {
            commands: []
        };
        this._privateStorageQueue = {
            commands: []
        };
        if (interval) {
            this._storageBatchInterval = interval;
        }
    }
    queue(operation) {
        const type = operation.getType();
        const batch = operation.getBatch();
        // empty batches are valid, just cleanly ignore them
        if (batch.commands.length === 0) {
            return;
        }
        if (type === StorageType.PUBLIC) {
            this._publicStorageQueue.commands = this._publicStorageQueue.commands.concat(batch.commands);
        }
        else {
            this._privateStorageQueue.commands = this._privateStorageQueue.commands.concat(batch.commands);
        }
        if (!this._storageBatchTimer) {
            this._storageBatchTimer = window.setTimeout(() => {
                this.executeBatch(StorageType.PUBLIC, this._publicStorageQueue);
                this.executeBatch(StorageType.PRIVATE, this._privateStorageQueue);
                delete this._storageBatchTimer;
            }, this._storageBatchInterval);
        }
    }
    isEmpty() {
        return this._publicStorageQueue.commands.length === 0 && this._privateStorageQueue.commands.length === 0;
    }
    executeBatch(type, batch) {
        if (batch.commands.length === 0) {
            return;
        }
        let command;
        for (command of batch.commands) {
            if (command.type === StorageCommandType.SET) {
                this._core.Storage.set(type, command.key, command.value);
            }
            else if (command.type === StorageCommandType.DELETE) {
                this._core.Storage.delete(type, command.key);
            }
        }
        this._core.Storage.write(type);
        if (type === StorageType.PUBLIC) {
            this._publicStorageQueue = {
                commands: []
            };
            this.onPublicStorageWrite.trigger();
        }
        else {
            this._privateStorageQueue = {
                commands: []
            };
            this.onPrivateStorageWrite.trigger();
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmFnZUJyaWRnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL1V0aWxpdGllcy9TdG9yYWdlQnJpZGdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFrQyxrQkFBa0IsRUFBb0IsTUFBTSxpQ0FBaUMsQ0FBQztBQUV2SCxNQUFNLE9BQU8sYUFBYTtJQVd0QixZQUFZLElBQWMsRUFBRSxRQUFpQjtRQVZ0Qyx5QkFBb0IsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLDBCQUFxQixHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFPekMsMEJBQXFCLEdBQVcsSUFBSSxDQUFDLENBQUMscUNBQXFDO1FBRy9FLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxtQkFBbUIsR0FBRztZQUN2QixRQUFRLEVBQUUsRUFBRTtTQUNmLENBQUM7UUFDRixJQUFJLENBQUMsb0JBQW9CLEdBQUc7WUFDeEIsUUFBUSxFQUFFLEVBQUU7U0FDZixDQUFDO1FBRUYsSUFBSSxRQUFRLEVBQUU7WUFDVixJQUFJLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDO1NBQ3pDO0lBQ0wsQ0FBQztJQUVNLEtBQUssQ0FBQyxTQUEyQjtRQUNwQyxNQUFNLElBQUksR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDakMsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRW5DLG9EQUFvRDtRQUNwRCxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM3QixPQUFPO1NBQ1Y7UUFFRCxJQUFJLElBQUksS0FBSyxXQUFXLENBQUMsTUFBTSxFQUFF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