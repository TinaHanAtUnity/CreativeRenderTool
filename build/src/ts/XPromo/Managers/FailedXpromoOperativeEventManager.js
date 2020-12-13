import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
export class FailedXpromoOperativeEventManager extends FailedOperativeEventManager {
    getEventsStorageKey() {
        return SessionUtils.getSessionStorageKey(this._sessionId) + '.xpromooperative';
    }
    sendFailedEvent(request, storageBridge) {
        return this._core.Storage.get(StorageType.PRIVATE, this.getEventStorageKey()).then((eventData) => {
            const kafkaType = eventData.kafkaType;
            const data = eventData.data;
            return HttpKafka.sendEvent(kafkaType, KafkaCommonObjectType.PERSONAL, JSON.parse(data));
        }).then(() => {
            return this.deleteFailedEvent(storageBridge);
        }).catch((error) => {
            // Ignore errors, if events fail to be sent, they will be retried later
        });
    }
    getPromisesForFailedEvents(request, storageBridge, keys) {
        const promises = [];
        keys.map(eventId => {
            const manager = new FailedXpromoOperativeEventManager(this._core, this._sessionId, eventId);
            promises.push(manager.sendFailedEvent(request, storageBridge));
        });
        return promises;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFpbGVkWHByb21vT3BlcmF0aXZlRXZlbnRNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1hQcm9tby9NYW5hZ2Vycy9GYWlsZWRYcHJvbW9PcGVyYXRpdmVFdmVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDdkYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTFELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHNUUsTUFBTSxPQUFPLGlDQUFrQyxTQUFRLDJCQUEyQjtJQUV2RSxtQkFBbUI7UUFDdEIsT0FBTyxZQUFZLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLGtCQUFrQixDQUFDO0lBQ25GLENBQUM7SUFFTSxlQUFlLENBQUMsT0FBdUIsRUFBRSxhQUE0QjtRQUN4RSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBNkIsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQ3pILE1BQU0sU0FBUyxHQUFXLFNBQVMsQ0FBQyxTQUFTLENBQUM7WUFDOUMsTUFBTSxJQUFJLEdBQVcsU0FBUyxDQUFDLElBQUksQ0FBQztZQUNwQyxPQUFPLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDNUYsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ2YsdUVBQXVFO1FBQzNFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVTLDBCQUEwQixDQUFDLE9BQXVCLEVBQUUsYUFBNEIsRUFBRSxJQUFjO1FBQ3RHLE1BQU0sUUFBUSxHQUF1QixFQUFFLENBQUM7UUFDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNmLE1BQU0sT0FBTyxHQUFHLElBQUksaUNBQWlDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQzVGLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7Q0FDSiJ9