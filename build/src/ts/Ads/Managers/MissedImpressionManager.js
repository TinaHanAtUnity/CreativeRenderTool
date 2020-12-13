import { StorageType } from 'Core/Native/Storage';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
export class MissedImpressionManager {
    constructor(core) {
        this._core = core;
        this._core.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
    }
    onStorageSet(eventType, data) {
        if (data && data.mediation && data.mediation.missedImpressionOrdinal && data.mediation.missedImpressionOrdinal.value) {
            HttpKafka.sendEvent('ads.sdk2.events.missedimpression.json', KafkaCommonObjectType.ANONYMOUS, {
                ordinal: data.mediation.missedImpressionOrdinal.value
            });
            this._core.Storage.delete(StorageType.PUBLIC, 'mediation.missedImpressionOrdinal');
            this._core.Storage.write(StorageType.PUBLIC);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWlzc2VkSW1wcmVzc2lvbk1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL01pc3NlZEltcHJlc3Npb25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFXNUUsTUFBTSxPQUFPLHVCQUF1QjtJQUdoQyxZQUFZLElBQWM7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFnQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlILENBQUM7SUFFTyxZQUFZLENBQUMsU0FBaUIsRUFBRSxJQUFrQztRQUN0RSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEVBQUU7WUFDbEgsU0FBUyxDQUFDLFNBQVMsQ0FBQyx1Q0FBdUMsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLEVBQUU7Z0JBQzFGLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLEtBQUs7YUFDeEQsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2hEO0lBQ0wsQ0FBQztDQUNKIn0=