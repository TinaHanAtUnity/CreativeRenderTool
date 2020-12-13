import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { StorageType } from 'Core/Native/Storage';
export class FailedPTSEventManager extends FailedOperativeEventManager {
    constructor(coreApi, sessionId, eventId) {
        super(coreApi, sessionId, eventId);
    }
    getEventsStorageKey() {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.ptsevent';
    }
    sendFailedEvent(request, storageBridge) {
        return this._core.Storage.get(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const url = eventData.url;
            return request.get(url);
        }).then(() => {
            return this.deleteFailedEvent(storageBridge);
        }).catch(() => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }
    getPromisesForFailedEvents(request, storageBridge, keys) {
        const promises = [];
        keys.map(eventId => {
            const manager = new FailedPTSEventManager(this._core, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request, storageBridge));
        });
        return promises;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFpbGVkUFRTRXZlbnRNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9GYWlsZWRQVFNFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDdkYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRzFELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUdsRCxNQUFNLE9BQU8scUJBQXNCLFNBQVEsMkJBQTJCO0lBRWxFLFlBQVksT0FBaUIsRUFBRSxTQUFpQixFQUFFLE9BQWdCO1FBQzlELEtBQUssQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxtQkFBbUI7UUFDdEIsT0FBTyxZQUFZLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLFdBQVcsQ0FBQztJQUM1RSxDQUFDO0lBRU0sZUFBZSxDQUFDLE9BQXVCLEVBQUUsYUFBNEI7UUFDeEUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQTZCLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUN6SCxNQUFNLEdBQUcsR0FBVyxTQUFTLENBQUMsR0FBRyxDQUFDO1lBQ2xDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLHVFQUF1RTtRQUMzRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFUywwQkFBMEIsQ0FBQyxPQUF1QixFQUFFLGFBQTRCLEVBQUUsSUFBYztRQUN0RyxNQUFNLFFBQVEsR0FBdUIsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDZixNQUFNLE9BQU8sR0FBRyxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNoRixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDbkUsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0oifQ==