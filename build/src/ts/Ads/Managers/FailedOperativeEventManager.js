import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { StorageType } from 'Core/Native/Storage';
import { StorageOperation } from 'Core/Utilities/StorageOperation';
import { Url } from 'Core/Utilities/Url';
export class FailedOperativeEventManager {
    constructor(core, sessionId, eventId) {
        this._core = core;
        this._sessionId = sessionId;
        this._eventId = eventId;
    }
    getEventStorageKey() {
        return this.getEventsStorageKey() + '.' + this._eventId;
    }
    getEventsStorageKey() {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.operative';
    }
    storeFailedEvent(storageBridge, data) {
        if (this._eventId) {
            const operation = new StorageOperation(StorageType.PRIVATE);
            if (data.url) {
                let url = data.url;
                url = Url.addParameters(url, {
                    eventRetry: true
                });
                data.url = url;
            }
            operation.set(this.getEventStorageKey(), data);
            storageBridge.queue(operation);
        }
        return Promise.resolve();
    }
    deleteFailedEvent(storageBridge) {
        if (this._eventId) {
            const operation = new StorageOperation(StorageType.PRIVATE);
            operation.delete(this.getEventStorageKey());
            storageBridge.queue(operation);
        }
        return Promise.resolve();
    }
    sendFailedEvent(request, storageBridge) {
        if (this._eventId) {
            return this._core.Storage.get(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
                const url = eventData.url;
                const data = eventData.data;
                return request.post(url, data);
            }).then(() => {
                return this.deleteFailedEvent(storageBridge);
            }).catch(() => {
                // Ignore errors, if events fail to be sent, they will be retried later
            });
        }
        return Promise.resolve();
    }
    sendFailedEvents(request, storageBridge) {
        return this._core.Storage.getKeys(StorageType.PRIVATE, this.getEventsStorageKey(), false).then(keys => {
            return Promise.all(this.getPromisesForFailedEvents(request, storageBridge, keys));
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
            return Promise.resolve([]);
        });
    }
    getPromisesForFailedEvents(request, storageBridge, keys) {
        const promises = [];
        keys.map(eventId => {
            const manager = new FailedOperativeEventManager(this._core, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request, storageBridge));
        });
        return promises;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFpbGVkT3BlcmF0aXZlRXZlbnRNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9GYWlsZWRPcGVyYXRpdmVFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTFELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUVsRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVuRSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFekMsTUFBTSxPQUFPLDJCQUEyQjtJQU1wQyxZQUFZLElBQWMsRUFBRSxTQUFpQixFQUFFLE9BQWdCO1FBQzNELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQzVCLENBQUM7SUFFTSxrQkFBa0I7UUFDckIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUM1RCxDQUFDO0lBRU0sbUJBQW1CO1FBQ3RCLE9BQU8sWUFBWSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxZQUFZLENBQUM7SUFDN0UsQ0FBQztJQUVNLGdCQUFnQixDQUFDLGFBQTRCLEVBQUUsSUFBZ0M7UUFDbEYsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsTUFBTSxTQUFTLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFNUQsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNWLElBQUksR0FBRyxHQUFtQixJQUFJLENBQUMsR0FB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